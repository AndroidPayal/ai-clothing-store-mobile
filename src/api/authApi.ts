import axios from "axios";

const API_URL = "http://10.200.208.91:3000";

export type SignupRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export async function signupUser(data: SignupRequest) {
  const response = await axios.post(`${API_URL}/api/auth/signup`, data);

  return response.data;
}

export async function loginUser(data: LoginRequest) {
  const response = await axios.post(`${API_URL}/api/auth/mobile-login`, data);

  return response.data;
}
export async function getCurrentUser(token: string) {
  const response = await axios.get(`${API_URL}/api/auth/mobile-me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
