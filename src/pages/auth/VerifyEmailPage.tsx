import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { verifyEmail, sendVerificationEmail } from '../../store/reducers/authSlice'
import { Button, Card, CardContent, StatusMessage, LoadingSpinner, OTPInput } from '../../components/ui'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { Mail, ArrowLeft } from 'lucide-react'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  // Get email from location state or URL params
  const emailFromState = (location.state as any)?.email
  const [email, setEmail] = useState(emailFromState || '')
  const [otp, setOtp] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [timer, setTimer] = useState(0)

  // // Send OTP automatically when page loads (if email is available)
  // useEffect(() => {
  //   if (!email) {
  //     navigate('/login', { replace: true })
  //     return
  //   }
    
  //   // Send OTP on initial load
  //   const sendInitialOTP = async () => {
  //     setIsResending(true)
  //     setErrorMsg(null)
  //     setSuccessMsg(null)

  //     try {
  //       const result = await dispatch(sendVerificationEmail(email))
  //       if (sendVerificationEmail.fulfilled.match(result)) {
  //         setSuccessMsg('Verification code sent to your email!')
  //         setTimer(60) // 60 seconds cooldown
  //       } else {
  //         const errorMsg = result.payload as string
  //         setErrorMsg(errorMsg || 'Failed to send verification code')
  //       }
  //     } catch (err) {
  //       setErrorMsg('An error occurred. Please try again.')
  //     } finally {
  //       setIsResending(false)
  //     }
  //   }
    
  //   sendInitialOTP()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []) // Only run once on mount

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleSendOTP = async () => {
    if (!email) {
      setErrorMsg('Email is required')
      return
    }

    setIsResending(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const result = await dispatch(sendVerificationEmail(email))
      if (sendVerificationEmail.fulfilled.match(result)) {
        setSuccessMsg('Verification code sent to your email!')
        setTimer(60) // 60 seconds cooldown
      } else {
        const errorMsg = result.payload as string
        setErrorMsg(errorMsg || 'Failed to send verification code')
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async () => {
    if (!otp || otp.length !== 4) {
      setErrorMsg('Please enter the complete 6-digit code')
      return
    }

    if (!email) {
      setErrorMsg('Email is required')
      return
    }

    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const result = await dispatch(verifyEmail({ email, otp }))
      if (verifyEmail.fulfilled.match(result)) {
        setSuccessMsg('Email verified successfully! Redirecting to login...')
        // Redirect to login after 1.5 seconds
        setTimeout(() => {
          navigate(`/login?verified=true&email=${encodeURIComponent(email)}`, { replace: true })
        }, 1500)
      } else {
        const errorMsg = result.payload as string
        setErrorMsg(errorMsg || 'Invalid verification code')
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.')
    }
  }

  const displayError = errorMsg || error

  return (
    <AuthLayout>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />
        <CardContent className="pt-4 relative">
          <div className="mb-6">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-text-secondary hover:text-text mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-text">Verify Your Email</div>
                <div className="text-sm text-text-secondary mt-1">
                  Enter the code sent to {email}
                </div>
              </div>
            </div>
          </div>

          {successMsg && (
            <StatusMessage type="success" message={successMsg} gradient className="mb-4" />
          )}

          {displayError && (
            <StatusMessage
              type="error"
              message={displayError}
              gradient
              dismissible
              onDismiss={() => setErrorMsg(null)}
              className="mb-4"
            />
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Verification Code
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={4}
                disabled={loading}
                className="justify-center"
              />
            </div>

            <Button
              className="w-full bg-gradient-primary text-white hover:opacity-90"
              onClick={handleVerify}
              disabled={loading || otp.length !== 4}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" variant="white" />
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isResending || timer > 0}
                className="text-sm font-semibold text-brand-primary hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {timer > 0 ? `Resend OTP in ${timer} seconds` : 'Resend OTP'}
              </button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-secondary text-center">
                Wrong email?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-brand-primary hover:opacity-80"
                >
                  Go back to login
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
