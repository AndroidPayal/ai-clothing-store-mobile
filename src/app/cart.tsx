import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Redirect, router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createPaymentOrder } from "@/api/paymentApi";

export default function CartScreen() {
  const { items, isLoading, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Wait for authentication restoration
  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // User must be logged in
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading cart...</Text>
      </View>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Cart</Text>

        {items.length > 0 && (
          <Pressable
            onPress={async () => {
              try {
                await clearCart();
              } catch (error) {
                console.error("CLEAR CART ERROR:", error);
              }
            }}
          >
            <Text style={styles.clearText}>Clear Cart</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty 🛒</Text>

          <Text style={styles.emptyText}>Add some products to your cart.</Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.product._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const product = item.product;

              return (
                <View style={styles.cartItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {product.title}
                    </Text>

                    <Text style={styles.itemPrice}>₹{product.price}</Text>
                  </View>

                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={async () => {
                        try {
                          await updateQuantity(product._id, item.quantity - 1);
                        } catch (error) {
                          console.error("DECREASE QUANTITY ERROR:", error);
                        }
                      }}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </Pressable>

                    <Text style={styles.quantity}>{item.quantity}</Text>

                    <Pressable
                      style={styles.quantityButton}
                      onPress={async () => {
                        try {
                          await updateQuantity(product._id, item.quantity + 1);
                        } catch (error) {
                          console.error("INCREASE QUANTITY ERROR:", error);
                        }
                      }}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={async () => {
                      try {
                        await removeFromCart(product._id);
                      } catch (error) {
                        console.error("REMOVE CART ITEM ERROR:", error);
                      }
                    }}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              );
            }}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>

              <Text style={styles.total}>₹{total}</Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={async () => {
                try {
                  console.log("CHECKOUT PRESSED");

                  const amount = 2499;

                  const order = await createPaymentOrder(amount);

                  console.log("RAZORPAY ORDER CREATED:", order);
                } catch (error) {
                  console.error("PAYMENT START ERROR:", error);
                }
              }}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },

  list: {
    paddingBottom: 20,
  },

  cartItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  itemInfo: {
    marginBottom: 12,
  },

  itemTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },

  quantity: {
    fontSize: 17,
    fontWeight: "600",
    marginHorizontal: 18,
  },

  removeText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyText: {
    color: "#6B7280",
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

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  totalLabel: {
    fontSize: 20,
    fontWeight: "600",
  },

  total: {
    fontSize: 22,
    fontWeight: "700",
  },

  checkoutButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
