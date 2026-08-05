import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";

import { signupSchema, SignupFormData } from "@/schemas/authSchema";
import { signupUser } from "@/api/authApi";

export default function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const handleSignup = async (data: SignupFormData) => {
    try {
      const response = await signupUser({
        fullName: data.name,
        email: data.email,
        password: data.password,
      });

      console.log("SIGNUP SUCCESS:", response);

      alert("Account created successfully!");

      router.push("/login");
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>AI Clothing</Text>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Create your account and start your fashion journey.
        </Text>

        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Full Name"
              placeholder="Enter your full name"
              value={value}
              onChangeText={onChange}
              autoCapitalize="words"
              error={errors.name?.message}
            />
          )}
        />

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
                placeholder="Create a password"
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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <AppInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={value}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.confirmPassword?.message}
            />
          )}
        />
        {/* Signup Button */}
        <AppButton
          title="Create Account"
          onPress={handleSubmit(handleSignup)}
          loading={isSubmitting}
        />

        {/* Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>

          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}> Login</Text>
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

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  loginText: {
    color: "#6B7280",
    fontSize: 14,
  },

  loginLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});
