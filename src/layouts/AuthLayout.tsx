import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Moneymaze
          </h1>
          <p className="text-gray-600">Navigate your finances with ease</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
