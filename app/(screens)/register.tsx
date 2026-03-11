import { Button } from "@/components/Button";
import { InputField } from "@/components/Inputfield";
import { Colors } from "@/constants";
import Authservice from "@/services/Authservice";
import { Gender, Grade, RegisterRequest, UserRole } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Picker component for dropdowns
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
    instructorSecretKey: "",
    department: "",
    specialization: "",
    bio: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
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
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

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
      if (!formData.instructorSecretKey) {
        newErrors.instructorSecretKey = "Instructor secret key is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: RegisterRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined,
        gender: formData.gender || undefined,
        address: formData.address || undefined,
        instructorSecretKey: formData.instructorSecretKey,
      };

      if (role === "student") {
        payload.grade = formData.grade;
        if (formData.studentId) payload.studentId = formData.studentId;
      }

      if (role === "instructor") {
        payload.instructorId = formData.instructorId;
        payload.instructorSecretKey = formData.instructorSecretKey;
        if (formData.department) payload.department = formData.department;
        if (formData.specialization)
          payload.specialization = formData.specialization;
        if (formData.bio) payload.bio = formData.bio;
      }

      const response = await Authservice.register(payload);
      const userRole = response.data.user.role;

      if (userRole === "instructor") {
        router.replace("/instructor/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Please try again.");
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
                account and start {role === "student" ? "learning" : "teaching"}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="mb-6">
            {/* Personal Information */}
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

            {/* Academic Information */}
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
                      icon={<Text style={{ color: Colors.gray[400] }}>🎫</Text>}
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
                    onChangeText={(text) => updateField("specialization", text)}
                    icon={<Text style={{ color: Colors.gray[400] }}>📚</Text>}
                  />
                </>
              )}
            </View>

            {/* Instructor Access — secret key section */}
            {role === "instructor" && (
              <View className="mb-6">
                <Text
                  className="text-lg font-bold mb-1"
                  style={{ color: Colors.gray[900] }}
                >
                  Instructor Access
                </Text>
                <Text
                  className="text-sm mb-4"
                  style={{ color: Colors.gray[500] }}
                >
                  A secret key is required to verify your instructor status.
                  Contact your school administrator to obtain one.
                </Text>

                <InputField
                  label="Instructor Secret Key"
                  placeholder="Enter the secret key provided by admin"
                  value={formData.instructorSecretKey}
                  onChangeText={(text) =>
                    updateField("instructorSecretKey", text)
                  }
                  error={errors.instructorSecretKey}
                  secureTextEntry={!showSecretKey}
                  icon={<Text style={{ color: Colors.gray[400] }}>🔑</Text>}
                  rightIcon={
                    <Text style={{ color: Colors.gray[400] }}>
                      {showSecretKey ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  }
                  onRightIconPress={() => setShowSecretKey(!showSecretKey)}
                />
              </View>
            )}

            {/* Security */}
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
  scrollContent: { flexGrow: 1 },
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
