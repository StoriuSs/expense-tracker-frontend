import { useSelector } from 'react-redux'
import { RootState } from '../store'

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.fullName}! 👋</h2>
        <p className="text-gray-600">
          Your expense tracker is ready. The authentication system is fully functional!
        </p>
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <h3 className="font-medium text-primary-900 mb-2">✅ Authentication Features Implemented:</h3>
          <ul className="space-y-1 text-sm text-primary-800">
            <li>• User Registration with email verification</li>
            <li>• Login with JWT authentication</li>
            <li>• Automatic token refresh using HTTP-only cookies</li>
            <li>• Logout functionality</li>
            <li>• Forgot password flow</li>
            <li>• Password reset with verification code</li>
            <li>• Resend verification code</li>
            <li>• Protected routes with route guards</li>
            <li>• Persistent authentication across page refreshes</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-2">💰</div>
          <h3 className="font-semibold text-gray-900">Expenses</h3>
          <p className="text-sm text-gray-600 mt-1">Coming soon...</p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900">Budget</h3>
          <p className="text-sm text-gray-600 mt-1">Coming soon...</p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-2">📈</div>
          <h3 className="font-semibold text-gray-900">Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">Coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
