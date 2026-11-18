import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config/api";

export default function WishlistScreen() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const getImageUrl = (image?: string) => {
    if (!image) return undefined;

    if (image.startsWith("http")) return image;

    return `${API_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const handleRemove = async (productId: string) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
    } catch (error) {
      console.error("REMOVE WISHLIST ERROR:", error);
      Alert.alert("Error", "Could not remove this product. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product: (typeof items)[number]) => {
    try {
      setAddingId(String(product.id));

      await addToCart({
        product,
        quantity: 1,
      });

      Alert.alert(
        "Added to Bag",
        `${product.title} has been added to your cart.`,
      );
    } catch (error) {
      console.error("WISHLIST ADD TO CART ERROR:", error);
      Alert.alert("Error", "Could not add this product to your cart.");
    } finally {
      setAddingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>♡</Text>
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Save your favourite pieces here and come back to them anytime.
        </Text>

        <Pressable
          style={styles.shopButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.shopButtonText}>EXPLORE COLLECTION</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>My Wishlist</Text>
          <Text style={styles.subtitle}>
            {items.length} {items.length === 1 ? "saved item" : "saved items"}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isRemoving = removingId === String(item.id);
          const isAdding = addingId === String(item.id);

          return (
            <View style={styles.card}>
              <Pressable
                style={styles.productSection}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Image
                  source={
                    getImageUrl(item.thumbnail || item.image)
                      ? { uri: getImageUrl(item.thumbnail || item.image) }
                      : require("../../../assets/icon.png")
                  }
                  style={styles.image}
                  resizeMode="cover"
                />

                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <Text style={styles.price}>
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </Text>

                  <Text style={styles.viewDetails}>VIEW DETAILS →</Text>
                </View>
              </Pressable>

              <View style={styles.actions}>
                {item.inStock === false ? (
                  <View style={[styles.addButton, styles.outOfStockButton]}>
                    <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                  </View>
                ) : (
                  <Pressable
                    style={[
                      styles.addButton,
                      isAdding && styles.disabledButton,
                    ]}
                    disabled={isAdding || isRemoving}
                    onPress={() => handleAddToCart(item)}
                  >
                    {isAdding ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.addButtonText}>ADD TO BAG</Text>
                    )}
                  </Pressable>
                )}

                <Pressable
                  style={styles.removeButton}
                  disabled={isRemoving || isAdding}
                  onPress={() => handleRemove(String(item.id))}
                >
                  {isRemoving ? (
                    <ActivityIndicator color="#8B5E55" size="small" />
                  ) : (
                    <Text style={styles.removeText}>Remove ♡</Text>
                  )}
                </Pressable>
              </View>
            </View>
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
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },

  heading: {
    fontSize: 27,
    fontWeight: "700",
    color: "#25221F",
  },

  subtitle: {
    fontSize: 13,
    color: "#827B72",
    marginTop: 5,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    elevation: 2,
  },

  productSection: {
    flexDirection: "row",
  },

  image: {
    width: 105,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#F0EDE7",
  },

  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#25221F",
    lineHeight: 21,
  },

  price: {
    marginTop: 9,
    fontSize: 18,
    fontWeight: "700",
    color: "#25221F",
  },

  viewDetails: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#A36D5D",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    gap: 10,
  },

  addButton: {
    flex: 1,
    minHeight: 43,
    backgroundColor: "#25221F",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  removeButton: {
    minHeight: 43,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E8DCD5",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },

  removeText: {
    color: "#8B5E55",
    fontSize: 12,
    fontWeight: "600",
  },
  outOfStockButton: {
    backgroundColor: "#E8E5DF",
  },

  outOfStockText: {
    color: "#827B72",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#F7F4EE",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    fontSize: 65,
    color: "#A36D5D",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#25221F",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#827B72",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },

  shopButton: {
    backgroundColor: "#25221F",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 7,
    marginTop: 25,
  },

  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
