import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
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

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadOrder() {
      try {
        setIsLoading(true);

        const data = await getOrderById(id);

        console.log("ORDER DETAILS:", data);

        setOrder(data);
      } catch (error) {
        console.error("ORDER DETAILS ERROR:", error);
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
        <ActivityIndicator size="large" />
        <Text>Loading order...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Order not found"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Order ID</Text>
        <Text style={styles.value}>#{order._id.slice(-8).toUpperCase()}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>{order.status}</Text>

        <Text style={styles.label}>Ordered On</Text>
        <Text style={styles.value}>
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>

      {order.items.map((item, index) => (
        <View style={styles.itemCard} key={`${item.product.title}-${index}`}>
          <View style={styles.itemInfo}>
            <Text style={styles.productTitle}>{item.product.title}</Text>

            <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
          </View>

          <Text style={styles.price}>
            ₹{item.product.price * item.quantity}
          </Text>
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Order Total</Text>
        <Text style={styles.total}>₹{order.total}</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery Address</Text>

      <View style={styles.card}>
        <Text style={styles.value}>{order.customer.fullName}</Text>

        <Text style={styles.address}>{order.customer.address}</Text>

        <Text style={styles.address}>
          {order.customer.city} - {order.customer.pinCode}
        </Text>

        <Text style={styles.address}>Phone: {order.customer.phone}</Text>
      </View>

      <Text style={styles.sectionTitle}>Payment</Text>

      <View style={styles.card}>
        <Text style={styles.value}>
          {order.payment?.razorpayPaymentId
            ? "Payment Successful"
            : "Payment Pending"}
        </Text>

        {order.payment?.razorpayPaymentId && (
          <Text style={styles.paymentId}>
            Payment ID: {order.payment.razorpayPaymentId}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 10,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 3,
  },

  status: {
    color: "#166534",
    fontWeight: "700",
    marginTop: 3,
  },

  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  itemInfo: {
    flex: 1,
    marginRight: 10,
  },

  productTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  quantity: {
    color: "#6B7280",
    marginTop: 5,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
  },

  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },

  total: {
    fontSize: 20,
    fontWeight: "700",
  },

  address: {
    color: "#4B5563",
    marginTop: 7,
    lineHeight: 20,
  },

  paymentId: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 8,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
