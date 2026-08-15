import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

import { useWishlist } from "@/context/WishlistContext";
import { API_URL } from "@/config/api";

export default function WishlistScreen() {
  const { items, removeFromWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your Wishlist is Empty ❤️</Text>
        <Text>Add products you love.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Pressable
            style={{ flexDirection: "row", flex: 1 }}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <Image
              source={{
                uri: `${API_URL}${item.thumbnail}`,
              }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.price}>₹{item.price}</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.removeButton}
            onPress={() => removeFromWishlist(item._id)}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },

  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  price: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
  },

  removeButton: {
    marginTop: 12,
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  removeText: {
    color: "white",
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
});
