export type UserRole = "student" | "instructor";

export type Grade = "SHS 1" | "SHS 2" | "SHS 3";

export type Gender = "male" | "female" | "other";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  // Student fields
  studentId?: string;
  grade?: Grade;
  enrolledCourses?: string[];
  // Instructor fields
  instructorId?: string;
  department?: string;
  specialization?: string;
  bio?: string;
  // Account status
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  gender?: Gender;
  address?: string;
  // Student fields
  grade?: Grade;
  studentId?: string;
  // Instructor fields
  instructorId?: string;
  department?: string;
  specialization?: string;
  bio?: string;
  instructorSecretKey: string;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  color: string;
}
