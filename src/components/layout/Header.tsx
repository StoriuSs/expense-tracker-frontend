 
import React from 'react'
import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation()
  
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1]
    if (!path) return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-20 px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        
        <div>
          <h2 className="text-xl font-bold text-gray-900">{getPageTitle()}</h2>
          <p className="text-sm text-gray-500 hidden sm:block">Welcome back, let's manage your finance.</p>
        </div>
      </div>
    </header>
  )
}

export default Header
