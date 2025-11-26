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
  // Feature endpoints
  EXPENSES: {
    BASE: '/expenses',
    BY_ID: (id: string) => `/expenses/${id}`,
    SUMMARY: '/expenses/summary',
    BATCH_DELETE: '/expenses/batch-delete',
    RECEIPT: (id: string) => `/expenses/${id}/receipt`,
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  BUDGET_TEMPLATES: {
    BASE: '/budget-templates',
    BY_ID: (id: string) => `/budget-templates/${id}`,
  },
  BUDGET_PERIODS: {
    BASE: '/budget-periods',
    CURRENT_SUMMARY: '/budget-periods/current-summary',
    BY_ID: (id: string) => `/budget-periods/${id}`,
  },
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    BY_ID: (id: string) => `/subscriptions/${id}`,
    PAY: (id: string) => `/subscriptions/${id}/pay`,
  },
  STATISTICS: {
    TREND: '/statistics/trend',
    CATEGORIES: '/statistics/categories',
    BUDGETS: '/statistics/budgets',
    SUMMARY: '/statistics/summary',
    TOP_EXPENSES: '/statistics/top-expenses',
  },
}

export const VERIFICATION_TYPES = {
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
}
