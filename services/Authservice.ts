import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://10.100.102.131:5000"
    : "http://10.100.102.131:5000";

const REQUEST_TIMEOUT = 10000; // 10 seconds

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
  phoneNumber?: string;
  gender?: string;
  address?: string;
  grade?: string;
  studentId?: string;
  instructorId?: string;
  department?: string;
  specialization?: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}

// Helper function with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

class AuthService {
  async storeTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
  }

  async storeUser(user: any) {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  }

  async getAccessToken() {
    return await AsyncStorage.getItem("accessToken");
  }

  async getRefreshToken() {
    return await AsyncStorage.getItem("refreshToken");
  }

  async getUser() {
    const userStr = await AsyncStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  async clearAuth() {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
  }

  // ---------------- LOGIN ----------------
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log("LOGIN REQUEST →", `${API_URL}/api/auth/login`);

      const response = await fetchWithTimeout(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      await this.storeTokens(data.data.accessToken, data.data.refreshToken);
      await this.storeUser(data.data.user);

      return data;
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);

      if (error.name === "AbortError") {
        throw new Error("Request timeout. Server not responding.");
      }

      throw new Error("Network request failed. Check server & Expo config.");
    }
  }

  // ---------------- REGISTER ----------------
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log("REGISTER REQUEST →", `${API_URL}/api/auth/register`);

      const response = await fetchWithTimeout(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await this.storeTokens(data.data.accessToken, data.data.refreshToken);
      await this.storeUser(data.data.user);

      return data;
    } catch (error: any) {
      console.log("REGISTER ERROR:", error);
      throw new Error("Network request failed. Check server & Expo config.");
    }
  }

  async logout() {
    const accessToken = await this.getAccessToken();

    if (accessToken) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    await this.clearAuth();
  }

  async refreshAccessToken() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetchWithTimeout(
        `${API_URL}/api/auth/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        await this.clearAuth();
        return null;
      }

      await this.storeTokens(data.data.accessToken, data.data.refreshToken);

      return data.data.accessToken;
    } catch {
      await this.clearAuth();
      return null;
    }
  }

  async isAuthenticated() {
    return !!(await this.getAccessToken());
  }

  async getCurrentUser() {
    return await this.getUser();
  }
}

export default new AuthService();
