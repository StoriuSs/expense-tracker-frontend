import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'
import { UpdateSettingsData, SettingsResponse, ChangePasswordData } from '../types'

class SettingsService {
  async getSettings(): Promise<SettingsResponse> {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.SETTINGS)
    return response.data
  }

  async updateSettings(data: UpdateSettingsData): Promise<SettingsResponse> {
    const payload: Record<string, any> = {}
    
    if (data.preferredCurrency !== undefined) {
      payload.preferred_currency = data.preferredCurrency
    }
    if (data.defaultMonthlyBudget !== undefined) {
      payload.default_monthly_budget = data.defaultMonthlyBudget
    }
    if (data.budgetAlert !== undefined) {
      payload.budget_alert = data.budgetAlert
    }
    if (data.subscriptionReminder !== undefined) {
      payload.subscription_reminder = data.subscriptionReminder
    }
    if (data.budgetStartDay !== undefined) {
      payload.budget_start_day = data.budgetStartDay
    }

    const response = await axiosInstance.patch(API_ENDPOINTS.USERS.SETTINGS, payload)
    return response.data
  }

  async resetSettings(): Promise<SettingsResponse> {
    const response = await axiosInstance.put(API_ENDPOINTS.USERS.SETTINGS_RESET)
    return response.data
  }

  async changePassword(data: ChangePasswordData): Promise<any> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: data.currentPassword,
      new_password: data.newPassword,
    })
    return response.data
  }
}

const settingsService = new SettingsService()
export default settingsService
