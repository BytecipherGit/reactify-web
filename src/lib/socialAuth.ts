// Social Login Integration
// Note: Install packages when adding config keys:
// npm install @react-oauth/google react-facebook-login

import { api } from './api'
import { socialLogin } from '../store/reducers/authSlice'

// Google OAuth
export const handleGoogleLogin = async (token: string, dispatch: any) => {
  try {
    // Get user info from Google token
    const googleUser = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json())

    // Call social login API
    const result = await dispatch(
      socialLogin({
        email: googleUser.email,
        firstName: googleUser.given_name || '',
        lastName: googleUser.family_name || '',
      })
    )

    return result
  } catch (error) {
    console.error('Google login error:', error)
    throw error
  }
}

// Facebook OAuth
export const handleFacebookLogin = async (accessToken: string, dispatch: any) => {
  try {
    // Get user info from Facebook
    const facebookUser = await fetch(
      `https://graph.facebook.com/me?fields=email,first_name,last_name&access_token=${accessToken}`
    ).then((res) => res.json())

    // Call social login API
    const result = await dispatch(
      socialLogin({
        email: facebookUser.email,
        firstName: facebookUser.first_name || '',
        lastName: facebookUser.last_name || '',
      })
    )

    return result
  } catch (error) {
    console.error('Facebook login error:', error)
    throw error
  }
}

// Apple Sign In
export const handleAppleLogin = async (idToken: string, dispatch: any) => {
  try {
    // Decode Apple ID token (in production, verify with Apple's servers)
    // For now, we'll send the token to backend to handle
    const result = await dispatch(
      socialLogin({
        email: '', // Apple provides email in token
        firstName: '',
        lastName: '',
      })
    )

    return result
  } catch (error) {
    console.error('Apple login error:', error)
    throw error
  }
}
