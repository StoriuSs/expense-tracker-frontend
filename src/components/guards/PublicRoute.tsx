import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { RootState } from '../../store'

const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export default PublicRoute
