import axios from "axios";

import { API_URL } from "@/config/api";


export type Product = {
  _id: string;
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  thumbnail: string;
  image: string;
  category: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProductsResponse = {
  products: Product[];
};

export async function getProducts(): Promise<Product[]> {
  const response = await axios.get<ProductsResponse>(`${API_URL}/api/products`);

  return response.data.products;
}
