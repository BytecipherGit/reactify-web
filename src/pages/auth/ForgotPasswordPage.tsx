import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/redux'
import { forgotPassword, verifyForgotPasswordOTP, resetPassword, clearError } from '../../store/reducers/authSlice'
import { Button, Input, Card, CardContent, StatusMessage, LoadingSpinner, OTPInput } from '../../components/ui'
import { AuthLayout } from '../../components/auth/AuthLayout'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [section, setSection] = useState(1) // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState(40)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setIsTimerRunning(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timer])

  const handleSendOTP = async () => {
    if (email.length < 6) {
      setError('Email should not be null')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await dispatch(forgotPassword(email))
      if (forgotPassword.fulfilled.match(result)) {
        if (result.payload?.success) {
          setSection(2)
          setIsTimerRunning(true)
          setTimer(40)
        } else {
          setError(result.payload?.message || 'Failed to send OTP')
        }
      } else {
        const errorMsg = result.payload as string
        // Check if it's a CORS error
        if (errorMsg.includes('CORS')) {
          setError(
            'CORS Error: The server is not allowing requests from this origin. ' +
            'Please contact the administrator to add this origin to the allowed list.'
          )
        } else {
          setError(errorMsg || 'Failed to send OTP')
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred'
      if (errorMsg.includes('CORS')) {
        setError(
          'CORS Error: The server is not allowing requests from this origin. ' +
          'Please contact the administrator to add this origin to the allowed list.'
        )
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      setError('Enter complete OTP')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await dispatch(verifyForgotPasswordOTP({ email, otp }))
      if (verifyForgotPasswordOTP.fulfilled.match(result)) {
        if (result.payload?.success) {
          setToken(result.payload.forgotToken)
          setSection(3)
        } else {
          setError(result.payload?.message || 'Failed to verify OTP')
        }
      } else {
        setError((result.payload as string) || 'Failed to verify OTP')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = () => {
    setIsTimerRunning(true)
    setTimer(40)
    handleSendOTP()
  }

  const handleResetPassword = async () => {
    if (password.length < 6 || confirmPassword.length < 6) {
      setError('Password should be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await dispatch(resetPassword({ token, password, confirmPassword }))
      if (resetPassword.fulfilled.match(result)) {
        if (result.payload?.success) {
          // Redirect to login
          navigate('/login', { state: { message: 'Password reset successfully. Please login.' } })
        } else {
          setError(result.payload?.message || 'Failed to reset password')
        }
      } else {
        setError((result.payload as string) || 'Failed to reset password')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (section === 1) {
      handleSendOTP()
    } else if (section === 2) {
      handleVerifyOTP()
    } else if (section === 3) {
      handleResetPassword()
    }
  }

  return (
    <AuthLayout>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />
        <CardContent className="pt-4 relative">
          <div className="mb-4 text-xl font-semibold text-text">Forgot Password</div>
          <p className="mb-4 text-sm text-text-secondary">
            {section === 1 &&
              'Enter the email address associated with your account. We will send you OTP for reset your password'}
            {section === 2 && 'Enter Verification Code'}
            {section === 3 && 'Change your password'}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-4"
          >
            {error && (
              <StatusMessage
                type="error"
                message={error}
                gradient
                dismissible
                onDismiss={() => setError(null)}
              />
            )}

          <div className="space-y-4">
            {/* Section 1: Email */}
            {section === 1 && (
              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            )}

            {/* Section 2: OTP */}
            {section === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Verification Code
                  </label>
                  <OTPInput
                    length={4}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                  />
                </div>
                <div className="text-center">
                  {timer === 0 ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm font-semibold text-brand-primary hover:text-brand-secondary"
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      Resend OTP in {timer} seconds
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Reset Password */}
            {section === 3 && (
              <>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="New Password"
                  placeholder="Enter new password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  showPasswordToggle
                  autoFocus
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  showPasswordToggle
                />
              </>
            )}
          </div>

            <Button
              className="w-full bg-gradient-primary text-white hover:opacity-90"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" variant="white" />
                  {section === 1 && 'Sending...'}
                  {section === 2 && 'Verifying...'}
                  {section === 3 && 'Resetting...'}
                </span>
              ) : (
                <>
                  {section === 1 && 'Send Email'}
                  {section === 2 && 'Verify Code'}
                  {section === 3 && 'Change Password'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-gradient-primary hover:opacity-80 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
