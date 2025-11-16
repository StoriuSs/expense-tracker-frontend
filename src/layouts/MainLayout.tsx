import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16"> {/* Add top padding to account for fixed header */}
        <Sidebar />
        <main className="flex-1 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
