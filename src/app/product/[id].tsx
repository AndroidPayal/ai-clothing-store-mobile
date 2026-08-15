import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";

import type { Product } from "@/api/productApi";
import { getProducts } from "@/api/productApi";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config/api";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [product, setProduct] = useState<Product | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const products = await getProducts();

        const foundProduct = products.find((item) => item._id === id);

        setProduct(foundProduct ?? null);
      } catch (error) {
        console.error("PRODUCT DETAILS ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Product not found</Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const imageUrl = `${API_URL}${product.image}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>

        <Text style={styles.title}>{product.title}</Text>

        <Text style={styles.price}>₹{product.price}</Text>

        <Text style={product.inStock ? styles.inStock : styles.outOfStock}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.descriptionTitle}>Description</Text>

        <Text style={styles.description}>{product.description}</Text>

        {product.inStock && (
          <Pressable
            style={styles.cartButton}
            onPress={async () => {
              try {
                await addToCart({
                  product: product,
                  quantity: 1,
                });

                console.log("PRODUCT ADDED TO CART:", product.title);
              } catch (error) {
                console.error("ADD TO CART ERROR:", error);
              }
            }}
          >
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },

  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 20,
  },

  backLink: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  image: {
    width: "100%",
    height: 400,
    backgroundColor: "#F3F4F6",
  },

  content: {
    padding: 20,
  },

  category: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  inStock: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16A34A",
  },

  outOfStock: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },

  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
  },

  cartButton: {
    marginTop: 28,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  backButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
