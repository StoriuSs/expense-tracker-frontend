// Settings types
export interface UserSettings {
  id: string
  userId: string
  preferredCurrency: 'usd' | 'eur' | 'vnd'
  defaultMonthlyBudget?: number
  budgetAlert: boolean
  subscriptionReminder: boolean
  budgetStartDay: number
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsData {
  preferredCurrency?: 'usd' | 'eur' | 'vnd'
  defaultMonthlyBudget?: number | null
  budgetAlert?: boolean
  subscriptionReminder?: boolean
  budgetStartDay?: number
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// API Response types
export interface SettingsResponse {
  meta: {
    code: string
    type: string
    message: string
  }
  data: {
    settings: {
      id: string
      user_id: string
      preferred_currency: string
      default_monthly_budget?: number
      budget_alert: boolean
      subscription_reminder: boolean
      budget_start_day: number
      created_at: string
      updated_at: string
    }
  }
}

export interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  error: string | null
  saveStatus: 'idle' | 'saving' | 'success' | 'error'
}
