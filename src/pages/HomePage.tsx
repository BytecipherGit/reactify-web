import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { loadUser } from '../store/reducers/authSlice'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui'
import { LoadingPage } from '../components/ui/loading'

export function HomePage() {
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Load user data on mount
    const token = localStorage.getItem('auth_token')
    if (token && !user) {
      dispatch(loadUser())
    }
  }, [dispatch, user])

  if (loading) {
    return <LoadingPage message="Loading your feed..." />
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text mb-6">
          Welcome to Reactify
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Hello, {user?.username || user?.email || 'User'}!</CardTitle>
            <CardDescription>
              This is the home page. Feed and other features will be implemented here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">
              Your feed will appear here once we implement the feed module.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
