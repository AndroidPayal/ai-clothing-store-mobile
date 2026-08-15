import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/api/authApi";
import axios from "axios";
import { Alert } from "react-native";
import { loginSchema, LoginFormData } from "@/schemas/authSchema";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import { saveToken } from "@/storage/tokenStorage";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      console.log("LOGIN SUCCESSFULLY THROUGH AUTH CONTEXT");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Login failed. Please try again.";

        Alert.alert("Login Failed", message);
      } else {
        Alert.alert("Login Failed", "Something went wrong. Please try again.");
      }
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>AI Clothing</Text>

        <Text style={styles.title}>Welcome</Text>

        <Text style={styles.subtitle}>
          Login to continue your fashion journey.
        </Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Email"
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />

        {/* Password */}
        <View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.password?.message}
              />
            )}
          />

          <Pressable
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showPassword}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        {/* Login Button */}
        <AppButton
          title="Login"
          onPress={handleSubmit(handleLogin)}
          loading={isSubmitting}
        />

        {/* Signup */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>

          <Pressable onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}> Sign up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 32,
  },

  showPasswordButton: {
    position: "absolute",
    right: 14,
    bottom: 28,
  },

  showPassword: {
    color: "#2563EB",
    fontWeight: "600",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  signupText: {
    color: "#6B7280",
    fontSize: 14,
  },

  signupLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});
