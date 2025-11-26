import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/features/settings/Sidebar'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { fetchSettings } from '../store/slices/settingsSlice'

const Settings: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default Settings
