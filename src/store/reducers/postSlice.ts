import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../lib/api'

// Types - Matching mobile app structure
export interface Post {
  _id: string
  user?: {
    _id: string
    username: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  userId?: {
    _id: string
    username: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  text?: string // Caption text
  caption?: string
  location?: string
  media?: Array<{
    type: 'image' | 'video'
    url: string
    _id?: string
  }>
  likes: Array<{ user: string } | string> // Mobile app uses { user: userId } format
  saves: Array<{ user: string } | string>
  comments?: Comment[]
  commentsCount?: number
  createdAt: string
  updatedAt: string
  postType?: string
  [key: string]: any
}

export interface Comment {
  _id: string
  userId: {
    _id: string
    username: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  text: string
  likes: string[]
  replies: Comment[]
  createdAt: string
  [key: string]: any
}

interface PostState {
  posts: Post[]
  currentPost: Post | null
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  limit: number
  mode: 'foryou' | 'following'
  pageData?: any // Matching mobile app structure
  comments?: Comment[] // Comments for current post
  commentsLoading?: boolean
  // User posts (matching mobile app)
  userPosts?: Post[]
  userVideos?: Post[]
  userImages?: Post[]
  allPost?: Post[] // All user posts
  profileLoading?: boolean
  savedPosts?: Post[] // Saved posts
  savedPostsLoading?: boolean
  reels?: Post[] // Reels feed
  reelsLoading?: boolean
  reelsHasMore?: boolean
  reelsPage?: number
  postCategory?: Array<{ _id: string; type: string; time?: string; [key: string]: any }> // Post categories (matching mobile app)
}

const initialState: PostState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  limit: 30,
  mode: 'foryou',
  pageData: null,
  comments: [],
  commentsLoading: false,
  userPosts: [],
  userVideos: [],
  userImages: [],
  allPost: [],
  profileLoading: false,
  savedPosts: [],
  savedPostsLoading: false,
  reels: [],
  reelsLoading: false,
  reelsHasMore: true,
  reelsPage: 1,
  postCategory: [], // Matching mobile app
}

// Async Thunks
export const getPosts = createAsyncThunk(
  'post/getPosts',
  async (
    { page = 1, limit = 30, mode = 'foryou' }: { page?: number; limit?: number; mode?: 'foryou' | 'following' },
    { rejectWithValue }
  ) => {
    try {
      // Matching mobile app: /posts?page=1&limit=30
      const response = await api.get('/posts', {
        params: { page, limit, mode },
      })
      // Mobile app structure:
      // - API returns: { post: [...], hasMore: true } or { data: { post: [...] } }
      // - Mobile app stores: state.posts = res.data (entire response)
      // - Component accesses: homePosts.post (array of posts)
      const responseData = response.data?.data || response.data || {}
      
      // Extract posts array - mobile app uses responseData.post
      let posts = []
      if (Array.isArray(responseData)) {
        posts = responseData
      } else if (Array.isArray(responseData.post)) {
        posts = responseData.post
      } else if (Array.isArray(responseData.posts)) {
        posts = responseData.posts
      } else if (Array.isArray(responseData.payload)) {
        posts = responseData.payload
      }
      
      // Debug: Log to see actual API response structure
      console.log('getPosts API response:', {
        responseData,
        postsLength: posts.length,
        hasPostKey: !!responseData.post,
        hasPostsKey: !!responseData.posts,
        fullResponse: response.data
      })
      
      // Extract only serializable data from response (avoid AxiosHeaders in Redux)
      const pageData = {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        // Don't include headers, config, request as they contain non-serializable values
      }
      
      return {
        posts: posts,
        page,
        hasMore: responseData?.hasMore !== false && posts.length >= limit,
        pageData, // Only serializable parts of response
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch posts')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch posts')
      }
      return rejectWithValue(error.message || 'Failed to fetch posts')
    }
  }
)

export const getPost = createAsyncThunk(
  'post/getPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`)
      return response.data?.data || response.data?.post || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch post')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch post')
      }
      return rejectWithValue(error.message || 'Failed to fetch post')
    }
  }
)

// Get post types/categories - Matching mobile app getPostType
export const getPostType = createAsyncThunk(
  'post/getPostType',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/type/getType')
      // Mobile app returns: res.data.data
      return response.data?.data || response.data || []
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch post types')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch post types')
      }
      return rejectWithValue(error.message || 'Failed to fetch post types')
    }
  }
)

export const likePost = createAsyncThunk(
  'post/likePost',
  async (postId: string, { rejectWithValue, getState }) => {
    try {
      const response = await api.put(`/posts/like/${postId}`)
      return { postId, data: response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to like post')
        }
        return rejectWithValue(errors.msg || 'Failed to like post')
      }
      return rejectWithValue(error.message || 'Failed to like post')
    }
  }
)

export const savePost = createAsyncThunk(
  'post/savePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/save/${postId}`)
      return { postId, data: response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to save post')
        }
        return rejectWithValue(errors.msg || 'Failed to save post')
      }
      return rejectWithValue(error.message || 'Failed to save post')
    }
  }
)

export const addComment = createAsyncThunk(
  'post/addComment',
  async (
    { postId, text }: { postId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/posts/comment/${postId}`, { text })
      return { postId, comment: response.data?.data || response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to add comment')
        }
        return rejectWithValue(errors.msg || 'Failed to add comment')
      }
      return rejectWithValue(error.message || 'Failed to add comment')
    }
  }
)

export const createPost = createAsyncThunk(
  'post/createPost',
  async (
    formData: FormData,
    { rejectWithValue, dispatch }
  ) => {
    try {
      // Create post with FormData (includes file upload)
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Refresh posts after creation
      if (response.data?.post) {
        dispatch(getPosts({ page: 1, limit: 30, mode: 'foryou' }))
      }

      return response.data?.post || response.data
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to create post')
        }
        return rejectWithValue(errors.msg || 'Failed to create post')
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create post')
    }
  }
)

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`)
      return postId
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to delete post')
        }
        return rejectWithValue(errors.msg || 'Failed to delete post')
      }
      return rejectWithValue(error.message || 'Failed to delete post')
    }
  }
)

// Get post comments - Matching mobile app
// Mobile app endpoint: GET /posts/comment/${postId}
// Returns: { postComments: [...] } or { data: [...] }
export const getPostsComments = createAsyncThunk(
  'post/getPostsComments',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/comment/${postId}`)
      // Mobile app returns: { postComments: [...] } or just the array
      const comments =
        response.data?.postComments ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []) ||
        []
      return { postId, comments }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch comments')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch comments')
      }
      return rejectWithValue(error.message || 'Failed to fetch comments')
    }
  }
)

// Add comment reply - Matching mobile app
// Mobile app uses: POST /posts/comment/reply/${postId} with { text, commentId }
export const addCommentReply = createAsyncThunk(
  'post/addCommentReply',
  async (
    { postId, text, commentId }: { postId: string; text: string; commentId: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post(`/posts/comment/reply/${postId}`, {
        text,
        commentId,
      })
      // Refresh comments after adding reply (matching mobile app)
      dispatch(getPostsComments(postId))
      return { postId, commentId, reply: response.data?.data || response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to add reply')
        }
        return rejectWithValue(errors.msg || 'Failed to add reply')
      }
      return rejectWithValue(error.message || 'Failed to add reply')
    }
  }
)

// Like comment - Matching mobile app
export const likeComment = createAsyncThunk(
  'post/likeComment',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/comment/like/${commentId}`)
      return { commentId, data: response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to like comment')
        }
        return rejectWithValue(errors.msg || 'Failed to like comment')
      }
      return rejectWithValue(error.message || 'Failed to like comment')
    }
  }
)

// Like reply - Matching mobile app
export const likeReply = createAsyncThunk(
  'post/likeReply',
  async (replyId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/comment/reply/like/${replyId}`)
      return { replyId, data: response.data }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to like reply')
        }
        return rejectWithValue(errors.msg || 'Failed to like reply')
      }
      return rejectWithValue(error.message || 'Failed to like reply')
    }
  }
)

// Delete comment - Matching mobile app
export const deleteComment = createAsyncThunk(
  'post/deleteComment',
  async (commentId: string, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/posts/comment/${commentId}`)
      // Note: We need postId to refresh comments, but API doesn't return it
      // This will be handled in the component
      return commentId
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to delete comment')
        }
        return rejectWithValue(errors.msg || 'Failed to delete comment')
      }
      return rejectWithValue(error.message || 'Failed to delete comment')
    }
  }
)

// Delete reply - Matching mobile app
export const deleteReply = createAsyncThunk(
  'post/deleteReply',
  async (replyId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/comment/reply/${replyId}`)
      return replyId
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to delete reply')
        }
        return rejectWithValue(errors.msg || 'Failed to delete reply')
      }
      return rejectWithValue(error.message || 'Failed to delete reply')
    }
  }
)

// Get user posts - Matching mobile app
export const getUserPosts = createAsyncThunk(
  'post/getUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/user/${userId}`)
      const userPosts = response.data?.data || response.data?.post || response.data || []
      // Mobile app separates into allPost, videoPost, imagePost
      const allPost = Array.isArray(userPosts) ? userPosts : []
      const videoPost = allPost.filter((post: any) => 
        post.mimeType?.includes('video') || post.media?.type === 'video'
      )
      const imagePost = allPost.filter((post: any) => 
        post.mimeType?.includes('image') || post.media?.type === 'image'
      )
      return { userId, allPost, videoPost, imagePost }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch user posts')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch user posts')
      }
      return rejectWithValue(error.message || 'Failed to fetch user posts')
    }
  }
)

// Get saved posts - Matching mobile app
export const getReels = createAsyncThunk(
  'post/getReels',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/reel', {
        params: { page, limit },
      })
      return {
        reels: response.data?.reels || [],
        hasMore: response.data?.hasMore || false,
        page: response.data?.currentPage || page,
        totalPages: response.data?.totalPages || 1,
      }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch reels')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch reels')
      }
      return rejectWithValue(error.message || 'Failed to fetch reels')
    }
  }
)

export const getSavedPosts = createAsyncThunk(
  'post/getSavedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/saved')
      const savedPosts = response.data?.post || response.data || []
      // Separate into videos and images
      const videoPost = savedPosts.filter((post: any) => 
        post.mimeType?.includes('video') || post.media?.type === 'video'
      )
      const imagePost = savedPosts.filter((post: any) => 
        post.mimeType?.includes('image') || post.media?.type === 'image'
      )
      return { allPost: savedPosts, videoPost, imagePost }
    } catch (error: any) {
      const errors = error.response?.data?.errors
      if (errors) {
        if (Array.isArray(errors)) {
          return rejectWithValue(errors[0].msg || 'Failed to fetch saved posts')
        }
        return rejectWithValue(errors.msg || 'Failed to fetch saved posts')
      }
      return rejectWithValue(error.message || 'Failed to fetch saved posts')
    }
  }
)

// Slice
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setMode: (state, action: PayloadAction<'foryou' | 'following'>) => {
      state.mode = action.payload
      state.posts = []
      state.page = 1
      state.hasMore = true
    },
    resetPosts: (state) => {
      state.posts = []
      state.page = 1
      state.hasMore = true
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // getPosts - Matching mobile app structure
    builder
      .addCase(getPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false
        // Mobile app replaces posts on page 1, appends on subsequent pages
        if (action.payload.page === 1) {
          state.posts = action.payload.posts
        } else {
          state.posts = [...state.posts, ...action.payload.posts]
        }
        state.page = action.payload.page
        state.hasMore = action.payload.hasMore
        state.pageData = action.payload.pageData
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // getPost
    builder
      .addCase(getPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.loading = false
        state.currentPost = action.payload
      })
      .addCase(getPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // getPostType - Matching mobile app
    builder
      .addCase(getPostType.pending, (state) => {
        state.loading = true
      })
      .addCase(getPostType.fulfilled, (state, action) => {
        state.loading = false
        state.postCategory = action.payload || []
      })
      .addCase(getPostType.rejected, (state) => {
        state.loading = false
        state.postCategory = []
      })

    // likePost - Matching mobile app structure
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = currentUser._id
        
        // Helper to check if user liked (handles both string[] and {user: string}[] formats)
        const isLiked = (likes: any[]) => {
          if (!likes || likes.length === 0) return false
          return likes.some((like) => 
            typeof like === 'string' ? like === userId : like.user === userId
          )
        }
        
        // Helper to toggle like
        const toggleLike = (likes: any[]) => {
          if (!likes) return []
          const liked = isLiked(likes)
          if (liked) {
            return likes.filter((like) => 
              typeof like === 'string' ? like !== userId : like.user !== userId
            )
          } else {
            return [...likes, { user: userId }] // Mobile app uses { user: userId } format
          }
        }
        
        const post = state.posts.find((p) => p._id === action.payload.postId)
        if (post) {
          post.likes = toggleLike(post.likes || [])
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.likes = toggleLike(state.currentPost.likes || [])
        }
      })

    // savePost - Matching mobile app structure
    builder
      .addCase(savePost.fulfilled, (state, action) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = currentUser._id
        
        // Helper to check if user saved
        const isSaved = (saves: any[]) => {
          if (!saves || saves.length === 0) return false
          return saves.some((save) => 
            typeof save === 'string' ? save === userId : save.user === userId
          )
        }
        
        // Helper to toggle save
        const toggleSave = (saves: any[]) => {
          if (!saves) return []
          const saved = isSaved(saves)
          if (saved) {
            return saves.filter((save) => 
              typeof save === 'string' ? save !== userId : save.user !== userId
            )
          } else {
            return [...saves, { user: userId }]
          }
        }
        
        const post = state.posts.find((p) => p._id === action.payload.postId)
        if (post) {
          post.saves = toggleSave(post.saves || [])
        }
      })

    // addComment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId)
        if (post && action.payload.comment) {
          post.comments = [...(post.comments || []), action.payload.comment]
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.comments = [
            ...(state.currentPost.comments || []),
            action.payload.comment,
          ]
        }
      })

    // createPost
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false
        // Post will be added to feed via getPosts refresh
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // deletePost
    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload)
        if (state.currentPost?._id === action.payload) {
          state.currentPost = null
        }
      })

    // getPostsComments - Matching mobile app
    builder
      .addCase(getPostsComments.pending, (state) => {
        state.commentsLoading = true
      })
      .addCase(getPostsComments.fulfilled, (state, action) => {
        state.commentsLoading = false
        state.comments = action.payload.comments
        // Also update comments in the post if it's in the list
        const post = state.posts.find((p) => p._id === action.payload.postId)
        if (post) {
          post.comments = action.payload.comments
        }
        if (state.currentPost?._id === action.payload.postId) {
          state.currentPost.comments = action.payload.comments
        }
      })
      .addCase(getPostsComments.rejected, (state) => {
        state.commentsLoading = false
      })

    // addCommentReply
    builder
      .addCase(addCommentReply.fulfilled, (state, action) => {
        // Comments will be refreshed via getPostsComments
      })

    // likeComment
    builder
      .addCase(likeComment.fulfilled, (state, action) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = currentUser._id
        
        const updateCommentLikes = (comments: any[]): any[] => {
          return comments.map((comment) => {
            if (comment._id === action.payload.commentId) {
              const isLiked = comment.likes?.some((like: any) =>
                typeof like === 'string' ? like === userId : like.user === userId
              )
              if (isLiked) {
                return {
                  ...comment,
                  likes: comment.likes.filter((like: any) =>
                    typeof like === 'string' ? like !== userId : like.user !== userId
                  ),
                }
              } else {
                return {
                  ...comment,
                  likes: [...(comment.likes || []), { user: userId }],
                }
              }
            }
            if (comment.replies) {
              return { ...comment, replies: updateCommentLikes(comment.replies) }
            }
            return comment
          })
        }
        
        state.comments = updateCommentLikes(state.comments || [])
      })

    // likeReply
    builder
      .addCase(likeReply.fulfilled, (state, action) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = currentUser._id
        
        const updateReplyLikes = (comments: any[]): any[] => {
          return comments.map((comment) => {
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply: any) => {
                  if (reply._id === action.payload.replyId) {
                    const isLiked = reply.likes?.some((like: any) =>
                      typeof like === 'string' ? like === userId : like.user === userId
                    )
                    if (isLiked) {
                      return {
                        ...reply,
                        likes: reply.likes.filter((like: any) =>
                          typeof like === 'string' ? like !== userId : like.user !== userId
                        ),
                      }
                    } else {
                      return {
                        ...reply,
                        likes: [...(reply.likes || []), { user: userId }],
                      }
                    }
                  }
                  return reply
                }),
              }
            }
            return comment
          })
        }
        
        state.comments = updateReplyLikes(state.comments || [])
      })

    // deleteComment
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = (state.comments || []).filter((c) => c._id !== action.payload)
      })

    // deleteReply
    builder
      .addCase(deleteReply.fulfilled, (state, action) => {
        state.comments = (state.comments || []).map((comment) => {
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.filter((reply: any) => reply._id !== action.payload),
            }
          }
          return comment
        })
      })

    // getUserPosts - Matching mobile app
    builder
      .addCase(getUserPosts.pending, (state) => {
        state.profileLoading = true
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.profileLoading = false
        state.allPost = action.payload.allPost
        state.userVideos = action.payload.videoPost
        state.userImages = action.payload.imagePost
        state.userPosts = action.payload.allPost
      })
      .addCase(getUserPosts.rejected, (state) => {
        state.profileLoading = false
        state.allPost = []
        state.userVideos = []
        state.userImages = []
        state.userPosts = []
      })

    // getSavedPosts
    builder
      .addCase(getSavedPosts.pending, (state) => {
        state.savedPostsLoading = true
        state.error = null
      })
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        state.savedPostsLoading = false
        state.savedPosts = action.payload.allPost
        // Note: We can reuse userVideos/userImages for saved posts if needed
      })
      .addCase(getSavedPosts.rejected, (state, action) => {
        state.savedPostsLoading = false
        state.savedPosts = []
        state.error = action.payload as string
      })

    // getReels
    builder
      .addCase(getReels.pending, (state) => {
        state.reelsLoading = true
        state.error = null
      })
      .addCase(getReels.fulfilled, (state, action) => {
        state.reelsLoading = false
        if (action.payload.page === 1) {
          state.reels = action.payload.reels
        } else {
          state.reels = [...(state.reels || []), ...action.payload.reels]
        }
        state.reelsHasMore = action.payload.hasMore
        state.reelsPage = action.payload.page
      })
      .addCase(getReels.rejected, (state, action) => {
        state.reelsLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setMode, resetPosts } = postSlice.actions
export default postSlice.reducer
