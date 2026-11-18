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
      setOrders(data);
    } catch (error) {
      console.error("ORDERS FETCH ERROR:", error);
      setError("Unable to load your orders. Please try again.");
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
        <ActivityIndicator size="large" color="#A36D5D" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.brand}>SOZAN / NAZM</Text>
        <Text style={styles.error}>{error}</Text>

        <Pressable style={styles.button} onPress={loadOrders}>
          <Text style={styles.buttonText}>TRY AGAIN</Text>
        </Pressable>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.brand}>SOZAN / NAZM</Text>
        <Text style={styles.emptyIcon}>◇</Text>
        <Text style={styles.emptyTitle}>Nothing here. Yet.</Text>
        <Text style={styles.emptyText}>
          Your orders will find their place here. Discover pieces that feel like
          you.
        </Text>

        <Pressable style={styles.button} onPress={() => router.replace("/")}>
          <Text style={styles.buttonText}>EXPLORE COLLECTION</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.brandHeader}>
        <Text style={styles.brand}>SOZAN / NAZM</Text>
        <Text style={styles.brandCaption}>CONTEMPORARY INDIAN WEAR</Text>
      </View>

      <View style={styles.headingSection}>
        <Text style={styles.eyebrow}>YOUR PURCHASES</Text>
        <Text style={styles.title}>My Orders.</Text>
        <Text style={styles.subtitle}>
          A little something you've chosen for yourself.
        </Text>
        <Text style={styles.orderCount}>
          {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
        </Text>
      </View>

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

          const date = new Date(item.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          const status = item.status.replace(/[-_]/g, " ");

          return (
            <Pressable
              style={styles.orderCard}
              onPress={() => router.push(`/order/${item._id}`)}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderLabel}>ORDER REFERENCE</Text>
                  <Text style={styles.orderId}>
                    #{item._id.slice(-8).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.itemsLabel}>YOUR SELECTION</Text>

              {item.items.slice(0, 2).map((orderItem, index) => (
                <View key={`${item._id}-${index}`} style={styles.productRow}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {orderItem.product?.title || "Product"}
                  </Text>
                  <Text style={styles.productQuantity}>
                    × {orderItem.quantity}
                  </Text>
                </View>
              ))}

              {item.items.length > 2 && (
                <Text style={styles.moreItems}>
                  + {item.items.length - 2} more products
                </Text>
              )}

              <View style={styles.divider} />

              <View style={styles.bottomRow}>
                <View>
                  <Text style={styles.dateLabel}>ORDERED ON</Text>
                  <Text style={styles.date}>{date}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.total}>
                    ₹{item.total.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.viewDetails}>VIEW ORDER DETAILS</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
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
    backgroundColor: "#F7F4EE",
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  brandHeader: {
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5DED3",
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
    paddingTop: 25,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.8,
    color: "#A36D5D",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "500",
    color: "#25221F",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#776C62",
    marginTop: 7,
    lineHeight: 19,
  },
  orderCount: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#81776D",
    marginTop: 17,
  },
  list: {
    paddingBottom: 30,
  },
  orderCard: {
    backgroundColor: "#FBF9F5",
    borderWidth: 1,
    borderColor: "#E5DED3",
    padding: 16,
    marginBottom: 14,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderLabel: {
    fontSize: 8,
    letterSpacing: 1.3,
    color: "#81776D",
  },
  orderId: {
    fontSize: 17,
    fontWeight: "600",
    color: "#25221F",
    marginTop: 5,
  },
  statusBadge: {
    backgroundColor: "#EAE2D7",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    color: "#695044",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5DED3",
    marginVertical: 15,
  },
  itemsLabel: {
    fontSize: 8,
    letterSpacing: 1.3,
    color: "#A36D5D",
    marginBottom: 10,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    color: "#25221F",
    marginRight: 12,
  },
  productQuantity: {
    fontSize: 12,
    color: "#776C62",
  },
  moreItems: {
    fontSize: 11,
    color: "#81776D",
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: "#81776D",
  },
  date: {
    fontSize: 13,
    fontWeight: "500",
    color: "#25221F",
    marginTop: 6,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: "#81776D",
  },
  total: {
    fontSize: 19,
    fontWeight: "600",
    color: "#25221F",
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5DED3",
    marginTop: 15,
    paddingTop: 13,
  },
  viewDetails: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#A36D5D",
  },
  arrow: {
    fontSize: 18,
    color: "#A36D5D",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#F7F4EE",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "#776C62",
  },
  error: {
    fontSize: 14,
    color: "#9B5948",
    textAlign: "center",
    marginVertical: 20,
  },
  emptyIcon: {
    fontSize: 55,
    color: "#A36D5D",
    marginTop: 35,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 25,
    fontWeight: "500",
    color: "#25221F",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#776C62",
    marginTop: 10,
    marginBottom: 25,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#25221F",
    paddingHorizontal: 25,
    paddingVertical: 16,
    marginTop: 5,
  },
  buttonText: {
    color: "#F7F4EE",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});
