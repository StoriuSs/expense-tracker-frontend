export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api/v1'

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    RESEND_CODE: '/auth/resend-code',
  },
  // User endpoints
  USERS: {
    ME: '/users/me',
    AVATAR: '/users/me/avatar',
    SETTINGS: '/users/settings',
  },
}

export const VERIFICATION_TYPES = {
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
}
