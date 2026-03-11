import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing } from "@/constants";
import { UserRole } from "@/types";

interface RoleCard {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

const roles: RoleCard[] = [
  {
    role: "student",
    title: "Student",
    description: "Access courses, submit assignments, and track your progress",
    icon: "🎓",
    color: Colors.primary[500],
    gradient: Colors.primary[400],
  },
  {
    role: "instructor",
    title: "Instructor",
    description: "Create courses, manage students, and grade assignments",
    icon: "👨‍🏫",
    color: Colors.secondary[500],
    gradient: Colors.secondary[400],
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Add slight delay for visual feedback
    setTimeout(() => {
      router.push(`/register?role=${role}`);
    }, 200);
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Header Section */}
          <View className="mb-10 mt-12">
            <View className="mb-6">
              <Text
                className="text-5xl font-bold mb-4"
                style={styles.mainTitle}
              >
                Welcome! 👋
              </Text>
              <Text className="text-xl leading-7" style={styles.subtitle}>
                Choose your role to begin your learning journey
              </Text>
            </View>
          </View>

          {/* Role Cards */}
          <View className="gap-5 mb-6">
            {roles.map((roleCard) => (
              <TouchableOpacity
                key={roleCard.role}
                onPress={() => handleRoleSelect(roleCard.role)}
                activeOpacity={0.9}
                className="rounded-3xl overflow-hidden"
                style={[
                  styles.roleCard,
                  selectedRole === roleCard.role && styles.roleCardSelected,
                ]}
              >
                {/* Card Background with Gradient Effect */}
                <View
                  className="absolute top-0 right-0 w-32 h-32 rounded-full"
                  style={[
                    styles.backgroundCircle,
                    { backgroundColor: `${roleCard.color}10` },
                  ]}
                />
                <View
                  className="absolute bottom-0 left-0 w-24 h-24 rounded-full"
                  style={[
                    styles.backgroundCircleSmall,
                    { backgroundColor: `${roleCard.color}08` },
                  ]}
                />

                <View className="p-6">
                  {/* Icon Container */}
                  <View
                    className="w-20 h-20 rounded-2xl items-center justify-center mb-5"
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${roleCard.color}20` },
                    ]}
                  >
                    <Text className="text-5xl">{roleCard.icon}</Text>
                  </View>

                  {/* Text Content */}
                  <View>
                    <Text
                      className="text-2xl font-bold mb-2"
                      style={{ color: Colors.gray[900] }}
                    >
                      {roleCard.title}
                    </Text>
                    <Text
                      className="text-base leading-6"
                      style={styles.cardDescription}
                    >
                      {roleCard.description}
                    </Text>
                  </View>

                  {/* Arrow Indicator */}
                  <View className="absolute bottom-6 right-6">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={[
                        styles.arrowContainer,
                        { backgroundColor: `${roleCard.color}15` },
                      ]}
                    >
                      <Text
                        className="font-bold text-lg"
                        style={{ color: roleCard.color }}
                      >
                        →
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View className="my-8 flex-row items-center">
            <View className="flex-1 h-px" style={styles.divider} />
            <Text className="mx-4 text-sm" style={styles.dividerText}>
              OR
            </Text>
            <View className="flex-1 h-px" style={styles.divider} />
          </View>

          {/* Sign In Section */}
          <View className="items-center mb-8">
            <Text className="text-base mb-4" style={styles.signInPrompt}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={navigateToLogin}
              activeOpacity={0.8}
              className="py-4 px-12 rounded-full border-2"
              style={styles.signInButton}
            >
              <Text
                className="text-base font-bold"
                style={{ color: Colors.primary[500] }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  mainTitle: {
    color: Colors.gray[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.gray[600],
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
  },
  roleCardSelected: {
    borderColor: Colors.primary[300],
    shadowOpacity: 0.15,
    transform: [{ scale: 0.98 }],
  },
  backgroundCircle: {
    transform: [{ translateX: 40 }, { translateY: -40 }],
  },
  backgroundCircleSmall: {
    transform: [{ translateX: -30 }, { translateY: 30 }],
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDescription: {
    color: Colors.gray[600],
    lineHeight: 22,
  },
  arrowContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    color: Colors.gray[400],
    fontWeight: "600",
  },
  signInPrompt: {
    color: Colors.gray[600],
    fontWeight: "500",
  },
  signInButton: {
    borderColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
