import LoginScreen from "@/screens/auth/LoginScreen";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }
  return <LoginScreen />;
}
