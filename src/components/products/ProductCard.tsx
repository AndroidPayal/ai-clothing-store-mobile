import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { useState } from "react";
import { Heart } from "lucide-react-native";

import type { Product } from "@/api/productApi";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void | Promise<void>;
  onWishlistPress?: () => void;
  isWishlisted?: boolean;
};

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  onWishlistPress,
  isWishlisted = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = product.thumbnail || product.image;

  async function handleAddToCart() {
    if (isAdding || !onAddToCart) return;

    try {
      setIsAdding(true);
      setAdded(false);

      await onAddToCart();

      setAdded(true);

      if (Platform.OS === "android") {
        ToastAndroid.show("Added to your bag", ToastAndroid.SHORT);
      } else {
        Alert.alert("Added to bag", `${product.title} has been added.`);
      }

      setTimeout(() => setAdded(false), 1500);
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      Alert.alert("Unable to add item", "Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
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
            <Text style={styles.placeholderText}>Image unavailable</Text>
          </View>
        )}

        <Pressable
          style={styles.heartButton}
          onPress={(event) => {
            event.stopPropagation();
            onWishlistPress?.();
          }}
          hitSlop={8}
        >
          <Heart
            size={21}
            color={isWishlisted ? "#B4534B" : "#374151"}
            fill={isWishlisted ? "#B4534B" : "transparent"}
          />
        </Pressable>

        {!product.inStock && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>CURRENTLY UNAVAILABLE</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{product.category?.toUpperCase()}</Text>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <Text style={styles.price}>
          ₹ {product.price.toLocaleString("en-IN")}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.cartButton,
            pressed && styles.pressedButton,
            added && styles.addedButton,
            (!product.inStock || isAdding) && styles.disabledButton,
          ]}
          disabled={!product.inStock || isAdding}
          onPress={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
        >
          {isAdding ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.cartButtonText}>
              {added
                ? "ADDED ✓"
                : product.inStock
                  ? "ADD TO BAG"
                  : "UNAVAILABLE"}
            </Text>
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5DED3",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#F3F0EA",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6B7280",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    padding: 9,
    borderRadius: 24,
    elevation: 3,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  content: {
    padding: 14,
  },
  category: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#8A7668",
    marginBottom: 7,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#25221F",
    marginBottom: 8,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#25221F",
    marginBottom: 12,
  },
  cartButton: {
    backgroundColor: "#25221F",
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  pressedButton: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  addedButton: {
    backgroundColor: "#526B50",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
});
