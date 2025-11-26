import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { updateSettings } from '../../../store/slices/settingsSlice'
import SettingsSection from './SettingsSection'

const NotificationSettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const { settings } = useSelector((state: RootState) => state.settings)

  const handleToggle = (field: 'budgetAlert' | 'subscriptionReminder') => {
    dispatch(updateSettings({ [field]: !settings?.[field] }))
  }

  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Notifications" 
        description="Manage your notification preferences"
      >
        {/* Budget Alert */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Budget Alert Notifications</h4>
            <p className="text-sm text-gray-500 mt-1">
              Get notified when you reach your budget thresholds
            </p>
          </div>
          <button
            onClick={() => handleToggle('budgetAlert')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.budgetAlert ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.budgetAlert ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Subscription Reminder */}
        <div className="flex items-center justify-between py-4">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Subscription Payment Reminders</h4>
            <p className="text-sm text-gray-500 mt-1">
              Receive reminders before subscription payments are due
            </p>
          </div>
          <button
            onClick={() => handleToggle('subscriptionReminder')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.subscriptionReminder ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.subscriptionReminder ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </SettingsSection>
    </div>
  )
}

export default NotificationSettings
