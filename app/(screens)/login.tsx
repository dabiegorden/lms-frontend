import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants";
import { InputField } from "@/components/Inputfield";
import { Button } from "@/components/Button";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Replace with your actual backend URL
      const API_URL = "http://localhost:5000";

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      Alert.alert("Success", "Login successful!");

      // Role-based navigation
      const userRole = data.data.user.role;

      if (userRole === "admin") {
        router.replace("/admin/dashboard");
      } else if (userRole === "instructor") {
        router.replace("/instructor/dashboard");
      } else if (userRole === "student") {
        router.replace("/student/dashboard");
      } else {
        router.replace("/onboarding");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header */}
          <View className="mb-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6"
              activeOpacity={0.7}
            >
              <Text className="text-3xl" style={{ color: Colors.gray[700] }}>
                ←
              </Text>
            </TouchableOpacity>

            <Text
              className="text-4xl font-bold mb-3"
              style={{ color: Colors.gray[900] }}
            >
              Welcome Back
            </Text>
            <Text className="text-lg" style={{ color: Colors.gray[600] }}>
              Sign in to continue your learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <InputField
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text: any) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Text style={{ color: Colors.gray[400] }}>✉️</Text>}
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text: any) => {
                setPassword(text);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              secureTextEntry={!showPassword}
              icon={<Text style={{ color: Colors.gray[400] }}>🔒</Text>}
              rightIcon={
                <Text style={{ color: Colors.gray[400] }}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              activeOpacity={0.7}
              className="self-end mb-6"
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: Colors.primary[500] }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button title="Sign In" onPress={handleLogin} loading={loading} />
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: Colors.gray[300] }}
            />
            <Text className="mx-4 text-sm" style={{ color: Colors.gray[500] }}>
              OR
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: Colors.gray[300] }}
            />
          </View>

          {/* Social Login */}
          <View className="gap-3 mb-8">
            <Button
              title="Continue with Google"
              variant="outline"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Google login will be available soon",
                )
              }
              icon={<Text className="text-xl">🔍</Text>}
            />
          </View>

          {/* Sign Up Link */}
          <View className="items-center">
            <View className="flex-row items-center">
              <Text className="text-base" style={{ color: Colors.gray[600] }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/role")}
                activeOpacity={0.7}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: Colors.primary[500] }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
