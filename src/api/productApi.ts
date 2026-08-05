import axios from "axios";

const API_URL = "http://10.200.208.91:3000";

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
