import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

export interface Story {
  story_id: string
  story_image: string
  views?: Array<{ user: string | { _id: string; username: string; media?: string } }>
  createdAt?: string
  [key: string]: any
}

export interface StoryGroup {
  user_id: string
  user_name: string
  user_image: string
  stories: Story[]
}

interface StoriesState {
  stories: StoryGroup[]
  currentStoryGroup: StoryGroup | null
  loading: boolean
  error: string | null
  userStories: StoryGroup | null
  userStoriesLoading: boolean
}

const initialState: StoriesState = {
  stories: [],
  currentStoryGroup: null,
  loading: false,
  error: null,
  userStories: null,
  userStoriesLoading: false,
}

// Get all stories
export const getStories = createAsyncThunk(
  'stories/getStories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/stories')
      return response.data?.totalRecords || []
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch stories')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch stories')
      }
      return rejectWithValue(error.message || 'Failed to fetch stories')
    }
  }
)

// Get user stories
export const getUserStories = createAsyncThunk(
  'stories/getUserStories',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/userStory/${userId}`)
      return response.data?.userStories || null
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch user stories')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch user stories')
      }
      return rejectWithValue(error.message || 'Failed to fetch user stories')
    }
  }
)

// Create story
export const createStory = createAsyncThunk(
  'stories/createStory',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      // Refresh stories after creation
      if (response.data?.post) {
        dispatch(getStories())
      }
      return response.data?.post || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to create story')
        }
        return rejectWithValue(errors.msg || 'Failed to create story')
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create story')
    }
  }
)

// Mark story as viewed
export const viewStory = createAsyncThunk(
  'stories/viewStory',
  async (storyId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/stories/${storyId}/view`)
      return { storyId, data: response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to mark story as viewed')
        }
        return rejectWithValue(errors.msg || 'Failed to mark story as viewed')
      }
      return rejectWithValue(error.message || 'Failed to mark story as viewed')
    }
  }
)

// Reply to story
export const replyToStory = createAsyncThunk(
  'stories/replyToStory',
  async (
    { storyId, text }: { storyId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/posts/storyreply', {
        postId: storyId,
        text,
      })
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to reply to story')
        }
        return rejectWithValue(errors.msg || 'Failed to reply to story')
      }
      return rejectWithValue(error.message || 'Failed to reply to story')
    }
  }
)

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentStoryGroup: (state, action) => {
      state.currentStoryGroup = action.payload
    },
  },
  extraReducers: (builder) => {
    // getStories
    builder
      .addCase(getStories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getStories.fulfilled, (state, action) => {
        state.loading = false
        state.stories = action.payload || []
      })
      .addCase(getStories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // getUserStories
    builder
      .addCase(getUserStories.pending, (state) => {
        state.userStoriesLoading = true
        state.error = null
      })
      .addCase(getUserStories.fulfilled, (state, action) => {
        state.userStoriesLoading = false
        state.userStories = action.payload
      })
      .addCase(getUserStories.rejected, (state, action) => {
        state.userStoriesLoading = false
        state.error = action.payload as string
      })

    // createStory
    builder
      .addCase(createStory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createStory.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // viewStory
    builder
      .addCase(viewStory.fulfilled, (state, action) => {
        // Update story views if needed
      })

    // replyToStory
    builder
      .addCase(replyToStory.fulfilled, (state) => {
        // Story reply handled
      })
  },
})

export const { clearError, setCurrentStoryGroup } = storiesSlice.actions
export default storiesSlice.reducer
