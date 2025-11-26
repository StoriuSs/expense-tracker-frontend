import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import settingsService from '../../services/settingsService'
import toast from 'react-hot-toast'
import { SettingsState, UserSettings, UpdateSettingsData, ChangePasswordData } from '../../types'

// Helper to convert snake_case API response to camelCase
const convertSettings = (apiSettings: any): UserSettings => ({
  id: apiSettings.id,
  userId: apiSettings.user_id,
  preferredCurrency: apiSettings.preferred_currency,
  defaultMonthlyBudget: apiSettings.default_monthly_budget,
  budgetAlert: apiSettings.budget_alert,
  subscriptionReminder: apiSettings.subscription_reminder,
  budgetStartDay: apiSettings.budget_start_day,
  createdAt: apiSettings.created_at,
  updatedAt: apiSettings.updated_at,
})

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.getSettings()
      return convertSettings(response.data.settings)
    } catch (error: any) {
      const message = error.response?.data?.meta?.message || 'Failed to load settings'
      return rejectWithValue(message)
    }
  }
)

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (data: UpdateSettingsData, { rejectWithValue }) => {
    try {
      const response = await settingsService.updateSettings(data)
      return convertSettings(response.data.settings)
    } catch (error: any) {
      const message = error.response?.data?.meta?.message || 'Failed to update settings'
      return rejectWithValue(message)
    }
  }
)

export const resetSettings = createAsyncThunk(
  'settings/reset',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.resetSettings()
      return convertSettings(response.data.settings)
    } catch (error: any) {
      const message = error.response?.data?.meta?.message || 'Failed to reset settings'
      return rejectWithValue(message)
    }
  }
)

export const changePassword = createAsyncThunk(
  'settings/changePassword',
  async (data: ChangePasswordData, { rejectWithValue }) => {
    try {
      await settingsService.changePassword(data)
      return null
    } catch (error: any) {
      const message = error.response?.data?.meta?.message || 'Failed to change password'
      return rejectWithValue(message)
    }
  }
)

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
  saveStatus: 'idle',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSaveStatus: (state) => {
      state.saveStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.saveStatus = 'saving'
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saveStatus = 'success'
        state.settings = action.payload
        toast.success('Settings updated successfully')
        
        // Reset save status after 2 seconds
        setTimeout(() => {
          state.saveStatus = 'idle'
        }, 2000)
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saveStatus = 'error'
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Reset Settings
      .addCase(resetSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = action.payload
        toast.success('Settings reset to defaults')
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        toast.success('Password changed successfully')
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        toast.error(action.payload as string)
      })
  },
})

export const { clearError, clearSaveStatus } = settingsSlice.actions
export default settingsSlice.reducer
