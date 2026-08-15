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

export async function createPaymentOrder(amount: number) {
  const headers = await getAuthHeaders();

  const response = await axios.post(
    `${API_URL}/api/payment/create-order`,
    {
      amount,
    },
    {
      headers,
    },
  );

  return response.data.order;
}

export async function verifyPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  items: any[];
  total: number;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pinCode: string;
  };
}) {
  const headers = await getAuthHeaders();

  const response = await axios.post(`${API_URL}/api/payment/verify`, data, {
    headers,
  });

  return response.data.order;
}
