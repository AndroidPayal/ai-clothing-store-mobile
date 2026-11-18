import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import axios from "axios";
import RazorpayCheckout from "react-native-razorpay";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config/api";

type Customer = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
};

type PaymentDetails = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

export default function CheckoutScreen() {
  const { items, clearCart } = useCart();
  const { token, isLoading: authLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<Customer>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pinCode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PaymentDetails | null>(
    null,
  );

  const idempotencyRef = useRef<{
    fingerprint: string;
    key: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated]);

  const updateField = (field: keyof Customer, value: string) => {
    if (field === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (field === "pinCode") {
      value = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const fullName = formData.fullName.trim();
  const phone = formData.phone;
  const address = formData.address.trim();
  const city = formData.city.trim();
  const pinCode = formData.pinCode;

  const isFormValid =
    fullName.length >= 2 &&
    fullName.length <= 80 &&
    /^[6-9]\d{9}$/.test(phone) &&
    address.length >= 5 &&
    address.length <= 300 &&
    city.length >= 2 &&
    city.length <= 80 &&
    /^\d{6}$/.test(pinCode);

  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  function getIdempotencyKey() {
    const fingerprint = JSON.stringify({
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      customer: {
        fullName,
        phone,
        address,
        city,
        pinCode,
      },
    });

    if (idempotencyRef.current?.fingerprint === fingerprint) {
      return idempotencyRef.current.key;
    }

    const key = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${Math.random().toString(36).slice(2)}`;

    idempotencyRef.current = { fingerprint, key };

    return key;
  }

  async function confirmPayment(payment: PaymentDetails) {
    if (!token) {
      throw new Error("Please log in again to verify your payment.");
    }

    await axios.post(
      `${API_URL}/api/payment/verify`,
      {
        razorpayOrderId: payment.razorpay_order_id,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    setPendingPayment(null);

    try {
      await clearCart();
    } catch (error) {
      console.error("CART CLEAR ERROR:", error);
    }

    Alert.alert(
      "Order confirmed!",
      "Your payment was successful and your order has been placed.",
      [
        {
          text: "Continue shopping",
          onPress: () => router.replace("/"),
        },
      ],
    );
  }

  async function handleRetryVerification() {
    if (!pendingPayment || isProcessing) return;

    try {
      setIsProcessing(true);
      await confirmPayment(pendingPayment);
    } catch (error) {
      console.error("PAYMENT VERIFICATION ERROR:", error);

      Alert.alert(
        "Verification pending",
        "We couldn't confirm your payment yet. Please retry verification. Do not make another payment.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handlePlaceOrder() {
    if (isProcessing) return;

    if (!token) {
      Alert.alert("Login required", "Please log in before checkout.");
      router.replace("/login");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Empty bag", "Please add products before checkout.");
      return;
    }

    const unavailableItems = items.filter(
      (item) => item.product.inStock === false,
    );

    if (unavailableItems.length > 0) {
      Alert.alert(
        "Products unavailable",
        "Some products are out of stock. Please return to your bag and remove them before checkout.",
        [
          {
            text: "Go to Bag",
            onPress: () => router.replace("/cart"),
          },
        ],
      );
      return;
    }

    if (!isFormValid) {
      Alert.alert(
        "Invalid details",
        "Please check your name, mobile number, address, city and PIN code.",
      );
      return;
    }

    if (!RAZORPAY_KEY) {
      Alert.alert(
        "Payment configuration missing",
        "Please configure EXPO_PUBLIC_RAZORPAY_KEY_ID.",
      );
      return;
    }

    try {
      setIsProcessing(true);

      const idempotencyKey = getIdempotencyKey();

      // Step 1: Create order and reserve inventory on the server.
      const orderResponse = await axios.post(
        `${API_URL}/api/payment/create-order`,
        {
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customer: {
            fullName,
            phone,
            address,
            city,
            pinCode,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
        },
      );

      const razorpayOrder = orderResponse.data?.order;

      if (
        !razorpayOrder?.id ||
        typeof razorpayOrder.amount !== "number" ||
        !razorpayOrder.currency
      ) {
        throw new Error("Invalid payment order received from server.");
      }

      // Step 2: Open native Razorpay checkout.
      const paymentResult = await RazorpayCheckout.open({
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SOZAN / NAZM",
        description: "Contemporary Indian Wear",
        order_id: razorpayOrder.id,
        prefill: {
          name: fullName,
          contact: phone,
        },
        theme: {
          color: "#A36D5D",
        },
      });

      const payment: PaymentDetails = {
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      };

      // Step 3: Verify payment on your backend.
      try {
        await confirmPayment(payment);
      } catch (error) {
        console.error("PAYMENT VERIFICATION ERROR:", error);

        setPendingPayment(payment);

        Alert.alert(
          "Payment received",
          "Your payment was completed, but order verification is pending. Please retry verification. Do not pay again.",
        );
      }
    } catch (error: any) {
      console.error("CHECKOUT ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.description ||
        error?.message ||
        "Unable to process your order. Please try again.";

      Alert.alert("Checkout", message);
    } finally {
      setIsProcessing(false);
    }
  }

  if (authLoading || items.length === 0) {
    return (
      <View style={styles.center}>
        {authLoading ? (
          <ActivityIndicator size="large" color="#A36D5D" />
        ) : (
          <>
            <Text style={styles.brand}>SOZAN / NAZM</Text>
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.emptySubtitle}>
              Find something that feels like you.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.buttonText}>EXPLORE COLLECTION</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const inputFields: {
    key: keyof Customer;
    label: string;
    placeholder: string;
    keyboardType?: "default" | "phone-pad" | "number-pad";
    multiline?: boolean;
    maxLength: number;
  }[] = [
    {
      key: "fullName",
      label: "FULL NAME",
      placeholder: "Your full name",
      maxLength: 80,
    },
    {
      key: "phone",
      label: "PHONE NUMBER",
      placeholder: "10-digit mobile number",
      keyboardType: "phone-pad",
      maxLength: 10,
    },
    {
      key: "address",
      label: "ADDRESS",
      placeholder: "House number, street, locality...",
      multiline: true,
      maxLength: 300,
    },
    {
      key: "city",
      label: "CITY",
      placeholder: "Your city",
      maxLength: 80,
    },
    {
      key: "pinCode",
      label: "PIN CODE",
      placeholder: "6-digit PIN code",
      keyboardType: "number-pad",
      maxLength: 6,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandHeader}>
        <Text style={styles.brand}>SOZAN / NAZM</Text>
        <Text style={styles.brandCaption}>CONTEMPORARY INDIAN WEAR</Text>
      </View>

      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>YOUR SELECTION · CHECKOUT</Text>
        <Text style={styles.title}>Almost yours.</Text>
        <Text style={styles.subtitle}>Where should we send your pieces?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>01 — DELIVERY</Text>
        <Text style={styles.sectionTitle}>Shipping address</Text>
        <Text style={styles.sectionDescription}>
          Enter your details for a smooth delivery.
        </Text>

        {inputFields.map((field) => (
          <View key={field.key}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.addressInput]}
              placeholder={field.placeholder}
              placeholderTextColor="#A49A8E"
              value={formData[field.key]}
              onChangeText={(value) => updateField(field.key, value)}
              keyboardType={field.keyboardType || "default"}
              multiline={field.multiline}
              maxLength={field.maxLength}
              editable={!isProcessing}
              autoCapitalize={
                field.key === "phone" || field.key === "pinCode"
                  ? "none"
                  : "words"
              }
            />
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.sectionEyebrow}>02 — YOUR SELECTION</Text>
        <Text style={styles.sectionTitle}>Order summary</Text>

        {items.map((item) => (
          <View key={item.product.id} style={styles.summaryRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product.title}
              </Text>
              <Text style={styles.quantity}>QUANTITY · {item.quantity}</Text>
            </View>

            <Text style={styles.price}>
              ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalCaption}>ORDER SUBTOTAL</Text>
          </View>
          <Text style={styles.total}>₹{cartTotal.toLocaleString("en-IN")}</Text>
        </View>

        <Text style={styles.note}>
          Final payable amount is calculated securely by our server. Shipping
          and applicable charges are confirmed during checkout.
        </Text>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.sectionEyebrow}>03 — PAYMENT</Text>
        <Text style={styles.paymentTitle}>Secure checkout</Text>
        <Text style={styles.note}>
          Your payment will be securely processed through Razorpay.
        </Text>
        <View style={styles.secureRow}>
          <Text style={styles.secureSymbol}>✓</Text>
          <Text style={styles.secureText}>Secure payment processing</Text>
        </View>
      </View>

      {pendingPayment ? (
        <Pressable
          style={[styles.button, isProcessing && styles.disabledButton]}
          disabled={isProcessing}
          onPress={handleRetryVerification}
        >
          {isProcessing ? (
            <ActivityIndicator color="#F7F4EE" />
          ) : (
            <Text style={styles.buttonText}>RETRY PAYMENT VERIFICATION</Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          style={[
            styles.button,
            (!isFormValid || isProcessing) && styles.disabledButton,
          ]}
          disabled={!isFormValid || isProcessing}
          onPress={handlePlaceOrder}
        >
          {isProcessing ? (
            <ActivityIndicator color="#F7F4EE" />
          ) : (
            <Text style={styles.buttonText}>
              PAY ₹{cartTotal.toLocaleString("en-IN")} & PLACE ORDER →
            </Text>
          )}
        </Pressable>
      )}

      <Text style={styles.bottomNote}>
        THOUGHTFULLY CRAFTED. MADE TO FEEL YOURS.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 45,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F4EE",
    padding: 24,
  },
  brandHeader: {
    alignItems: "center",
    paddingBottom: 23,
    borderBottomWidth: 1,
    borderBottomColor: "#E5DED3",
    marginBottom: 28,
  },
  brand: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#25221F",
  },
  brandCaption: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#81776D",
    marginTop: 6,
  },
  headingSection: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.8,
    color: "#A36D5D",
    marginBottom: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 36,
    color: "#25221F",
    fontWeight: "500",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: "#776C62",
    marginTop: 9,
    lineHeight: 21,
  },
  section: {
    borderWidth: 1,
    borderColor: "#E5DED3",
    padding: 18,
    marginBottom: 20,
  },
  sectionEyebrow: {
    fontSize: 9,
    letterSpacing: 1.7,
    color: "#A36D5D",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 24,
    color: "#25221F",
    marginTop: 9,
    marginBottom: 8,
    fontWeight: "500",
  },
  sectionDescription: {
    fontSize: 12,
    color: "#81776D",
    marginBottom: 8,
    lineHeight: 18,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#776C62",
    marginTop: 18,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5DED3",
    paddingHorizontal: 13,
    paddingVertical: 13,
    color: "#25221F",
    fontSize: 14,
    backgroundColor: "#FBF9F5",
  },
  addressInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  summary: {
    borderWidth: 1,
    borderColor: "#E5DED3",
    padding: 18,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5DED3",
  },
  productInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productName: {
    fontSize: 14,
    color: "#25221F",
    lineHeight: 20,
  },
  quantity: {
    fontSize: 9,
    letterSpacing: 1,
    color: "#81776D",
    marginTop: 6,
  },
  price: {
    fontSize: 14,
    color: "#25221F",
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#25221F",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#25221F",
  },
  totalCaption: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#81776D",
    marginTop: 5,
  },
  total: {
    fontSize: 23,
    color: "#25221F",
    fontWeight: "600",
  },
  note: {
    fontSize: 11,
    color: "#81776D",
    lineHeight: 18,
    marginTop: 12,
  },
  paymentInfo: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5DED3",
    paddingVertical: 19,
    marginBottom: 23,
  },
  paymentTitle: {
    fontSize: 20,
    color: "#25221F",
    marginTop: 9,
    fontWeight: "500",
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  secureSymbol: {
    fontSize: 13,
    color: "#66816A",
    fontWeight: "700",
    marginRight: 8,
  },
  secureText: {
    fontSize: 11,
    color: "#776C62",
  },
  button: {
    minHeight: 54,
    backgroundColor: "#25221F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  buttonText: {
    color: "#F7F4EE",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.45,
  },
  bottomNote: {
    textAlign: "center",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#81776D",
    marginTop: 22,
  },
  emptyTitle: {
    fontSize: 23,
    color: "#25221F",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#776C62",
    marginTop: 8,
    marginBottom: 24,
  },
});
