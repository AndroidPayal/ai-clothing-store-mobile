import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";

import { getOrders } from "@/api/orderApi";

type Order = {
  _id: string;
  items: {
    product: {
      title: string;
      thumbnail: string;
    };
    quantity: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getOrders();

      console.log("ORDERS LOADED:", data);

      setOrders(data);
    } catch (error) {
      console.error("ORDERS FETCH ERROR:", error);
      setError("Unable to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          Your placed orders will appear here.
        </Text>

        <Pressable style={styles.shopButton} onPress={() => router.push("/")}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const itemCount = item.items.reduce(
            (total, orderItem) => total + orderItem.quantity,
            0,
          );

          const date = new Date(item.createdAt).toLocaleDateString();

          return (
            <Pressable
              style={styles.orderCard}
              onPress={() => router.push(`/order/${item._id}`)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderLabel}>Order</Text>
                  <Text style={styles.orderId}>
                    #{item._id.slice(-8).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.itemsText}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.dateLabel}>Ordered on</Text>
                  <Text style={styles.date}>{date}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.total}>₹{item.total}</Text>
                </View>
              </View>

              <Text style={styles.viewDetails}>View Details →</Text>
            </Pressable>
          );
        }}
      />
    </View>
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

  list: {
    paddingBottom: 30,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderLabel: {
    fontSize: 13,
    color: "#6B7280",
  },

  orderId: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },

  itemsText: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 14,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  date: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  priceContainer: {
    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  total: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 3,
  },

  viewDetails: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  emptyText: {
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 20,
  },

  shopButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
