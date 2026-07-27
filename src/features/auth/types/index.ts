export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface SignupInput {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

export interface ForgotPasswordInput {
  email: string;
}
