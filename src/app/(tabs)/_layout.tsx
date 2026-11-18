import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function TabsLayout() {
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();

  const wishlistCount = wishlistItems.length;
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#A36D5D",
        tabBarInactiveTintColor: "#827B72",
        tabBarStyle: {
          backgroundColor: "#F7F4EE",
          borderTopColor: "#E5DED3",
          borderTopWidth: 1,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarBadge:
            wishlistCount > 0
              ? wishlistCount > 99
                ? "99+"
                : wishlistCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#A36D5D",
            color: "#FFFFFF",
            fontSize: 9,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge:
            cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#A36D5D",
            color: "#FFFFFF",
            fontSize: 9,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bag" : "bag-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
