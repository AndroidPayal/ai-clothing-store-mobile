import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "@/api/productApi";
import { Heart } from "lucide-react-native";
import { API_URL } from "@/config/api";

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;

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
  const imageUrl = `${API_URL}${product.thumbnail}`;

  return (
    <>
      <Pressable
        style={styles.heartButton}
        onPress={(event) => {
          event.stopPropagation();
          onWishlistPress?.();
        }}
      >
        <Heart
          size={24}
          color={isWishlisted ? "red" : "#6B7280"}
          fill={isWishlisted ? "red" : "transparent"}
        />
      </Pressable>

      <Pressable style={styles.card} onPress={onPress}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>

          <Text style={styles.category}>{product.category}</Text>

          <Text style={styles.price}>₹{product.price}</Text>

          <Text style={product.inStock ? styles.inStock : styles.outOfStock}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Text>

          {product.inStock && (
            <Pressable
              style={styles.cartButton}
              onPress={(event) => {
                event.stopPropagation();
                onAddToCart?.();
              }}
            >
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },

  image: {
    width: "100%",
    height: 220,
    backgroundColor: "#F3F4F6",
  },

  content: {
    padding: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  category: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  inStock: {
    fontSize: 13,
    fontWeight: "600",
    color: "#16A34A",
    marginBottom: 12,
  },

  outOfStock: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 12,
  },

  cartButton: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },

  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
});
