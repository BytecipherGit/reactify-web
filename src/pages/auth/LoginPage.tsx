import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { login, clearError } from '../../store/reducers/authSlice'
import { Button, Input, Card, CardContent, StatusMessage, LoadingSpinner } from '../../components/ui'
import { AuthLayout } from '../../components/auth/AuthLayout'

// Social Login Button Component
function SocialLoginButton({
  provider,
  label,
  onClick,
}: {
  provider: 'google' | 'facebook' | 'apple'
  label: string
  onClick: () => void
}) {
  const getIcon = () => {
    switch (provider) {
      case 'google':
        return '🔵'
      case 'facebook':
        return '🔵'
      case 'apple':
        return '⚫'
      default:
        return ''
    }
  }

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2"
    >
      <span>{getIcon()}</span>
      {label}
    </Button>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Check for verification success message from URL params
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      const verifiedEmail = searchParams.get('email')
      if (verifiedEmail) {
        setEmail(decodeURIComponent(verifiedEmail))
        setSuccessMsg('Email verified successfully! You can now log in.')
        // Clean up URL
        navigate('/login', { replace: true })
      }
    }
  }, [searchParams, navigate])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/feed'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    dispatch(clearError())

    if (!email || !password) {
      setErr('Please fill in all fields')
      return
    }

    try {
      const result = await dispatch(login({ email, password }))
      
      // Only navigate to feed if login was truly successful
      if (login.fulfilled.match(result)) {
        const payload = result.payload as { token?: string; user?: any }
        
        // Double-check: ensure we have a valid user and token
        if (payload?.user && payload?.token && payload.user._id) {
          const from = (location.state as any)?.from?.pathname || '/feed'
          navigate(from, { replace: true })
        } else {
          setErr('Invalid login response. Please try again.')
        }
      } else {
        // Login was rejected - handle error
        const errorMsg = result.payload as string
        
        // Handle email verification error specifically - redirect to verify email page
        if (
          errorMsg?.toLowerCase().includes('verify') ||
          errorMsg?.toLowerCase().includes('verified') ||
          errorMsg?.includes('EMAIL_NOT_VERIFIED') ||
          errorMsg?.toLowerCase().includes('please verified')
        ) {
          // Redirect to email verification page with email
          navigate('/verify-email', { state: { email }, replace: true })
        } else {
          setErr(errorMsg || 'Invalid email or password')
        }
      }
    } catch (err: any) {
      // Fallback error handling
      const errorData = err?.response?.data
      if (
        errorData?.msg?.toLowerCase().includes('verify') ||
        errorData?.msg?.toLowerCase().includes('verified') ||
        errorData?.error === 'EMAIL_NOT_VERIFIED'
      ) {
        navigate('/verify-email', { state: { email }, replace: true })
      } else {
        setErr('An error occurred. Please try again.')
      }
    }
  }

  const displayError = err || error

  return (
    <AuthLayout>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />
        <CardContent className="pt-4 relative">
          <div className="mb-4 text-xl font-semibold text-text">Log in</div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              showPasswordToggle
            />
            {successMsg ? (
              <StatusMessage type="success" message={successMsg} gradient />
            ) : null}
            {displayError ? (
              <StatusMessage
                type="error"
                message={displayError}
                gradient
                dismissible
                onDismiss={() => setErr(null)}
              >
                {displayError.includes('verify your email') && (
                  <a
                    href="/register"
                    className="mt-2 block text-sm font-semibold text-error hover:underline"
                  >
                    Resend verification email
                  </a>
                )}
              </StatusMessage>
            ) : null}
            <Button
              className="w-full bg-gradient-primary text-white hover:opacity-90"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" variant="white" />
                  Logging in...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="text-xs text-text-muted">or</div>
            <div className="h-px flex-1 bg-border" />
          </div>
{/* 
          <div className="grid grid-cols-2 gap-2">
            <SocialLoginButton
              provider="google"
              label="Google"
              onClick={() => {
                // TODO: Implement Google OAuth when config keys are added
                // Example: Using @react-oauth/google
                // import { useGoogleLogin } from '@react-oauth/google'
                // const login = useGoogleLogin({
                //   onSuccess: (tokenResponse) => {
                //     handleGoogleLogin(tokenResponse.access_token, dispatch)
                //   },
                // })
                // login()
                alert('Google login - Config keys needed. Install @react-oauth/google and add GOOGLE_CLIENT_ID')
              }}
            />
            <SocialLoginButton
              provider="facebook"
              label="Facebook"
              onClick={() => {
                // TODO: Implement Facebook OAuth when config keys are added
                // Example: Using react-facebook-login
                // import FacebookLogin from 'react-facebook-login'
                alert('Facebook login - Config keys needed. Install react-facebook-login and add FACEBOOK_APP_ID')
              }}
            />
            <SocialLoginButton
              provider="apple"
              label="Apple"
              onClick={() => {
                // TODO: Implement Apple Sign In when config keys are added
                // Example: Using @apple/sign-in-with-apple-button
                alert('Apple login - Config keys needed. Install @apple/sign-in-with-apple-button and configure')
              }}
            />
          </div> */}

          <div className="mt-5 text-sm text-text-secondary">
            New here?{' '}
            <Link
              to="/register"
              className="font-semibold text-gradient-primary hover:opacity-80 transition-opacity"
            >
              Create an account
            </Link>
          </div>

          <div className="mt-4 text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-brand-primary hover:text-brand-secondary"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
