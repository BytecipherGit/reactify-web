import { api } from './api'

export interface SearchUser {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  media?: string
  profileType?: string
  followers?: number
  following?: number
}

export interface SearchPost {
  _id: string
  text?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  location?: string
  categories?: string[]
  isPaid?: boolean
  price?: { mint: string; amountUi: number }
  user: {
    _id: string
    username: string
    name: string
    avatar?: string
  }
  likeCount: number
  commentCount: number
  createdAt: string
  isSaved: boolean
}

export interface Hashtag {
  _id: string
  tag: string
  count: number
}

export const searchUsers = async (query: string): Promise<SearchUser[]> => {
  if (!query || query.trim().length < 1) {
    return []
  }

  try {
    const response = await api.get('/search/users', {
      params: { q: query },
    })
    return response.data?.users || []
  } catch (error) {
    console.error('Search users error:', error)
    return []
  }
}

export const searchPosts = async (query: string): Promise<SearchPost[]> => {
  if (!query || query.trim().length < 1) {
    return []
  }

  try {
    const response = await api.get('/search/posts', {
      params: { q: query },
    })
    return response.data?.posts || []
  } catch (error) {
    console.error('Search posts error:', error)
    return []
  }
}

export const searchReels = async (query: string): Promise<SearchPost[]> => {
  if (!query || query.trim().length < 1) {
    return []
  }

  try {
    const response = await api.get('/search/reels', {
      params: { q: query },
    })
    return response.data?.reels || []
  } catch (error) {
    console.error('Search reels error:', error)
    return []
  }
}

export const getTrendingHashtags = async (): Promise<Hashtag[]> => {
  try {
    const response = await api.get('/search/trending')
    return response.data?.hashtags || []
  } catch (error) {
    console.error('Get trending hashtags error:', error)
    return []
  }
}

export const getHashtagPosts = async (tag: string): Promise<SearchPost[]> => {
  if (!tag || tag.trim().length < 1) {
    return []
  }

  try {
    const response = await api.get(`/search/hashtag/${encodeURIComponent(tag)}`)
    return response.data?.posts || []
  } catch (error) {
    console.error('Get hashtag posts error:', error)
    return []
  }
}
