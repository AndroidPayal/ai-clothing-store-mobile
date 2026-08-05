import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "@/storage/tokenStorage";

const API_URL = "http://10.200.208.91:3000";

async function getAuthHeaders() {
  const token = await getToken();
  console.log("CART API TOKEN:", token ? "TOKEN FOUND" : "NO TOKEN");

  if (!token) {
    throw new Error("User is not logged in");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getCart() {
  const headers = await getAuthHeaders();

  const response = await axios.get(`${API_URL}/api/cart`, {
    headers,
  });

  return response.data.cart;
}

export async function updateCart(items: any[]) {
  const headers = await getAuthHeaders();

  const response = await axios.put(
    `${API_URL}/api/cart`,
    {
      items,
    },
    {
      headers,
    },
  );

  return response.data.cart;
}
