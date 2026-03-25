import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
