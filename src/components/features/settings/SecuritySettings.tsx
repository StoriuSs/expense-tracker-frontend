import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { changePassword } from '../../../store/slices/settingsSlice'
import { logout } from '../../../store/slices/authSlice'
import SettingsSection from './SettingsSection'
import { Eye, EyeOff, Loader2, LogOut } from 'lucide-react'

const SecuritySettings: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter')
    if (!/[0-9]/.test(password)) errors.push('At least one number')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' })

    // Validation
    let hasError = false
    if (!passwordData.currentPassword) {
      setErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }))
      hasError = true
    }

    const passwordErrors = validatePassword(passwordData.newPassword)
    if (passwordErrors.length > 0) {
      setErrors(prev => ({ ...prev, newPassword: passwordErrors.join(', ') }))
      hasError = true
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      hasError = true
    }

    if (hasError) return

    setIsChangingPassword(true)
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap()
      
      // Reset form
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await dispatch(logout())
      navigate('/auth/login')
    }
  }

  const passwordStrength = validatePassword(passwordData.newPassword)
  const strengthColor = 
    passwordData.newPassword.length === 0 ? 'gray' :
    passwordStrength.length === 0 ? 'green' :
    passwordStrength.length <= 1 ? 'yellow' : 'red'

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <SettingsSection 
        title="Change Password" 
        description="Update your password to keep your account secure"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className={`w-full px-4 py-2 pr-10 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className={`w-full px-4 py-2 pr-10 border ${errors.newPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordData.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded ${strengthColor === 'green' ? 'bg-green-500' : strengthColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div className={`h-1 flex-1 rounded ${strengthColor === 'green' ? 'bg-green-500' : strengthColor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded ${strengthColor === 'green' ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
                <p className={`text-xs ${strengthColor === 'green' ? 'text-green-600' : strengthColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {strengthColor === 'green' ? 'Strong password' : strengthColor === 'yellow' ? 'Fair password' : 'Weak password'}
                </p>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full px-4 py-2 pr-10 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isChangingPassword && <Loader2 size={16} className="animate-spin" />}
            Change Password
          </button>
        </form>
      </SettingsSection>

      {/* Logout */}
      <SettingsSection 
        title="Account Actions" 
        description="Manage your account access"
      >
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </SettingsSection>
    </div>
  )
}

export default SecuritySettings
