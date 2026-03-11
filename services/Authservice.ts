import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://lms-p4cvc.sevalla.app";
const REQUEST_TIMEOUT = 10000;

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
  // Student fields
  grade?: string;
  studentId?: string;
  // Instructor fields
  instructorId?: string;
  instructorSecretKey?: string;
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
  // ─── Storage ─────────────────────────────────────────────────────────────────

  async storeTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.multiSet([
      ["accessToken", accessToken],
      ["refreshToken", refreshToken],
    ]);
  }

  async storeUser(user: any) {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  }

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem("accessToken");
  }

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem("refreshToken");
  }

  async getUser(): Promise<any | null> {
    const raw = await AsyncStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }

  async clearAuth() {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const text = await response.text();
      const data: AuthResponse = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error((data as any).message || "Login failed");
      }

      await this.storeTokens(data.data.accessToken, data.data.refreshToken);
      await this.storeUser(data.data.user);

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please check your connection.");
      }
      throw new Error(error.message || "Network error. Please try again.");
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Strip empty / undefined optional fields before sending
      const payload: Record<string, any> = { ...userData };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await fetchWithTimeout(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data: AuthResponse = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error((data as any).message || "Registration failed");
      }

      await this.storeTokens(data.data.accessToken, data.data.refreshToken);
      await this.storeUser(data.data.user);

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please check your connection.");
      }
      throw new Error(error.message || "Network error. Please try again.");
    }
  }

  async logout() {
    try {
      const accessToken = await this.getAccessToken();
      if (accessToken) {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch {
      // Silently fail — always clear local auth
    } finally {
      await this.clearAuth();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetchWithTimeout(
        `${BASE_URL}/api/auth/refresh-token`,
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

  async getProfile(): Promise<any> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch profile");
    }

    await this.storeUser(data.data.user);
    return data.data.user;
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getAccessToken());
  }

  async getCurrentUser(): Promise<any | null> {
    return this.getUser();
  }
}

export default new AuthService();
