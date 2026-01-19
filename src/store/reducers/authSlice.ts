import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../lib/api'
import { initializeSocket } from '../../lib/socket'

export interface User {
  _id: string
  id?: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  media?: string
  isOwnerAdmin?: boolean
  isFirstTime?: boolean
  subscriptionType?: {
    subType: string
    status?: string
    currentPeriodEnd?: string | null
  }
  followers?: string[]
  following?: string[]
  [key: string]: any
}

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  user: User | null
  error: string | null
  followers: string[]
  following: string[]
  registerFlow: boolean
  socialAlreadyLogin: string | null
  errorInSocial: string | null
  socialLoading: boolean
}

const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null,
  followers: [],
  following: [],
  registerFlow: false,
  socialAlreadyLogin: null,
  errorInSocial: null,
  socialLoading: false,
}

// Async thunks
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('No token found')
    }

    const response = await api.get('/auth', {
      headers: {
        'x-auth-token': token,
      },
    })

    return response.data
  } catch (error: any) {
    const errors = error.response?.data?.errors
    if (errors) {
      if (Array.isArray(errors)) {
        return rejectWithValue(errors[0].msg || 'Failed to load user')
      }
      return rejectWithValue(errors.msg || 'Failed to load user')
    }
    return rejectWithValue(error.message || 'Failed to load user')
  }
})

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const responseData = response.data

      // CRITICAL: Check if the response indicates failure (success: false)
      // The API may return 200 status with success: false for errors
      if (responseData?.success === false || !responseData?.success) {
        const errorMsg = responseData?.msg || responseData?.error || responseData?.message || 'Login failed'
        
        // Check if it's an email verification error
        if (
          errorMsg?.toLowerCase().includes('verify') ||
          errorMsg?.toLowerCase().includes('verified') ||
          responseData?.error === 'EMAIL_NOT_VERIFIED' ||
          responseData?.code === 'AUTH_EMAIL_NOT_VERIFIED'
        ) {
          return rejectWithValue(errorMsg)
        }
        
        return rejectWithValue(errorMsg)
      }

      // Only proceed if success is explicitly true
      if (responseData?.success !== true) {
        return rejectWithValue(responseData?.msg || responseData?.error || 'Login failed')
      }

      // Extract user from response (could be responseData.user or responseData itself)
      const user = responseData.user || responseData
      
      // Validate that we have a valid user object
      if (!user || !user._id) {
        return rejectWithValue('Invalid response from server')
      }

      // Extract token from header or response body
      const token = response.headers['x-auth-token'] || responseData.token || user.token || user.jwt
      if (!token) {
        return rejectWithValue('No authentication token received')
      }

      localStorage.setItem('auth_token', token)

      return { token, user }
    } catch (error: any) {
      // Handle HTTP error responses (4xx, 5xx)
      const errorData = error.response?.data
      
      // Check for email verification error
      if (
        error.response?.status === 400 &&
        (errorData?.msg?.toLowerCase().includes('verify') ||
          errorData?.msg?.toLowerCase().includes('verified') ||
          errorData?.error === 'EMAIL_NOT_VERIFIED' ||
          errorData?.code === 'AUTH_EMAIL_NOT_VERIFIED')
      ) {
        return rejectWithValue(errorData?.msg || 'Please verify your email address')
      }

      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Login failed')
        }
        return rejectWithValue(errors.msg || 'Login failed')
      }
      
      return rejectWithValue(errorData?.msg || errorData?.error || error.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (
    {
      email,
      profileType,
      username,
      firstName,
      lastName,
      password,
      confirmPassword,
      phone,
      code,
      selectedOption,
      referralId,
    }: {
      email: string
      profileType: string
      username: string
      firstName: string
      lastName: string
      password: string
      confirmPassword: string
      phone?: string
      code?: string
      selectedOption?: { _id: string }
      referralId?: string
    },
    { rejectWithValue }
  ) => {
    try {
      // Match mobile app payload structure exactly
      // Always include phone, category, countryCode (empty strings for personal)
      const payload: any = {
        email,
        profileType,
        username,
        firstName: firstName === '' ? username : firstName,
        lastName,
        password,
        confirmpassword: confirmPassword,
        phone: profileType === 'business' ? phone || '' : '',
        category: profileType === 'business' ? selectedOption?._id || '' : '',
        countryCode: profileType === 'business' ? code || '' : '',
      }

      // Add referral ID if provided
      if (referralId) {
        payload.refred_id = referralId
      }

      const response = await api.post('/auth/signup', payload)
      const data = response.data

      if (data.status === 200 || response.status === 200) {
        return { email, data }
      } else {
        return rejectWithValue(data?.error || data?.message || 'Registration failed')
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Registration failed')
        }
        return rejectWithValue(errors.msg || 'Registration failed')
      }
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const sendVerificationEmail = createAsyncThunk(
  'auth/sendVerificationEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/sendverifymail', { email })
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to send verification email')
        }
        return rejectWithValue(errors.msg || 'Failed to send verification email')
      }
      return rejectWithValue(error.message || 'Failed to send verification email')
    }
  }
)

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verifymail', data)

      if (response.status === 200) {
        const user = response.data
        const token = response.headers['x-auth-token'] || user.token || user.jwt

        if (token) {
          localStorage.setItem('auth_token', token)
        }

        return { token, user }
      } else {
        return rejectWithValue('Please enter a valid OTP')
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors || []
      if (errors.length > 0) {
        return rejectWithValue(Array.isArray(errors) ? errors[0] : errors)
      }
      // Handle error message from response
      const errorMsg = error.response?.data?.msg || error.response?.data?.error || error.message
      return rejectWithValue(errorMsg || 'Verification failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  return null
})

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot', { email })
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to send OTP')
        }
        return rejectWithValue(errors.msg || 'Failed to send OTP')
      }
      return rejectWithValue(error.message || 'Failed to send OTP')
    }
  }
)

export const verifyForgotPasswordOTP = createAsyncThunk(
  'auth/verifyForgotPasswordOTP',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verifyotp', { email, otp })
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to verify OTP')
        }
        return rejectWithValue(errors.msg || 'Failed to verify OTP')
      }
      return rejectWithValue(error.message || 'Failed to verify OTP')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    { token, password, confirmPassword }: { token: string; password: string; confirmPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/auth/reset?token=${token}`, {
        password,
        confirmpassword: confirmPassword,
      })
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to reset password')
        }
        return rejectWithValue(errors.msg || 'Failed to reset password')
      }
      return rejectWithValue(error.message || 'Failed to reset password')
    }
  }
)

export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async (
    {
      email,
      firstName,
      lastName,
      referralId,
    }: {
      email: string
      firstName: string
      lastName: string
      referralId?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const payload: any = {
        email,
        firstName,
        lastName,
      }

      if (referralId) {
        payload.refred_id = referralId
      }

      const response = await api.post('/auth/social', payload)

      if (response.status === 200) {
        const user = response.data
        const token = response.headers['x-auth-token'] || user.token || user.jwt

        if (token) {
          localStorage.setItem('auth_token', token)
        }

        return { token, user, status: response.status }
      } else {
        return rejectWithValue(response.data?.error || response.data?.message || 'Social login failed')
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Social login failed')
        }
        return rejectWithValue(errors.msg || 'Social login failed')
      }
      return rejectWithValue(error.message || 'Social login failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setRegisterFlow: (state, action: PayloadAction<boolean>) => {
      state.registerFlow = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        const user = action.payload
        localStorage.setItem('user', JSON.stringify(user))
        state.loading = false
        state.isAuthenticated = true
        // Ensure user object has isVerified property
        if (user && user.isVerified === undefined) {
          // If not set, assume verified (since user is authenticated)
          user.isVerified = true
        }
        state.user = user
        state.followers = user.followers || []
        state.following = user.following || []
        state.error = null
        // Initialize socket for real-time features
        if (user) {
          initializeSocket(user)
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload as string
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.registerFlow = false
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        const { token, user } = action.payload
        state.isAuthenticated = true
        // Ensure user object has isVerified property
        if (user) {
          // If isVerified is not set, assume it's true (since login succeeded)
          if (user.isVerified === undefined) {
            user.isVerified = true
          }
        }
        state.user = user
        state.token = token
        state.loading = false
        state.error = null
        state.followers = user.followers || []
        state.following = user.following || []
        // Initialize socket for real-time features
        if (user) {
          initializeSocket(user)
        }
      })
      .addCase(login.rejected, (state, action) => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        state.error = action.payload as string
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Registration success - user needs to verify email
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = action.payload as string
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      })

      // Send Verification Email
      .addCase(sendVerificationEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendVerificationEmail.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        const { token, user } = action.payload
        state.registerFlow = true
        state.isAuthenticated = true
        state.token = token
        // Ensure user is marked as verified
        if (user) {
          user.isVerified = true
        }
        state.user = user
        state.loading = false
        state.error = null
        // Initialize socket for real-time features
        if (user) {
          initializeSocket(user)
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.error = null
        state.loading = false
        state.followers = []
        state.following = []
      })
      .addCase(logout.rejected, (state) => {
        state.isAuthenticated = false
        state.token = null
        state.user = null
        state.error = null
        state.loading = false
      })

      // Social Login
      .addCase(socialLogin.pending, (state) => {
        state.socialLoading = true
        state.error = null
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        const { token, user, status } = action.payload

        if (status === 200) {
          if ('userstatus' in user) {
            state.socialAlreadyLogin = 'true'
            state.user = user
            state.token = token
            state.isAuthenticated = true
            state.errorInSocial = 'OK'
            // Initialize socket for real-time features
            if (user) {
              initializeSocket(user)
            }
          } else {
            state.socialAlreadyLogin = 'false'
          }
          state.socialLoading = false
          state.error = null
        } else if (status === 404) {
          state.errorInSocial = 'NotOK'
          state.socialLoading = false
          state.error = 'User not found'
        }
      })
      .addCase(socialLogin.rejected, (state, action) => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        state.error = action.payload as string
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.socialLoading = false
      })
  },
})

export const { clearError, setRegisterFlow } = authSlice.actions
export default authSlice.reducer
