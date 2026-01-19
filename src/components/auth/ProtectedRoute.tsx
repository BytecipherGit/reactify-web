import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import { LoadingPage } from '../ui/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingPage message="Checking authentication..." />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if email is verified - redirect to verify email page if not verified
  // Only check if user is loaded and isVerified is explicitly false
  if (user && user.isVerified === false) {
    return (
      <Navigate
        to="/verify-email"
        state={{ email: user.email, from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}
