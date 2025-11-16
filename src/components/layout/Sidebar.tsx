import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
    },
    {
      name: 'Expenses',
      path: '/expenses',
      icon: '💰',
    },
    {
      name: 'Categories',
      path: '/categories',
      icon: '🏷️',
    },
    {
      name: 'Budgets',
      path: '/budgets',
      icon: '🎯',
    },
    {
      name: 'Subscriptions',
      path: '/subscriptions',
      icon: '🔄',
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: '📈',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: '⚙️',
    },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
