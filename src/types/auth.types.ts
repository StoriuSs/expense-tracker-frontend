export interface User {
  id: string
  email: string
  fullName: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  pendingVerification: {
    email: string
    type: 'register' | 'forgot_password'
    code?: string
    sentAt?: number // Timestamp when code was sent
  } | null
}

// Backend response types (snake_case from API)
export interface UserResponse {
  id: string
  email: string
  full_name: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
}

export interface VerifyData {
  email: string
  code: string
  type: 'register' | 'forgot_password'
}

export interface ResetPasswordData {
  code: string
  newPassword: string
}

export interface ResendCodeData {
  email: string
  type: 'register' | 'forgot_password'
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    id?: string
    email: string
    full_name: string
    is_verified?: boolean
    created_at?: string
    updated_at?: string
    access_token: string
  }
}

export interface AuthResponseNested {
  success: boolean
  message: string
  data: {
    user: UserResponse
    access_token: string
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}
