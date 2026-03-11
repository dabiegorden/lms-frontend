import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen onboarding or is logged in
    const checkAppState = async () => {
      try {
        // TODO: Check AsyncStorage for onboarding completion and auth token
        // const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        // const token = await AsyncStorage.getItem('authToken');

        // Simulate checking
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // For now, always show onboarding
        // In production:
        // if (token) router.replace('/(tabs)');
        // else if (hasSeenOnboarding) router.replace('/auth/login');
        // else router.replace('/onboarding');

        router.replace("/onboarding");
      } catch (error) {
        console.error("Error checking app state:", error);
        router.replace("/onboarding");
      }
    };

    checkAppState();
  }, []);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: Colors.primary[500] }}
    >
      <View className="items-center">
        {/* Logo placeholder */}
        <View
          className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          style={{ backgroundColor: Colors.white }}
        >
          <Text
            className="text-5xl font-bold"
            style={{ color: Colors.primary[500] }}
          >
            E
          </Text>
        </View>

        <Text className="text-3xl font-bold text-white mb-2">EduGhana LMS</Text>
        <Text className="text-lg text-white opacity-80 mb-8">
          Learn Anytime, Anywhere
        </Text>

        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    </View>
  );
}
