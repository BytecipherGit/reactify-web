import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// Types - Matching mobile app structure
export interface GroupMember {
  _id: string
  username: string
  media?: string
  fcmToken?: string
  [key: string]: any
}

export interface Group {
  _id: string
  groupName: string
  image?: string
  admin: string | GroupMember
  members: string[] | GroupMember[]
  isGroup: boolean
  updatedAt: string
  createdAt: string
  [key: string]: any
}

interface GroupsState {
  groups: Group[]
  groupDetail: Group | null
  loading: boolean
  error: string | null
  createLoading: boolean
  editLoading: boolean
  deleteLoading: boolean
}

const initialState: GroupsState = {
  groups: [],
  groupDetail: null,
  loading: false,
  error: null,
  createLoading: false,
  editLoading: false,
  deleteLoading: false,
}

// Async Thunks - Matching mobile app
export const getMyGroups = createAsyncThunk(
  'groups/getMyGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/groups')
      // Mobile app returns { groups, totalGroups, success }
      return response.data?.groups || []
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch groups')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch groups')
      }
      return rejectWithValue(error.message || 'Failed to fetch groups')
    }
  }
)

export const getGroupDetail = createAsyncThunk(
  'groups/getGroupDetail',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/groups/${groupId}`)
      // Mobile app returns { group, status }
      return response.data?.group?.[0] || response.data?.group || null
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch group')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch group')
      }
      return rejectWithValue(error.message || 'Failed to fetch group')
    }
  }
)

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data: { groupName: string; members: string[]; image?: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/groups', {
        groupName: data.groupName,
        members: data.members,
        image: data.image,
      })
      // Refresh groups list
      dispatch(getMyGroups())
      return response.data?.group || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to create group')
        }
        return rejectWithValue(errors.msg || errors || 'Failed to create group')
      }
      return rejectWithValue(error.message || 'Failed to create group')
    }
  }
)

export const editGroup = createAsyncThunk(
  'groups/editGroup',
  async (data: { groupId: string; groupName?: string; members?: string[]; image?: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put('/groups', {
        groupId: data.groupId,
        groupName: data.groupName,
        members: data.members,
        image: data.image,
      })
      // Refresh groups list and group detail
      dispatch(getMyGroups())
      if (data.groupId) {
        dispatch(getGroupDetail(data.groupId))
      }
      return response.data?.group || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to update group')
        }
        return rejectWithValue(errors.msg || errors || 'Failed to update group')
      }
      return rejectWithValue(error.message || 'Failed to update group')
    }
  }
)

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (data: { groupId: string; memberId: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/groups/leave/${data.memberId}`, {
        groupId: data.groupId,
      })
      // Refresh groups list
      dispatch(getMyGroups())
      return response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to leave group')
        }
        return rejectWithValue(errors.msg || errors || 'Failed to leave group')
      }
      return rejectWithValue(error.message || 'Failed to leave group')
    }
  }
)

// Slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearGroupDetail: (state) => {
      state.groupDetail = null
    },
  },
  extraReducers: (builder) => {
    // getMyGroups
    builder
      .addCase(getMyGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyGroups.fulfilled, (state, action) => {
        state.loading = false
        state.groups = action.payload
      })
      .addCase(getMyGroups.rejected, (state, action) => {
        state.loading = false
        state.groups = []
        state.error = action.payload as string
      })

    // getGroupDetail
    builder
      .addCase(getGroupDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getGroupDetail.fulfilled, (state, action) => {
        state.loading = false
        state.groupDetail = action.payload
      })
      .addCase(getGroupDetail.rejected, (state, action) => {
        state.loading = false
        state.groupDetail = null
        state.error = action.payload as string
      })

    // createGroup
    builder
      .addCase(createGroup.pending, (state) => {
        state.createLoading = true
        state.error = null
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.createLoading = false
        state.groupDetail = action.payload
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.createLoading = false
        state.groupDetail = null
        state.error = action.payload as string
      })

    // editGroup
    builder
      .addCase(editGroup.pending, (state) => {
        state.editLoading = true
        state.error = null
      })
      .addCase(editGroup.fulfilled, (state, action) => {
        state.editLoading = false
        state.groupDetail = action.payload
      })
      .addCase(editGroup.rejected, (state, action) => {
        state.editLoading = false
        state.error = action.payload as string
      })

    // leaveGroup
    builder
      .addCase(leaveGroup.pending, (state) => {
        state.deleteLoading = true
        state.error = null
      })
      .addCase(leaveGroup.fulfilled, (state) => {
        state.deleteLoading = false
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.deleteLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearGroupDetail } = groupsSlice.actions
export default groupsSlice.reducer
