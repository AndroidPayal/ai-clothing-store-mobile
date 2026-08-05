import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getProducts, Product } from "@/api/productApi";
import ProductCard from "@/components/products/ProductCard";
import { router } from "expo-router";

export default function HomeScreen() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getProducts();

        console.log("PRODUCTS LOADED:", data);

        setProducts(data);
      } catch (error) {
        console.error("PRODUCT FETCH ERROR:", error);

        setError("Unable to load products.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome, {user?.name}! 👋</Text>

          <Text style={styles.heading}>Products</Text>
        </View>

        <Pressable
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
        >
          <Text style={styles.cartButtonText}>🛒 Cart</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => {
                router.push(`/product/${item._id}`);
              }}
              onAddToCart={async () => {
                try {
                  await addToCart({
                    product: item,
                    quantity: 1,
                  });

                  console.log("PRODUCT ADDED TO CART:", item.title);
                } catch (error) {
                  console.error("ADD TO CART ERROR:", error);
                }
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  welcome: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 16,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  category: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  inStock: {
    color: "green",
    fontWeight: "600",
  },

  outOfStock: {
    color: "red",
    fontWeight: "600",
  },

  error: {
    color: "red",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  cartButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
