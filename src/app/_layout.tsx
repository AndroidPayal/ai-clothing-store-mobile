import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { OrderProvider } from "@/context/OrderContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="order/[id]" />
              <Stack.Screen name="checkout" />
            </Stack>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
