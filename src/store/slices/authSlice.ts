import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import {
  AuthState,
  RegisterData,
  LoginCredentials,
  VerifyData,
  ResetPasswordData,
  ResendCodeData,
  User,
  UserResponse,
} from '../../types'

// Define error type matching backend response structure
interface ApiError {
  response?: {
    data?: {
      meta?: {
        code?: string
        type?: string
        message?: string
        timestamp?: string
        request_id?: string
        request_duration?: number
      }
      data?: any
    }
  }
}

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      const apiError = error as ApiError
      const message = apiError.response?.data?.meta?.message || 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

// Helper to convert avatar path to full URL
const getAvatarUrl = (avatarPath: string | null | undefined): string | undefined => {
  if (!avatarPath) return undefined
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }
  const baseUrl = 'http://localhost:9000'
  return `${baseUrl}/${avatarPath}`
}

export const verify = createAsyncThunk<
  { user: User; accessToken: string } | null,
  VerifyData,
  { rejectValue: string }
>(
  'auth/verify',
  async (verifyData: VerifyData, { rejectWithValue }) => {
    try {
      const response = await authService.verify(verifyData)
      
      // If verification returns tokens (registration verification)
      if (response.data?.access_token) {
        authService.setAccessToken(response.data.access_token)
        
        // Fetch full user profile to ensure we have all details (like fullName)
        const profileResponse = await authService.getProfile()
        // Handle potential nested user object (e.g. data.user)
        const profileData = profileResponse.data as any
        const userResponse = profileData.user || profileData

        const user: User = {
          id: userResponse.id,
          email: userResponse.email,
          fullName: userResponse.full_name,
          avatar: getAvatarUrl(userResponse.avatar),
          isVerified: userResponse.is_verified,
          createdAt: userResponse.created_at,
          updatedAt: userResponse.updated_at,
        }
        authService.setUser(user)
        
        return { user, accessToken: response.data.access_token }
      }
      
      // For forgot password verification
      return null
    } catch (error) {
      const apiError = error as ApiError
      const message = apiError.response?.data?.meta?.message || 'Verification failed'
      return rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk<
  { user: User; accessToken: string },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      
      authService.setAccessToken(response.data.access_token)
      
      // Convert snake_case to camelCase for frontend use
      const userResponse = response.data.user as unknown as UserResponse
      const user: User = {
        id: userResponse.id,
        email: userResponse.email,
        fullName: userResponse.full_name,
        avatar: getAvatarUrl(userResponse.avatar),
        isVerified: userResponse.is_verified,
        createdAt: userResponse.created_at,
        updatedAt: userResponse.updated_at,
      }
      authService.setUser(user)
      
      return {
        user,
        accessToken: response.data.access_token,
      }
    } catch (error) {
      const apiError = error as ApiError
      // Backend returns: { meta: { message: "..." }, data: {...} }
      const message = apiError.response?.data?.meta?.message || 'Invalid email or password'
      return rejectWithValue(message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authService.logout()
      authService.clearAuth()
      return null
    } catch (error) {
      // Even if API call fails, clear local auth
      authService.clearAuth()
      return null
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      return response
    } catch (error) {
      const apiError = error as ApiError
      const message = apiError.response?.data?.meta?.message || 'Request failed'
      return rejectWithValue(message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data)
      return response
    } catch (error) {
      const apiError = error as ApiError
      const message = apiError.response?.data?.meta?.message || 'Password reset failed'
      return rejectWithValue(message)
    }
  }
)

export const resendCode = createAsyncThunk(
  'auth/resendCode',
  async (data: ResendCodeData, { rejectWithValue }) => {
    try {
      const response = await authService.resendCode(data)
      return response
    } catch (error) {
      const apiError = error as ApiError
      const message = apiError.response?.data?.meta?.message || 'Failed to resend code'
      return rejectWithValue(message)
    }
  }
)

export const restoreAuth = createAsyncThunk<
  { user: User; accessToken: string } | null
>(
  'auth/restoreAuth',
  async () => {
    try {
      const token = authService.getAccessToken()
      if (!token) return null

      // Verify token validity and get fresh user data
      const response = await authService.getProfile()
      // Handle potential nested user object (e.g. data.user)
      const profileData = response.data as any
      const userResponse = profileData.user || profileData
      
      const user: User = {
          id: userResponse.id,
          email: userResponse.email,
          fullName: userResponse.full_name,
          avatar: getAvatarUrl(userResponse.avatar),
          isVerified: userResponse.is_verified,
          createdAt: userResponse.created_at,
          updatedAt: userResponse.updated_at,
      }
      
      // Update local storage with fresh data
      authService.setUser(user)
      
      return { user, accessToken: token }
    } catch (error) {
      // If fetching profile fails (e.g. 401), clear auth
      authService.clearAuth()
      return null
    }
  }
)

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  pendingVerification: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setPendingVerification: (state, action: PayloadAction<{ email: string; type: 'register' | 'forgot_password'; code?: string; sentAt?: number }>) => {
      state.pendingVerification = action.payload
    },
    clearPendingVerification: (state) => {
      state.pendingVerification = null
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingVerification = {
          email: action.meta.arg.email,
          type: 'register',
          sentAt: Date.now(), // Store timestamp when code was sent
        }
        toast.success('Verification code sent to your email!')
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Verify
      .addCase(verify.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verify.fulfilled, (state, action) => {
        state.isLoading = false
        
        // If tokens are returned (registration verification)
        if (action.payload?.user) {
          state.user = action.payload.user
          state.isAuthenticated = true
          state.pendingVerification = null
          toast.success('Account verified successfully!')
        } else {
          // Forgot password verification - store the code for password reset
          if (state.pendingVerification) {
            state.pendingVerification.code = action.meta.arg.code
          }
          toast.success('Code verified successfully')
        }
      })
      .addCase(verify.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        toast.success('Login successful!')
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.pendingVerification = null
        toast.success('Logged out successfully')
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingVerification = {
          email: action.meta.arg,
          type: 'forgot_password',
          sentAt: Date.now(), // Store timestamp when code was sent
        }
        toast.success('Password reset code sent to your email')
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.pendingVerification = null
        toast.success('Password reset successfully!')
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Resend Code
      .addCase(resendCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendCode.fulfilled, (state) => {
        state.isLoading = false
        // Update timestamp when code is resent
        if (state.pendingVerification) {
          state.pendingVerification.sentAt = Date.now()
        }
        toast.success('Verification code resent!')
      })
      .addCase(resendCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Restore Auth
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.isInitialized = true
        if (action.payload) {
          state.user = action.payload.user
          state.isAuthenticated = true
        }
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.isInitialized = true
      })
  },
})

export const { clearError, setPendingVerification, clearPendingVerification, updateUser } = authSlice.actions
export default authSlice.reducer
