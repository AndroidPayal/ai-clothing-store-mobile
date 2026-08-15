import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { useCart } from "@/context/CartContext";

export default function CheckoutScreen() {
  const { items } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pinCode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.city.trim() !== "" &&
    formData.pinCode.trim() !== "";

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>

        <Pressable style={styles.button} onPress={() => router.push("/")}>
          <Text style={styles.buttonText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }
  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Checkout</Text>

      <Text style={styles.sectionTitle}>Shipping Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(value) => updateField("fullName", value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone}
        onChangeText={(value) => updateField("phone", value)}
        keyboardType="phone-pad"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Address"
        value={formData.address}
        onChangeText={(value) => updateField("address", value)}
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.city}
        onChangeText={(value) => updateField("city", value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Pin Code"
        value={formData.pinCode}
        onChangeText={(value) => updateField("pinCode", value)}
        keyboardType="number-pad"
      />

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Order Total</Text>
        <Text style={styles.total}>₹{cartTotal}</Text>
      </View>

      <Pressable
        style={[
          styles.button,
          (!isFormValid || isProcessing) && styles.disabledButton,
        ]}
        disabled={!isFormValid || isProcessing}
        onPress={() => {
          // Razorpay will be added in the next step.
          console.log("CHECKOUT DATA:", {
            items: items,
            total: cartTotal,
            customer: formData,
          });
        }}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Pay ₹{cartTotal} & Place Order</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  summaryLabel: {
    fontSize: 18,
    fontWeight: "600",
  },

  total: {
    fontSize: 22,
    fontWeight: "700",
  },

  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
});
