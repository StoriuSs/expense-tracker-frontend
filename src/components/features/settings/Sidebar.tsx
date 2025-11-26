import React from 'react'
import { NavLink } from 'react-router-dom'
import { User, Bell, Lock, Settings as SettingsIcon } from 'lucide-react'

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/settings/profile', icon: User, label: 'Profile' },
    { to: '/settings/preferences', icon: SettingsIcon, label: 'Preferences' },
    { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings/security', icon: Lock, label: 'Security' },
  ]

  return (
    <div className="w-60 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 shrink-0">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
