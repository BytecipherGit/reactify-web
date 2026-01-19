import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../lib/api'
import { loadUser } from './authSlice'

// Types - Matching mobile app structure
export interface ProfileUser {
  _id: string
  username: string
  firstName: string
  lastName: string
  email?: string
  profilePicture?: string
  media?: string
  bio?: string
  followers?: Array<{ _id: string; [key: string]: any }>
  following?: Array<{ _id: string; [key: string]: any }>
  blockedBy?: string[]
  [key: string]: any
}

interface ProfileState {
  user: ProfileUser | null
  loading: boolean
  error: string | null
  followLoad: boolean
  editProfileLoading: boolean
  blockUserLoading: boolean
  referList: any
  referLoading: boolean
  blockedUsers: ProfileUser[]
  blockedUsersLoading: boolean
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
  followLoad: false,
  editProfileLoading: false,
  blockUserLoading: false,
  referList: null,
  referLoading: false,
  blockedUsers: [],
  blockedUsersLoading: false,
}

// Async Thunks - Matching mobile app
export const getUserProfile = createAsyncThunk(
  'profile/getUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/${userId}`)
      // Mobile app returns user object with followers and following arrays
      return response.data?.data || response.data || response.data?.user
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch profile')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch profile')
      }
      return rejectWithValue(error.message || 'Failed to fetch profile')
    }
  }
)

export const followUser = createAsyncThunk(
  'profile/followUser',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/user/follow/${userId}`)
      // Refresh profile and current user (matching mobile app)
      dispatch(getUserProfile(userId))
      dispatch(loadUser())
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to follow user')
        }
        return rejectWithValue(errors.msg || 'Failed to follow user')
      }
      return rejectWithValue(error.message || 'Failed to follow user')
    }
  }
)

export const unfollowUser = createAsyncThunk(
  'profile/unfollowUser',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/user/unfollow/${userId}`)
      // Refresh profile and current user (matching mobile app)
      dispatch(getUserProfile(userId))
      dispatch(loadUser())
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to unfollow user')
        }
        return rejectWithValue(errors.msg || 'Failed to unfollow user')
      }
      return rejectWithValue(error.message || 'Failed to unfollow user')
    }
  }
)

export const blockUser = createAsyncThunk(
  'profile/blockUser',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/user/actions/block/${userId}`)
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to block user')
        }
        return rejectWithValue(errors.msg || 'Failed to block user')
      }
      return rejectWithValue(error.message || 'Failed to block user')
    }
  }
)

export const editProfile = createAsyncThunk(
  'profile/editProfile',
  async (formData: any, { dispatch, rejectWithValue }) => {
    try {
      // Backend expects JSON with media as URL string (matching mobile app)
      // Mobile app uploads to S3 first, then sends JSON
      const response = await api.post('/user/update', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // Refresh current user (matching mobile app)
      dispatch(loadUser())
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to update profile')
        }
        return rejectWithValue(errors.msg || 'Failed to update profile')
      }
      return rejectWithValue(error.message || 'Failed to update profile')
    }
  }
)

export const followUserFromList = createAsyncThunk(
  'profile/followUserFromList',
  async ({ userId, profileId }: { userId: string; profileId: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/user/follow/${userId}`)
      // Refresh profile and current user (matching mobile app)
      dispatch(getUserProfile(profileId))
      dispatch(loadUser())
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to follow user')
        }
        return rejectWithValue(errors.msg || 'Failed to follow user')
      }
      return rejectWithValue(error.message || 'Failed to follow user')
    }
  }
)

export const unFollowFromListUser = createAsyncThunk(
  'profile/unFollowFromListUser',
  async ({ userId, profileId }: { userId: string; profileId: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/user/unfollow/${userId}`)
      // Refresh profile and current user (matching mobile app)
      dispatch(getUserProfile(profileId))
      dispatch(loadUser())
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to unfollow user')
        }
        return rejectWithValue(errors.msg || 'Failed to unfollow user')
      }
      return rejectWithValue(error.message || 'Failed to unfollow user')
    }
  }
)

export const getBlockedUsers = createAsyncThunk(
  'profile/getBlockedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/actions/blocked')
      return response.data?.blockedUsers || []
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch blocked users')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch blocked users')
      }
      return rejectWithValue(error.message || 'Failed to fetch blocked users')
    }
  }
)

export const unblockUser = createAsyncThunk(
  'profile/unblockUser',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/user/actions/block/${userId}`)
      // Refresh blocked users list
      dispatch(getBlockedUsers())
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to unblock user')
        }
        return rejectWithValue(errors.msg || 'Failed to unblock user')
      }
      return rejectWithValue(error.message || 'Failed to unblock user')
    }
  }
)

export const getRewardProfile = createAsyncThunk(
  'profile/getRewardProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/referList?page=1&perPage=15')
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch referral list')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch referral list')
      }
      return rejectWithValue(error.message || 'Failed to fetch referral list')
    }
  }
)

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearProfile: (state) => {
      state.user = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // getUserProfile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.followLoad = false
        state.user = action.payload
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.error = action.payload as string
      })

    // followUser
    builder
      .addCase(followUser.pending, (state) => {
        state.followLoad = true
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followLoad = false
        // User will be updated via getUserProfile
      })
      .addCase(followUser.rejected, (state) => {
        state.followLoad = false
      })

    // unfollowUser
    builder
      .addCase(unfollowUser.fulfilled, (state) => {
        // User will be updated via getUserProfile
      })

    // blockUser
    builder
      .addCase(blockUser.pending, (state) => {
        state.blockUserLoading = true
      })
      .addCase(blockUser.fulfilled, (state) => {
        state.blockUserLoading = false
      })
      .addCase(blockUser.rejected, (state) => {
        state.blockUserLoading = false
      })

    // editProfile
    builder
      .addCase(editProfile.pending, (state) => {
        state.editProfileLoading = true
      })
      .addCase(editProfile.fulfilled, (state) => {
        state.editProfileLoading = false
      })
      .addCase(editProfile.rejected, (state) => {
        state.editProfileLoading = false
      })

    // followUserFromList
    builder
      .addCase(followUserFromList.pending, (state) => {
        state.followLoad = true
      })
      .addCase(followUserFromList.fulfilled, (state) => {
        state.followLoad = false
      })
      .addCase(followUserFromList.rejected, (state) => {
        state.followLoad = false
      })

    // unFollowFromListUser
    builder
      .addCase(unFollowFromListUser.pending, (state) => {
        state.followLoad = true
      })
      .addCase(unFollowFromListUser.fulfilled, (state) => {
        state.followLoad = false
      })
      .addCase(unFollowFromListUser.rejected, (state) => {
        state.followLoad = false
      })

    // getBlockedUsers
    builder
      .addCase(getBlockedUsers.pending, (state) => {
        state.blockedUsersLoading = true
      })
      .addCase(getBlockedUsers.fulfilled, (state, action) => {
        state.blockedUsersLoading = false
        state.blockedUsers = action.payload || []
      })
      .addCase(getBlockedUsers.rejected, (state) => {
        state.blockedUsersLoading = false
        state.blockedUsers = []
      })

    // unblockUser
    builder
      .addCase(unblockUser.fulfilled, (state, action) => {
        // Blocked users list will be refreshed via getBlockedUsers
      })

    // getRewardProfile
    builder
      .addCase(getRewardProfile.pending, (state) => {
        state.referLoading = true
        state.referList = null
      })
      .addCase(getRewardProfile.fulfilled, (state, action) => {
        state.referLoading = false
        state.referList = action.payload
      })
      .addCase(getRewardProfile.rejected, (state) => {
        state.referLoading = false
        state.referList = null
      })
  },
})

export const { clearError, clearProfile } = profileSlice.actions
export default profileSlice.reducer
