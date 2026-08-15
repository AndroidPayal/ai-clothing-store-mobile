import axios from "axios";

import { API_URL } from "@/config/api";
import { getToken } from "@/storage/tokenStorage";

async function getAuthHeaders() {
  const token = await getToken();

  if (!token) {
    throw new Error("User is not logged in");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getOrders() {
  const headers = await getAuthHeaders();

  const response = await axios.get(`${API_URL}/api/orders`, {
    headers,
  });

  return response.data.orders;
}

export async function getOrderById(orderId: string) {
  const headers = await getAuthHeaders();

  const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
    headers,
  });

  return response.data.order;
}
