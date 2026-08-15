import axios from "axios";

import { getToken } from "@/storage/tokenStorage";

import { API_URL } from "@/config/api";

async function getAuthHeaders() {
  const token = await getToken();

  console.log("WISHLIST API TOKEN:", token ? "TOKEN FOUND" : "NO TOKEN");

  if (!token) {
    throw new Error("User is not logged in");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getWishlist() {
  const headers = await getAuthHeaders();

  const response = await axios.get(`${API_URL}/api/wishlist`, {
    headers,
  });

  return response.data.wishlist;
}

export async function updateWishlist(items: any[]) {
  const headers = await getAuthHeaders();

  const response = await axios.put(
    `${API_URL}/api/wishlist`,
    {
      items,
    },
    {
      headers,
    },
  );

  return response.data.wishlist;
}
