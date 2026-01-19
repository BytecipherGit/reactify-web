import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// Types - Matching mobile app structure
export interface NotificationUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  profilePicture?: string
  media?: string
  [key: string]: any
}

export interface Notification {
  _id: string
  type: 'post' | 'message' | 'group' | 'profile' | 'like' | 'comment' | 'follow'
  message: string
  date: string
  createdAt?: string
  isRead?: boolean
  otherUser?: NotificationUser
  post?: {
    _id: string
    media?: string
    postCategory?: any
    [key: string]: any
  }
  chatroom?: {
    _id: string
    [key: string]: any
  }
  textMessage?: {
    sender: NotificationUser
    [key: string]: any
  }
  [key: string]: any
}

interface NotificationsState {
  notifications: Notification[]
  notificationsCount: number
  loading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  notificationsCount: 0,
  loading: false,
  error: null,
}

// Async Thunks - Matching mobile app
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications')
      // Mobile app returns: { notifications: [...] }
      const notifications = response.data?.notifications || response.data?.data || response.data || []
      return Array.isArray(notifications) ? notifications : []
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch notifications')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch notifications')
      }
      return rejectWithValue(error.message || 'Failed to fetch notifications')
    }
  }
)

export const getNotificationsCount = createAsyncThunk(
  'notifications/getNotificationsCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/status')
      // Mobile app returns count
      return response.data?.count || response.data?.unreadCount || response.data || 0
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch notifications count')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch notifications count')
      }
      return rejectWithValue(error.message || 'Failed to fetch notifications count')
    }
  }
)

export const readNotifications = createAsyncThunk(
  'notifications/readNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Mobile app uses GET /notifications/read
      const response = await api.get('/notifications/read')
      // Mobile app returns updated notifications
      const notifications = response.data?.notifications || response.data?.data || response.data || []
      return Array.isArray(notifications) ? notifications : []
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to mark notifications as read')
        }
        return rejectWithValue(errors.msg || 'Failed to mark notifications as read')
      }
      return rejectWithValue(error.message || 'Failed to mark notifications as read')
    }
  }
)

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n._id === action.payload)
      if (notification) {
        notification.isRead = true
      }
    },
  },
  extraReducers: (builder) => {
    // getNotifications
    builder
      .addCase(getNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // getNotificationsCount
    builder
      .addCase(getNotificationsCount.fulfilled, (state, action) => {
        state.notificationsCount = action.payload
      })

    // readNotifications
    builder
      .addCase(readNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload
        // Update count after marking as read
        state.notificationsCount = action.payload.filter((n: Notification) => !n.isRead).length
      })
  },
})

export const { clearError, markNotificationAsRead } = notificationsSlice.actions
export default notificationsSlice.reducer
