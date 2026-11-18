import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";

import type { Product } from "@/api/productApi";
import { getProducts } from "@/api/productApi";
import { API_URL } from "@/config/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { addToCart, items } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setImageError(false);

        const products = await getProducts();
        const foundProduct = products.find(
          (item) => String(item.id) === String(id),
        );

        setProduct(foundProduct ?? null);
      } catch (error) {
        console.error("PRODUCT DETAILS ERROR:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9B5948" />
        <Text style={styles.loadingText}>Discovering your piece...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </Pressable>
      </View>
    );
  }

  const isAvailable = product.inStock === true;
  const wishlisted = isInWishlist(String(product.id));

  const imagePath = product.thumbnail || product.image;
  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${API_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
    : null;

  async function handleWishlist() {
    if (!product) return;

    try {
      if (wishlisted) {
        await removeFromWishlist(String(product.id));
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error("WISHLIST ERROR:", error);
      Alert.alert("Something went wrong", "Please try again.");
    }
  }

  async function handleAddToCart() {
    if (!product) return;

    if (!product.inStock) {
      Alert.alert("Out of Stock", "This product is currently unavailable.");
      return;
    }

    try {
      setIsAdding(true);

      await addToCart({
        product,
        quantity,
      });

      Alert.alert(
        "Added to Bag",
        `${product.title} has been added to your bag.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          {
            text: "View Bag",
            onPress: () => router.push("/cart"),
          },
        ],
      );
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      Alert.alert(
        "Unable to Add Product",
        "Please check your connection and try again.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable style={styles.backIconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={21} color="#29231F" />
        </Pressable>

        <View style={styles.brandBlock}>
          <Text style={styles.brandName}>SOZAN / NAZM</Text>
          <Text style={styles.brandCaption}>CONTEMPORARY INDIAN WEAR</Text>
        </View>

        <Pressable
          style={styles.bagButton}
          onPress={() => router.push("/cart")}
        >
          <Ionicons name="bag-outline" size={22} color="#29231F" />

          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={35} color="#A99B8C" />
              <Text style={styles.placeholderText}>Image unavailable</Text>
            </View>
          )}

          <Pressable
            style={styles.heartButton}
            onPress={handleWishlist}
            disabled={isAdding}
          >
            <Ionicons
              name={wishlisted ? "heart" : "heart-outline"}
              size={23}
              color={wishlisted ? "#B4534B" : "#29231F"}
            />
          </Pressable>

          {!isAvailable && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>CURRENTLY UNAVAILABLE</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>
              {product.category?.toUpperCase() || "COLLECTION"}
            </Text>
            <Text style={styles.productReference}>SOZAN / NAZM</Text>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          <Text style={styles.price}>
            ₹{product.price.toLocaleString("en-IN")}
          </Text>

          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                !isAvailable && styles.stockDotUnavailable,
              ]}
            />
            <Text style={isAvailable ? styles.inStock : styles.outOfStock}>
              {isAvailable ? "Available to order" : "Currently out of stock"}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descriptionTitle}>ABOUT THIS PIECE</Text>

          <Text style={styles.description}>
            {product.description || "No description available."}
          </Text>

          {isAvailable && (
            <>
              <View style={styles.quantitySection}>
                <View>
                  <Text style={styles.quantityLabel}>QUANTITY</Text>
                  <Text style={styles.quantityHint}>
                    Select your preferred quantity
                  </Text>
                </View>

                <View style={styles.quantityControl}>
                  <Pressable
                    style={styles.quantityButton}
                    disabled={quantity <= 1 || isAdding}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={quantity <= 1 ? "#BDB5AB" : "#29231F"}
                    />
                  </Pressable>

                  <Text style={styles.quantityText}>{quantity}</Text>

                  <Pressable
                    style={styles.quantityButton}
                    disabled={quantity >= 99 || isAdding}
                    onPress={() => setQuantity((q) => Math.min(99, q + 1))}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={quantity >= 99 ? "#BDB5AB" : "#29231F"}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.cartButton, isAdding && styles.disabledButton]}
                onPress={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="bag-outline" size={19} color="#FFFFFF" />
                    <Text style={styles.cartButtonText}>ADD TO BAG</Text>
                  </>
                )}
              </Pressable>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerMark}>✳</Text>
            <Text style={styles.footerBrand}>SOZAN / NAZM</Text>
            <Text style={styles.footerNote}>
              Thoughtfully crafted. Made to feel yours.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  container: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F7F4EE",
  },
  loadingText: {
    marginTop: 12,
    color: "#776C62",
    fontSize: 13,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#25221F",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#29231F",
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  topBar: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F4EE",
    borderBottomWidth: 1,
    borderBottomColor: "#E5DED3",
  },
  backIconButton: {
    width: 38,
    height: 40,
    justifyContent: "center",
  },
  brandBlock: {
    alignItems: "center",
    gap: 3,
  },
  brandName: {
    color: "#28231F",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2.2,
  },
  brandCaption: {
    color: "#96877A",
    fontSize: 7,
    letterSpacing: 1.4,
  },
  bagButton: {
    width: 38,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: -2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#9B5948",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  imageContainer: {
    width: "100%",
    position: "relative",
    backgroundColor: "#EEE9E1",
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#EEE9E1",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  placeholderText: {
    color: "#776C62",
    fontSize: 12,
  },
  heartButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  content: {
    paddingHorizontal: 21,
    paddingTop: 25,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  category: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: "#9B5948",
    fontWeight: "700",
  },
  productReference: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: "#A3988C",
  },
  title: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "500",
    letterSpacing: -0.6,
    color: "#25221F",
    marginBottom: 11,
  },
  price: {
    fontSize: 23,
    fontWeight: "700",
    color: "#25221F",
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#63836A",
  },
  stockDotUnavailable: {
    backgroundColor: "#B4534B",
  },
  inStock: {
    fontSize: 12,
    color: "#63836A",
    fontWeight: "600",
  },
  outOfStock: {
    fontSize: 12,
    color: "#B4534B",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5DED3",
    marginVertical: 25,
  },
  descriptionTitle: {
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: "700",
    color: "#776C62",
    marginBottom: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: "#514940",
  },
  quantitySection: {
    marginTop: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "700",
    color: "#776C62",
  },
  quantityHint: {
    fontSize: 10,
    color: "#A3988C",
    marginTop: 5,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD4C9",
    backgroundColor: "#FFFFFF",
  },
  quantityButton: {
    width: 39,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    minWidth: 30,
    textAlign: "center",
    fontSize: 14,
    color: "#25221F",
    fontWeight: "600",
  },
  cartButton: {
    marginTop: 23,
    backgroundColor: "#29231F",
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingVertical: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.7,
  },
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5DED3",
    marginTop: 32,
    paddingTop: 23,
  },
  footerMark: {
    color: "#9B5948",
    fontSize: 22,
    marginBottom: 7,
  },
  footerBrand: {
    color: "#8B685B",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
  footerNote: {
    color: "#96877A",
    fontSize: 10,
    marginTop: 7,
  },
});
