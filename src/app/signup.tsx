import SignupScreen from "@/screens/auth/SignupScreen";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }
  return <SignupScreen />;
}
