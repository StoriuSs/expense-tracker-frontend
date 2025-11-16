import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { RootState } from '../../store'

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
