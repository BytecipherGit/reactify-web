import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../lib/api'
import { initializeSocket, getSocket } from '../../lib/socket'
import { loadUser } from './authSlice'

// Types - Matching mobile app structure
export interface ChatUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  profilePicture?: string
  media?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  [key: string]: any
}

export interface Message {
  _id: string
  text?: string
  image?: string
  video?: string
  sender: {
    _id: string
    username: string
    profilePicture?: string
  }
  receiver?: {
    _id: string
    username: string
  }
  roomId?: string
  createdAt: string
  type?: 'text' | 'image' | 'video' | 'reel'
  [key: string]: any
}

interface ChatState {
  chats: ChatUser[]
  messages: Message[]
  currentRoomId: string | null
  loading: boolean
  messagesLoading: boolean
  error: string | null
  socketConnected: boolean
}

const initialState: ChatState = {
  chats: [],
  messages: [],
  currentRoomId: null,
  loading: false,
  messagesLoading: false,
  error: null,
  socketConnected: false,
}

// Async Thunks - Matching mobile app
export const getChatUsers = createAsyncThunk(
  'chat/getChatUsers',
  async (_, { rejectWithValue }) => {
    try {
      // Mobile app uses: GET /chats?page=1&limit=100
      const response = await api.get('/chats', {
        params: { page: 1, limit: 100 },
      })
      // Mobile app returns: { chats: [...] } or just the array
      const chats = response.data?.chats || response.data?.data || (Array.isArray(response.data) ? response.data : []) || []
      return chats
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch chats')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch chats')
      }
      return rejectWithValue(error.message || 'Failed to fetch chats')
    }
  }
)

export const loadMessages = createAsyncThunk(
  'chat/loadMessages',
  async (roomId: string, { rejectWithValue }) => {
    try {
      // Mobile app uses: GET /messages/${roomId}
      const response = await api.get(`/messages/${roomId}`)
      // Mobile app returns: { transformedUsers: [...] } and maps them
      let messages =
        response.data?.transformedUsers ||
        response.data?.messages ||
        response.data?.data ||
        response.data ||
        []
      
      // Mobile app maps messages to add user.name = user.username
      if (Array.isArray(messages)) {
        messages = messages.map((msg: any) => {
          if (msg.user && msg.user.username) {
            msg.user.name = msg.user.username
          }
          return msg
        })
      }
      
      return { roomId, messages: Array.isArray(messages) ? messages : [] }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch messages')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch messages')
      }
      return rejectWithValue(error.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { roomId, text, receiverId }: { roomId?: string; text: string; receiverId?: string },
    { dispatch, rejectWithValue, getState }
  ) => {
    try {
      const payload: any = { text }
      if (roomId) {
        payload.roomId = roomId
      }
      if (receiverId) {
        payload.receiverId = receiverId
      }

      const response = await api.post('/messages', payload)
      
      // Refresh current user (matching mobile app)
      dispatch(loadUser())
      
      // If we have roomId, reload messages
      if (roomId) {
        dispatch(loadMessages(roomId))
      }
      
      return response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to send message')
        }
        return rejectWithValue(errors.msg || 'Failed to send message')
      }
      return rejectWithValue(error.message || 'Failed to send message')
    }
  }
)

export const sendGroupMessage = createAsyncThunk(
  'chat/sendGroupMessage',
  async (
    { groupId, text }: { groupId: string; text: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post('/chatmessages', {
        groupId,
        text,
      })
      
      // Reload messages if we have the group room
      if (groupId) {
        dispatch(loadMessages(groupId))
      }
      
      return response.data?.newMessage || response.data?.data || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to send group message')
        }
        return rejectWithValue(errors.msg || 'Failed to send group message')
      }
      return rejectWithValue(error.message || 'Failed to send group message')
    }
  }
)

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },
    addMessage: (state, action) => {
      // Add message optimistically (for real-time updates)
      const message = action.payload
      if (state.currentRoomId === message.roomId) {
        state.messages = [message, ...state.messages]
      }
    },
    updateChatList: (state, action) => {
      // Update chat list when new message arrives
      const { roomId, lastMessage, lastMessageTime } = action.payload
      const chat = state.chats.find((c) => c._id === roomId || c.roomId === roomId)
      if (chat) {
        chat.lastMessage = lastMessage
        chat.lastMessageTime = lastMessageTime
        // Move to top
        state.chats = [chat, ...state.chats.filter((c) => c._id !== chat._id)]
      }
    },
    clearMessages: (state) => {
      state.messages = []
      state.currentRoomId = null
    },
  },
  extraReducers: (builder) => {
    // getChatUsers
    builder
      .addCase(getChatUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getChatUsers.fulfilled, (state, action) => {
        state.loading = false
        state.chats = action.payload
      })
      .addCase(getChatUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // loadMessages
    builder
      .addCase(loadMessages.pending, (state) => {
        state.messagesLoading = true
        state.error = null
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.messagesLoading = false
        state.messages = action.payload.messages
        state.currentRoomId = action.payload.roomId
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.messagesLoading = false
        state.error = action.payload as string
      })

    // sendMessage
    builder
      .addCase(sendMessage.fulfilled, (state) => {
        // Messages will be reloaded via loadMessages
      })
  },
})

export const { clearError, setSocketConnected, addMessage, updateChatList, clearMessages } =
  chatSlice.actions
export default chatSlice.reducer
