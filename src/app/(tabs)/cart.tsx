import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useState } from "react";
import { Redirect, router } from "expo-router";

import { API_URL } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function getImageUrl(path?: string) {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function CartScreen() {
  const { items, isLoading, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9B5948" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9B5948" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const hasUnavailableItems = items.some(
    (item) => item.product.inStock === false,
  );

  async function handleClearCart() {
    Alert.alert(
      "Clear your bag?",
      "All products will be removed from your bag.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Bag",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUpdating(true);
              await clearCart();
            } catch (error) {
              console.error("CLEAR CART ERROR:", error);
              Alert.alert("Error", "Unable to clear your bag.");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ],
    );
  }

  async function handleQuantityChange(productId: string, quantity: number) {
    if (isUpdating) return;
    if (quantity > 99) return;

    try {
      setIsUpdating(true);
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error("QUANTITY UPDATE ERROR:", error);
      Alert.alert("Error", "Unable to update product quantity.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove(productId: string) {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      await removeFromCart(productId);
    } catch (error) {
      console.error("REMOVE CART ITEM ERROR:", error);
      Alert.alert("Error", "Unable to remove this product.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Your Bag</Text>
          <Text style={styles.subtitle}>
            {totalItems} {totalItems === 1 ? "PIECE" : "PIECES"}
          </Text>
        </View>

        {items.length > 0 && (
          <Pressable onPress={handleClearCart} disabled={isUpdating}>
            <Text style={styles.clearText}>CLEAR BAG</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyText}>
            Discover pieces selected with intention.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.shopButtonText}>EXPLORE COLLECTION</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.product.id)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const product = item.product;
              const imageUrl = getImageUrl(product.thumbnail || product.image);
              const unavailable = product.inStock === false;

              return (
                <View style={styles.cartItem}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[styles.productImage, styles.imagePlaceholder]}
                    >
                      <Text style={styles.placeholderText}>No image</Text>
                    </View>
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={styles.category}>
                      {product.category?.toUpperCase()}
                    </Text>

                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {product.title}
                    </Text>

                    <Text style={styles.itemPrice}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </Text>

                    {unavailable && (
                      <Text style={styles.unavailableText}>
                        OUT OF STOCK · REMOVE TO CONTINUE
                      </Text>
                    )}

                    <View style={styles.itemBottom}>
                      <View style={styles.quantityControl}>
                        <Pressable
                          style={styles.quantityButton}
                          disabled={item.quantity <= 1 || isUpdating}
                          onPress={() =>
                            handleQuantityChange(
                              String(product.id),
                              item.quantity - 1,
                            )
                          }
                        >
                          <Text style={styles.quantityButtonText}>−</Text>
                        </Pressable>

                        <Text style={styles.quantity}>{item.quantity}</Text>

                        <Pressable
                          style={styles.quantityButton}
                          disabled={item.quantity >= 99 || isUpdating}
                          onPress={() =>
                            handleQuantityChange(
                              String(product.id),
                              item.quantity + 1,
                            )
                          }
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </Pressable>
                      </View>

                      <Pressable
                        disabled={isUpdating}
                        onPress={() => handleRemove(String(product.id))}
                      >
                        <Text style={styles.removeText}>REMOVE</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          <View style={styles.footer}>
            {hasUnavailableItems && (
              <Text style={styles.stockWarning}>
                Some products are unavailable. Remove them to proceed to
                checkout.
              </Text>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.total}>₹{total.toLocaleString("en-IN")}</Text>
            </View>

            <Text style={styles.shippingNote}>
              Shipping and taxes calculated at checkout.
            </Text>

            <Pressable
              style={[
                styles.checkoutButton,
                (isUpdating || hasUnavailableItems) && styles.disabledButton,
              ]}
              disabled={isUpdating || hasUnavailableItems}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutButtonText}>
                PROCEED TO CHECKOUT →
              </Text>
            </Pressable>

            <Pressable
              style={styles.continueButton}
              onPress={() => router.replace("/")}
              disabled={isUpdating}
            >
              <Text style={styles.continueText}>CONTINUE SHOPPING</Text>
            </Pressable>

            {isUpdating && (
              <ActivityIndicator color="#9B5948" style={styles.updateLoader} />
            )}
          </View>
        </>
      )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F4EE",
  },
  loadingText: {
    marginTop: 12,
    color: "#776C62",
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
    color: "#25221F",
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#81776D",
    marginTop: 5,
  },
  clearText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#9B5948",
  },
  list: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5DED3",
    padding: 12,
    marginBottom: 12,
    gap: 14,
  },
  productImage: {
    width: 112,
    aspectRatio: 3 / 4,
    backgroundColor: "#EEE9E1",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 11,
    color: "#776C62",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  category: {
    fontSize: 9,
    letterSpacing: 1.3,
    color: "#9B5948",
    fontWeight: "600",
  },
  itemTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: "#25221F",
    marginVertical: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#25221F",
  },
  unavailableText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#B4534B",
    marginTop: 7,
    lineHeight: 14,
  },
  itemBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5DED3",
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    fontSize: 19,
    color: "#25221F",
  },
  quantity: {
    minWidth: 25,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#25221F",
  },
  removeText: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "700",
    color: "#9B5948",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    color: "#9B5948",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 23,
    fontWeight: "600",
    color: "#25221F",
  },
  emptyText: {
    fontSize: 13,
    color: "#776C62",
    marginTop: 10,
    marginBottom: 25,
    textAlign: "center",
  },
  shopButton: {
    backgroundColor: "#25221F",
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: "#E5DED3",
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#F7F4EE",
  },
  stockWarning: {
    color: "#B4534B",
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#25221F",
  },
  total: {
    fontSize: 21,
    fontWeight: "700",
    color: "#25221F",
  },
  shippingNote: {
    fontSize: 11,
    color: "#81776D",
    marginTop: 7,
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: "#25221F",
    paddingVertical: 17,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.45,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  continueButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  continueText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#776C62",
  },
  updateLoader: {
    marginTop: 4,
  },
});
