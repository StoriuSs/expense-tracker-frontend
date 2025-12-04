import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { updateSettings, resetSettings } from '../../../store/slices/settingsSlice'
import SettingsSection from './SettingsSection'
import ConfirmModal from '../../common/ConfirmModal'

import toast from 'react-hot-toast'

const PreferencesSettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const { settings } = useSelector((state: RootState) => state.settings)

  const [localStartDay, setLocalStartDay] = useState(settings?.budgetStartDay?.toString() || '1')
  const [localDefaultBudget, setLocalDefaultBudget] = useState(settings?.defaultMonthlyBudget?.toString() || '')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  useEffect(() => {
    if (settings) {
      setLocalStartDay(settings.budgetStartDay?.toString() || '1')
      setLocalDefaultBudget(settings.defaultMonthlyBudget?.toString() || '')
    }
  }, [settings])

  const handleDefaultBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDefaultBudget(e.target.value)
  }

  const handleDefaultBudgetBlur = () => {
    const value = localDefaultBudget.trim()
    const numValue = value === '' ? null : parseFloat(value)
    
    if (numValue === null || (numValue > 0 && !isNaN(numValue))) {
      if (numValue !== settings?.defaultMonthlyBudget) {
        dispatch(updateSettings({ defaultMonthlyBudget: numValue }))
      }
    } else {
      // Reset to current setting if invalid
      setLocalDefaultBudget(settings?.defaultMonthlyBudget?.toString() || '')
    }
  }

  const handleBudgetStartDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalStartDay(e.target.value)
  }

  const handleBudgetStartDayBlur = () => {
    const value = parseInt(localStartDay)
    if (!isNaN(value) && value >= 1 && value <= 28) {
      if (value !== settings?.budgetStartDay) {
        dispatch(updateSettings({ budgetStartDay: value }))
      }
    } else {
      // Reset to current setting if invalid
      toast.error('Budget start day must be between 1 and 28')
      setLocalStartDay(settings?.budgetStartDay?.toString() || '1')
    }
  }

  const handleResetConfirm = async () => {
    await dispatch(resetSettings())
    setIsResetModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Preferences" 
        description="Customize your app preferences"
      >
        {/* Currency (Disabled - USD only) */}
        <div className="mb-6">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Currency
          </label>
          <select
            id="currency"
            value="usd"
            disabled
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
          >
            <option value="usd">🇺🇸 USD - US Dollar</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Currency support coming soon</p>
        </div>

        {/* Default Monthly Budget */}
        <div className="mb-6">
          <label htmlFor="defaultBudget" className="block text-sm font-medium text-gray-700 mb-2">
            Default Monthly Budget (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              id="defaultBudget"
              type="number"
              min="0"
              step="0.01"
              value={localDefaultBudget}
              onChange={handleDefaultBudgetChange}
              onBlur={handleDefaultBudgetBlur}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This will be used when creating new budget templates
          </p>
        </div>

        {/* Budget Start Day */}
        <div className="mb-6">
          <label htmlFor="budgetStartDay" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Start Day
          </label>
          <input
            id="budgetStartDay"
            type="number"
            min="1"
            max="28"
            value={localStartDay}
            onChange={handleBudgetStartDayChange}
            onBlur={handleBudgetStartDayBlur}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your budget will reset on the <strong>{settings?.budgetStartDay || 1}th</strong> of each month
          </p>
        </div>

        {/* Budget Alert */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label htmlFor="budgetAlert" className="block text-sm font-medium text-gray-700">
                Budget Email Alerts
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Receive email notifications when you reach 80% or exceed your budget
              </p>
            </div>
            <button
              onClick={() => dispatch(updateSettings({ budgetAlert: !settings?.budgetAlert }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings?.budgetAlert ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings?.budgetAlert ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
          <p className="text-sm text-gray-500 mb-4">
            Resetting your settings will revert all preferences to their default values. This action cannot be undone.
          </p>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      </SettingsSection>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Settings?"
        message="Are you sure you want to reset all your preferences to their default values? This action cannot be undone."
        confirmText="Yes, Reset Settings"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon="danger"
      />
    </div>
  )
}

export default PreferencesSettings
