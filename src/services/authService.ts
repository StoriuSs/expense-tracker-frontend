import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'
import {
  RegisterData,
  VerifyData,
  LoginCredentials,
  ResetPasswordData,
  ResendCodeData,
  AuthResponse,
  AuthResponseNested,
  ApiResponse,
  User,
} from '../types'

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
    })
    return response.data
  }

  async verify(data: VerifyData): Promise<AuthResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY, {
      email: data.email,
      code: data.code,
      type: data.type,
    })
    return response.data
  }

  async login(data: LoginCredentials): Promise<AuthResponseNested> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: data.email,
      password: data.password,
    })
    return response.data
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH)
    return response.data
  }

  async logout(): Promise<ApiResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    })
    return response.data
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      code: data.code,
      new_password: data.newPassword,
    })
    return response.data
  }

  async resendCode(data: ResendCodeData): Promise<ApiResponse> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_CODE, {
      email: data.email,
      type: data.type,
    })
    return response.data
  }

  // Helper methods
  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token)
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  removeAccessToken(): void {
    localStorage.removeItem('accessToken')
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  getUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  removeUser(): void {
    localStorage.removeItem('user')
  }

  clearAuth(): void {
    this.removeAccessToken()
    this.removeUser()
  }
}

export default new AuthService()
