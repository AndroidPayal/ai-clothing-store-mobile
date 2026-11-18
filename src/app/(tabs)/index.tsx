import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getProducts, type Product } from "@/api/productApi";
import ProductCard from "@/components/products/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

const categories = ["All", "women", "men", "kids"];

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-asc"
  | "name-desc";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "default" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

export default function HomeScreen() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart, items } = useCart();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  async function loadProducts(refresh = false) {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("PRODUCT FETCH ERROR:", error);
      setError("Unable to load products. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText);

      const matchesCategory =
        selectedCategory === "All" ||
        category === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#9B5948" />
        <Text style={styles.loadingText}>Preparing your experience...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const firstName = user?.name?.trim().split(" ")[0] || "there";

  const listHeader = (
    <View>
      {/* Brand header */}
      <View style={styles.header}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandName}>SOZAN / NAZM</Text>
          <Text style={styles.brandCaption}>CONTEMPORARY INDIAN WEAR</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.cartButton,
            pressed && styles.cartButtonPressed,
          ]}
          onPress={() => router.push("/cart")}
          hitSlop={8}
        >
          <Ionicons name="bag-outline" size={23} color="#28231F" />

          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Editorial introduction */}
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>THE NEW EVERYDAY</Text>

        <Text style={styles.heading}>Wear what{"\n"}feels yours.</Text>

        <Text style={styles.subtitle}>
          Thoughtful pieces for the way you live, move, and express yourself.
        </Text>

        <View style={styles.introFooter}>
          <Text style={styles.introWelcome}>
            HELLO, {firstName.toUpperCase()}
          </Text>
          <Text style={styles.introMark}>✳</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color="#9B5948"
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Find something you love..."
          placeholderTextColor="#9A9086"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Text style={styles.clearSearch}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>EXPLORE COLLECTIONS</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category;

          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                isActive && styles.activeCategoryButton,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {category === "All" ? "All pieces" : category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Product section */}
      <View style={styles.collectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>THE EDIT</Text>
          <Text style={styles.collectionTitle}>
            {selectedCategory === "All"
              ? "Our Collection"
              : `${selectedCategory.charAt(0).toUpperCase()}${selectedCategory.slice(1)} Collection`}
          </Text>
        </View>

        <Text style={styles.pieceCount}>{filteredProducts.length} PIECES</Text>
      </View>

      {/* Sort filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortList}
      >
        {sortOptions.map((option) => {
          const isActive = sortBy === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => setSortBy(option.value)}
              style={[styles.sortButton, isActive && styles.activeSortButton]}
            >
              <Text
                style={[styles.sortText, isActive && styles.activeSortText]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9B5948" />
          <Text style={styles.loadingText}>Curating your collection...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.error}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={() => loadProducts()}>
            <Text style={styles.retryText}>TRY AGAIN</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={() => loadProducts(true)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAddToCart={() =>
                addToCart({
                  product: item,
                  quantity: 1,
                })
              }
              isWishlisted={isInWishlist(String(item.id))}
              onWishlistPress={async () => {
                try {
                  if (isInWishlist(String(item.id))) {
                    await removeFromWishlist(String(item.id));
                  } else {
                    await addToWishlist(item);
                  }
                } catch (error) {
                  console.error("WISHLIST ERROR:", error);
                }
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✳</Text>
              <Text style={styles.emptyTitle}>Nothing here just yet.</Text>
              <Text style={styles.emptyDescription}>
                Try another search or explore our complete collection.
              </Text>

              <Pressable
                style={styles.resetButton}
                onPress={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSortBy("default");
                }}
              >
                <Text style={styles.resetButtonText}>EXPLORE ALL PIECES</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  list: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    color: "#81766B",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#E5DED3",
  },
  brandBlock: {
    gap: 4,
  },
  brandName: {
    color: "#28231F",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 3,
  },
  brandCaption: {
    color: "#96877A",
    fontSize: 8,
    letterSpacing: 2,
    fontWeight: "600",
  },
  cartButton: {
    width: 46,
    height: 44,
    borderWidth: 1,
    borderColor: "#D9CFC2",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#F7F4EE",
  },
  cartButtonPressed: {
    backgroundColor: "#EAE2D7",
  },
  cartBadge: {
    position: "absolute",
    top: -7,
    right: -7,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#9B5948",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F7F4EE",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  intro: {
    backgroundColor: "#EAE2D7",
    marginTop: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },
  eyebrow: {
    color: "#9B5948",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },
  heading: {
    color: "#29231F",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "500",
    letterSpacing: -1.2,
    marginTop: 13,
  },
  subtitle: {
    color: "#75695F",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 270,
  },
  introFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#D7CBBE",
    marginTop: 20,
    paddingTop: 13,
  },
  introWelcome: {
    color: "#75695F",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  introMark: {
    color: "#9B5948",
    fontSize: 21,
  },
  searchContainer: {
    height: 49,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7DFD4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 22,
  },
  searchIcon: {
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#29231F",
    fontSize: 13,
  },
  clearSearch: {
    color: "#8B7F73",
    fontSize: 16,
    padding: 5,
  },
  sectionHeader: {
    marginTop: 25,
    marginBottom: 12,
  },
  sectionEyebrow: {
    color: "#9B5948",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  categoryList: {
    gap: 9,
    paddingBottom: 5,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#DCD3C8",
    paddingHorizontal: 17,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  activeCategoryButton: {
    backgroundColor: "#29231F",
    borderColor: "#29231F",
  },
  categoryText: {
    color: "#6E6258",
    fontSize: 12,
    textTransform: "capitalize",
  },
  activeCategoryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 28,
    marginBottom: 15,
  },
  collectionTitle: {
    color: "#29231F",
    fontSize: 23,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: -0.5,
  },
  pieceCount: {
    color: "#8A7D71",
    fontSize: 9,
    letterSpacing: 1,
    paddingBottom: 4,
  },
  sortList: {
    gap: 8,
    paddingBottom: 17,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0D8CD",
  },
  activeSortButton: {
    backgroundColor: "#EAE2D7",
    borderColor: "#CDBBAA",
  },
  sortText: {
    color: "#766B60",
    fontSize: 10,
  },
  activeSortText: {
    color: "#29231F",
    fontWeight: "700",
  },
  errorTitle: {
    fontSize: 20,
    color: "#29231F",
    fontWeight: "600",
    marginBottom: 8,
  },
  error: {
    color: "#B0443E",
    fontSize: 13,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#29231F",
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: 20,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 45,
  },
  emptyIcon: {
    color: "#9B5948",
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#29231F",
    fontSize: 20,
    fontWeight: "600",
  },
  emptyDescription: {
    color: "#81766B",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
  },
  resetButton: {
    backgroundColor: "#29231F",
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginTop: 20,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
