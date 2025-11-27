import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../../store'
import SettingsSection from './SettingsSection'
import { Camera, Loader2 } from 'lucide-react'
import usersService from '../../../services/usersService'
import authService from '../../../services/authService'
import toast from 'react-hot-toast'
import { User } from '../../../types'
import { getApiErrorMessage } from '../../../utils/errorUtils'

const ProfileSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isUploading, setIsUploading] = useState(false)

  // Helper to get full avatar URL
  const getAvatarUrl = (avatarPath: string | null | undefined): string | undefined => {
    if (!avatarPath) return undefined
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath
    }
    // Prepend base URL for relative paths
    const baseUrl = 'http://localhost:9000'
    return `${baseUrl}/${avatarPath}`
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Invalid file type. Please use JPEG or PNG')
      return
    }

    setIsUploading(true)
    try {
      await usersService.uploadAvatar(file)
      
      // Fetch updated profile
      const profileResponse = await usersService.getProfile()
      const userData = profileResponse.data.user
      
      // Update user in localStorage and Redux
      const updatedUser: User = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        avatar: getAvatarUrl(userData.avatar), // Convert to full URL
        isVerified: userData.is_verified,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      }
      
      authService.setUser(updatedUser)
      
      // Update Redux state
      dispatch({ type: 'auth/updateUser', payload: updatedUser })
      
      toast.success('Avatar uploaded successfully')
    } catch (error: any) {
      const message = getApiErrorMessage(error, 'Failed to upload avatar')
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newFullName = e.target.value.trim()
    
    // Don't update if name is empty or same as current
    if (!newFullName || newFullName === user?.fullName) {
      return
    }

    try {
      const response = await usersService.updateProfile({ fullName: newFullName })
      const userData = response.data.user
      
      // Update user in localStorage and Redux
      const updatedUser: User = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        avatar: getAvatarUrl(userData.avatar),
        isVerified: userData.is_verified,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      }
      
      authService.setUser(updatedUser)
      dispatch({ type: 'auth/updateUser', payload: updatedUser })
      
      toast.success('Profile updated successfully')
    } catch (error: any) {
      const message = getApiErrorMessage(error, 'Failed to update profile')
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection title="Profile" description="Manage your profile information">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0).toUpperCase()
              )}
            </div>
            
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {isUploading ? (
                <Loader2 size={24} className="text-white animate-spin" />
              ) : (
                <Camera size={24} className="text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">{user?.fullName}</h4>
            <p className="text-sm text-gray-500 mt-1">
              Upload a new avatar image (max 5MB)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              defaultValue={user?.fullName}
              onBlur={handleFullNameBlur}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your full name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}

export default ProfileSettings
