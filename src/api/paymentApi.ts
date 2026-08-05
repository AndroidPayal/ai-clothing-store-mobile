import axios from "axios";
import { getToken } from "@/storage/tokenStorage";

const API_URL = "http://10.200.208.91:3000";

export async function createPaymentOrder(amount: number) {
  const token = await getToken();

  if (!token) {
    throw new Error("User is not logged in");
  }

  console.log("PAYMENT API TOKEN:", "TOKEN FOUND");

  const response = await axios.post(
    `${API_URL}/api/payment/create-order`,
    {
      amount,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  console.log("PAYMENT ORDER RESPONSE:", response.data);

  return response.data.order;
}
