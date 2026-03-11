import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants";
import { Gender, Grade, RegisterRequest, UserRole } from "@/types";
import { InputField } from "@/components/Inputfield";
import { Button } from "@/components/Button";

// Modern Picker component for dropdowns
const PickerField: React.FC<{
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  error?: string;
}> = ({ label, value, options, onSelect, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="mb-4">
      <Text
        className="text-sm font-semibold mb-2"
        style={{ color: Colors.gray[700] }}
      >
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className="px-4 py-4 rounded-2xl flex-row justify-between items-center"
        style={[
          styles.pickerButton,
          {
            borderColor: error ? Colors.error[500] : Colors.gray[200],
            backgroundColor: Colors.white,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text
          className="text-base"
          style={{
            color: value ? Colors.gray[900] : Colors.gray[400],
            fontWeight: value ? "500" : "400",
          }}
        >
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Text
          style={{
            color: Colors.gray[400],
            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
          }}
        >
          ▼
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <View
          className="mt-2 rounded-2xl overflow-hidden"
          style={styles.pickerDropdown}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className="px-4 py-3.5"
              style={{
                backgroundColor:
                  value === option.value ? Colors.primary[50] : Colors.white,
                borderBottomWidth: index < options.length - 1 ? 1 : 0,
                borderBottomColor: Colors.gray[100],
              }}
              activeOpacity={0.7}
            >
              <Text
                className="text-base"
                style={{
                  color:
                    value === option.value
                      ? Colors.primary[600]
                      : Colors.gray[700],
                  fontWeight: value === option.value ? "600" : "400",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {error && (
        <Text className="text-sm mt-1.5" style={{ color: Colors.error[500] }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = (params.role as UserRole) || "student";

  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    role,
    phoneNumber: "",
    gender: undefined,
    address: "",
    grade: undefined,
    studentId: "",
    instructorId: "",
    department: "",
    specialization: "",
    bio: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const gradeOptions = [
    { label: "SHS 1", value: "SHS 1" },
    { label: "SHS 2", value: "SHS 2" },
    { label: "SHS 3", value: "SHS 3" },
  ];

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const updateField = (field: keyof RegisterRequest, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Common validations
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role-specific validations
    if (role === "student") {
      if (!formData.grade) newErrors.grade = "Grade is required";
      if (formData.grade === "SHS 3" && !formData.studentId) {
        newErrors.studentId = "Student ID is required for SHS 3";
      }
    }

    if (role === "instructor") {
      if (!formData.instructorId) {
        newErrors.instructorId = "Instructor ID is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Replace with your actual backend URL
      const API_URL = "http://localhost:5000";

      // Prepare registration data
      const registrationData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
      };

      // Add role-specific fields
      if (role === "student") {
        registrationData.grade = formData.grade;
        if (formData.studentId) {
          registrationData.studentId = formData.studentId;
        }
      } else if (role === "instructor") {
        registrationData.instructorId = formData.instructorId;
        if (formData.department) {
          registrationData.department = formData.department;
        }
        if (formData.specialization) {
          registrationData.specialization = formData.specialization;
        }
        if (formData.bio) {
          registrationData.bio = formData.bio;
        }
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      Alert.alert(
        "Success",
        "Registration successful! You can now login with your credentials.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Registration failed. Please try again.",
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Header */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-8 w-12 h-12 rounded-2xl items-center justify-center"
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text className="text-2xl" style={{ color: Colors.gray[700] }}>
                ←
              </Text>
            </TouchableOpacity>

            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-3"
                  style={styles.roleIconContainer}
                >
                  <Text className="text-3xl">
                    {role === "student" ? "🎓" : "👨‍🏫"}
                  </Text>
                </View>
                <Text className="text-4xl font-bold" style={styles.mainTitle}>
                  Sign Up
                </Text>
              </View>
              <Text className="text-lg" style={styles.subtitle}>
                Create your {role === "student" ? "student" : "instructor"}{" "}
                account and start learning
              </Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View className="mb-8">
            <View className="flex-row items-center">
              <View className="flex-1 flex-row items-center">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: Colors.primary[500] }}
                >
                  <Text className="text-white text-xs font-bold">1</Text>
                </View>
                <View
                  className="flex-1 h-1 mx-2"
                  style={{ backgroundColor: Colors.primary[500] }}
                />
              </View>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: Colors.gray[200] }}
              >
                <Text className="text-gray-500 text-xs font-bold">2</Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text
                className="text-xs font-semibold"
                style={{ color: Colors.primary[600] }}
              >
                Account Details
              </Text>
              <Text className="text-xs" style={{ color: Colors.gray[400] }}>
                Complete
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Section: Personal Information */}
            <View className="mb-6">
              <Text
                className="text-lg font-bold mb-4"
                style={{ color: Colors.gray[900] }}
              >
                Personal Information
              </Text>

              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                error={errors.name}
                icon={<Text style={{ color: Colors.gray[400] }}>👤</Text>}
              />

              <InputField
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Text style={{ color: Colors.gray[400] }}>✉️</Text>}
              />

              <InputField
                label="Phone Number"
                placeholder="+233 XX XXX XXXX"
                value={formData.phoneNumber}
                onChangeText={(text) => updateField("phoneNumber", text)}
                keyboardType="phone-pad"
                icon={<Text style={{ color: Colors.gray[400] }}>📱</Text>}
              />

              <PickerField
                label="Gender"
                value={formData.gender || ""}
                options={genderOptions}
                onSelect={(value) => updateField("gender", value as Gender)}
              />
            </View>

            {/* Section: Academic Information */}
            {(role === "student" || role === "instructor") && (
              <View className="mb-6">
                <Text
                  className="text-lg font-bold mb-4"
                  style={{ color: Colors.gray[900] }}
                >
                  Academic Information
                </Text>

                {role === "student" && (
                  <>
                    <PickerField
                      label="Grade"
                      value={formData.grade || ""}
                      options={gradeOptions}
                      onSelect={(value) => updateField("grade", value as Grade)}
                      error={errors.grade}
                    />

                    {(formData.grade === "SHS 3" || formData.studentId) && (
                      <InputField
                        label={
                          formData.grade === "SHS 3"
                            ? "Student ID"
                            : "Student ID (Optional)"
                        }
                        placeholder="Enter your student ID"
                        value={formData.studentId}
                        onChangeText={(text) => updateField("studentId", text)}
                        error={errors.studentId}
                        icon={
                          <Text style={{ color: Colors.gray[400] }}>🎫</Text>
                        }
                      />
                    )}
                  </>
                )}

                {role === "instructor" && (
                  <>
                    <InputField
                      label="Instructor ID"
                      placeholder="Enter your instructor ID"
                      value={formData.instructorId}
                      onChangeText={(text) => updateField("instructorId", text)}
                      error={errors.instructorId}
                      icon={<Text style={{ color: Colors.gray[400] }}>🎫</Text>}
                    />

                    <InputField
                      label="Department"
                      placeholder="e.g., Mathematics, Science"
                      value={formData.department}
                      onChangeText={(text) => updateField("department", text)}
                      icon={<Text style={{ color: Colors.gray[400] }}>🏢</Text>}
                    />

                    <InputField
                      label="Specialization"
                      placeholder="e.g., Calculus, Physics"
                      value={formData.specialization}
                      onChangeText={(text) =>
                        updateField("specialization", text)
                      }
                      icon={<Text style={{ color: Colors.gray[400] }}>📚</Text>}
                    />
                  </>
                )}
              </View>
            )}

            {/* Section: Security */}
            <View className="mb-6">
              <Text
                className="text-lg font-bold mb-4"
                style={{ color: Colors.gray[900] }}
              >
                Security
              </Text>

              <InputField
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => updateField("password", text)}
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

              <InputField
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                icon={<Text style={{ color: Colors.gray[400] }}>🔒</Text>}
                rightIcon={
                  <Text style={{ color: Colors.gray[400] }}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                }
                onRightIconPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          {/* Terms */}
          <View className="mb-6 px-2">
            <Text
              className="text-sm text-center leading-5"
              style={{ color: Colors.gray[500] }}
            >
              By signing up, you agree to our{" "}
              <Text
                className="font-semibold"
                style={{ color: Colors.primary[600] }}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                className="font-semibold"
                style={{ color: Colors.primary[600] }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>

          {/* Sign In Link */}
          <View className="items-center pb-4">
            <View className="flex-row items-center">
              <Text className="text-base" style={{ color: Colors.gray[600] }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                activeOpacity={0.7}
              >
                <Text
                  className="text-base font-bold"
                  style={{ color: Colors.primary[600] }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  roleIconContainer: {
    backgroundColor: `${Colors.primary[500]}15`,
  },
  mainTitle: {
    color: Colors.gray[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.gray[600],
    lineHeight: 24,
  },
  pickerButton: {
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerDropdown: {
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: Colors.white,
  },
});
