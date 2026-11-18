import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { getOrderById } from "@/api/orderApi";

type Order = {
  _id: string;
  items: {
    product: {
      title: string;
      price: number;
      thumbnail: string;
    };
    quantity: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pinCode: string;
  };
  payment?: {
    razorpayPaymentId?: string;
  };
};

const COLORS = {
  background: "#F7F4EE",
  ink: "#25221F",
  muted: "#776C62",
  accent: "#A36D5D",
  border: "#E5DED3",
  white: "#FFFFFF",
  green: "#54745A",
};

const formatPrice = (price: number) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Order ID is missing.");
      setIsLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error("ORDER DETAILS ERROR:", err);
        setError("Unable to load order details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading your order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={42} color={COLORS.muted} />
        <Text style={styles.error}>{error || "Order not found."}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  const paymentSuccessful = Boolean(order.payment?.razorpayPaymentId);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={19} color={COLORS.ink} />
        <Text style={styles.backText}>BACK TO ORDERS</Text>
      </Pressable>

      <View style={styles.brandHeader}>
        <Text style={styles.brand}>SOZAN / NAZM</Text>
        <Text style={styles.brandCaption}>CONTEMPORARY INDIAN WEAR</Text>
      </View>

      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>YOUR PURCHASE</Text>
        <Text style={styles.title}>Order details.</Text>
        <Text style={styles.subtitle}>
          Thank you for choosing SOZAN / NAZM.
        </Text>
      </View>

      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.label}>ORDER REFERENCE</Text>
            <Text style={styles.orderId}>
              #{order._id.slice(-8).toUpperCase()}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {order.status.replace(/[-_]/g, " ")}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={17} color={COLORS.muted} />
          <Text style={styles.dateText}>
            Ordered on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your pieces</Text>

      {order.items.map((item, index) => (
        <View style={styles.itemCard} key={`${item.product.title}-${index}`}>
          <View style={styles.itemInfo}>
            <Text style={styles.productTitle}>{item.product.title}</Text>
            <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.unitPrice}>
              {formatPrice(item.product.price)} each
            </Text>
          </View>

          <Text style={styles.itemPrice}>
            {formatPrice(item.product.price * item.quantity)}
          </Text>
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TOTAL PAID</Text>
        <Text style={styles.total}>{formatPrice(order.total)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery details</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoHeading}>
          <Ionicons name="location-outline" size={19} color={COLORS.accent} />
          <Text style={styles.infoTitle}>SHIPPING ADDRESS</Text>
        </View>

        <Text style={styles.customerName}>{order.customer.fullName}</Text>
        <Text style={styles.address}>{order.customer.address}</Text>
        <Text style={styles.address}>
          {order.customer.city} - {order.customer.pinCode}
        </Text>

        <View style={styles.cardDivider} />

        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={17} color={COLORS.muted} />
          <Text style={styles.phone}>{order.customer.phone}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Payment information</Text>

      <View style={styles.infoCard}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentIcon}>
            <Ionicons name="card-outline" size={21} color={COLORS.accent} />
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.infoTitle}>ONLINE PAYMENT</Text>
            <Text
              style={[
                styles.paymentStatus,
                {
                  color: paymentSuccessful ? COLORS.green : COLORS.muted,
                },
              ]}
            >
              {paymentSuccessful ? "Payment successful" : "Payment pending"}
            </Text>
          </View>

          <Ionicons
            name={paymentSuccessful ? "checkmark-circle" : "time-outline"}
            size={23}
            color={paymentSuccessful ? COLORS.green : COLORS.muted}
          />
        </View>

        {order.payment?.razorpayPaymentId ? (
          <>
            <View style={styles.cardDivider} />
            <Text style={styles.label}>PAYMENT REFERENCE</Text>
            <Text style={styles.paymentId}>
              {order.payment.razorpayPaymentId}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>SOZAN / NAZM</Text>
        <Text style={styles.footerText}>
          Thoughtfully crafted. Made to feel yours.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: COLORS.muted,
    marginTop: 14,
    fontSize: 14,
  },
  error: {
    color: COLORS.ink,
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: COLORS.ink,
    paddingHorizontal: 25,
    paddingVertical: 13,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 28,
  },
  backText: {
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  brandHeader: {
    alignItems: "center",
    paddingBottom: 23,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brand: {
    color: COLORS.ink,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: 2,
  },
  brandCaption: {
    color: COLORS.muted,
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 6,
  },
  headingSection: {
    marginTop: 28,
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 31,
    fontWeight: "600",
    marginTop: 7,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  orderId: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2EC",
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  statusText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "600",
    marginTop: 27,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  productTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  quantity: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },
  unitPrice: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  itemPrice: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  totalCard: {
    backgroundColor: "#EAE2D7",
    padding: 17,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  total: {
    color: COLORS.ink,
    fontSize: 21,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
  },
  infoHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
  },
  infoTitle: {
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  customerName: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  address: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 5,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  phone: {
    color: COLORS.muted,
    fontSize: 13,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F3EEE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentStatus: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "600",
  },
  paymentId: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 7,
  },
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 35,
    paddingTop: 23,
  },
  footerBrand: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 7,
  },
});
