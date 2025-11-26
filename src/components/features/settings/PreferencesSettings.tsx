import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { updateSettings } from '../../../store/slices/settingsSlice'
import SettingsSection from './SettingsSection'

const PreferencesSettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const { settings } = useSelector((state: RootState) => state.settings)

  const handleDefaultBudgetChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    const numValue = value === '' ? null : parseFloat(value)
    
    if (numValue === null || (numValue > 0 && !isNaN(numValue))) {
      dispatch(updateSettings({ defaultMonthlyBudget: numValue }))
    }
  }

  const handleBudgetStartDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value >= 1 && value <= 28) {
      dispatch(updateSettings({ budgetStartDay: value }))
    }
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
              defaultValue={settings?.defaultMonthlyBudget || ''}
              onBlur={handleDefaultBudgetChange}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This will be used when creating new budget templates
          </p>
        </div>

        {/* Budget Start Day */}
        <div>
          <label htmlFor="budgetStartDay" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Start Day
          </label>
          <input
            id="budgetStartDay"
            type="number"
            min="1"
            max="28"
            value={settings?.budgetStartDay || 1}
            onChange={handleBudgetStartDayChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your budget will reset on the <strong>{settings?.budgetStartDay || 1}th</strong> of each month
          </p>
        </div>
      </SettingsSection>
    </div>
  )
}

export default PreferencesSettings
