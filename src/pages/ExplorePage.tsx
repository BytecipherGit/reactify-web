import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getPosts } from '../store/reducers/postSlice'
import { Card, LoadingSpinner } from '../components/ui'
import { NavigationHeader } from '../components/NavigationHeader'
import { Search, Video } from 'lucide-react'
import { api } from '../lib/api'

// Category filters matching mobile app
const filterOptionsList = [
  'Style',
  'Travel',
  'Nature',
  'Decore',
  'Art',
  'Animal',
  'Beauty',
]

interface ExplorePost {
  _id: string
  media?: Array<{
    type: 'image' | 'video'
    url: string
  }>
  user?: {
    username: string
    profilePicture?: string
  }
  likeCount?: number
  commentCount?: number
  isVideo?: boolean
}

export function ExplorePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { posts, loading } = useAppSelector((state) => state.post)

  const [explorePosts, setExplorePosts] = useState<ExplorePost[]>([])
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0)
  const [loadingPosts, setLoadingPosts] = useState(false)

  // Fetch explore/public posts
  useEffect(() => {
    const fetchExplorePosts = async () => {
      setLoadingPosts(true)
      try {
        // Try to get explore/public posts from API
        // If endpoint doesn't exist, fall back to regular posts
        try {
          const response = await api.get('/search/explore')
          if (response.data?.posts) {
            setExplorePosts(response.data.posts)
            setLoadingPosts(false)
            return
          }
        } catch (e) {
          // Endpoint doesn't exist, use regular posts
        }

        // Fallback: Get public posts (all posts)
        const result = await dispatch(getPosts({ page: 1, limit: 30 }))
        if (getPosts.fulfilled.match(result)) {
          const fetchedPosts = result.payload.posts || []
          // Mark videos
          const postsWithVideoFlag = fetchedPosts.map((post: any) => ({
            ...post,
            isVideo: post.media?.[0]?.type === 'video',
          }))
          setExplorePosts(postsWithVideoFlag)
        }
      } catch (error) {
        console.error('Failed to fetch explore posts:', error)
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchExplorePosts()
  }, [dispatch])

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`)
  }

  const handleSearchClick = () => {
    navigate('/search')
  }

  // Filter posts by category (if category filter is selected)
  const filteredPosts = selectedFilterIndex === 0
    ? explorePosts
    : explorePosts.filter((post) => {
        // In a real implementation, filter by category
        // For now, return all posts
        return true
      })

  // Split posts into 3 columns for masonry layout (matching mobile app)
  const column1 = filteredPosts.filter((_, i) => i % 3 === 0)
  const column2 = filteredPosts.filter((_, i) => i % 3 === 1)
  const column3 = filteredPosts.filter((_, i) => i % 3 === 2)

  // Generate random height for masonry effect (matching mobile app behavior)
  const getRandomHeight = (isVideo: boolean) => {
    if (isVideo) {
      // Videos get random height between 50-200% of base
      const baseHeight = 200
      const random = Math.floor(Math.random() * 150) + 50
      const height = (baseHeight * random) / 145
      return height >= baseHeight ? height : baseHeight
    }
    return 200 // Base height for images
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar - Matching mobile app */}
        <div className="mb-4">
          <button
            onClick={handleSearchClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:border-brand-primary transition-colors text-left"
          >
            <Search className="w-5 h-5 text-text-muted" />
            <span className="text-text-muted flex-1">Search here...</span>
          </button>
        </div>

        {/* Category Filters - Matching mobile app */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {filterOptionsList.map((filter, index) => (
              <button
                key={index}
                onClick={() => setSelectedFilterIndex(index)}
                className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${
                  selectedFilterIndex === index
                    ? 'border-brand-primary bg-bg-secondary text-brand-primary font-semibold'
                    : 'border-border bg-card text-text-secondary hover:border-brand-primary/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid - 3 Column Masonry Layout (Matching mobile app) */}
        {loadingPosts || loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {/* Column 1 */}
            <div className="flex flex-col gap-2">
              {column1.map((post) => {
                const firstMedia = post.media?.[0]
                const mediaUrl = firstMedia?.url
                const isVideo = post.isVideo || firstMedia?.type === 'video'
                const height = getRandomHeight(isVideo)

                return (
                  <Card
                    key={post._id}
                    className="overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity group relative"
                    onClick={() => handlePostClick(post._id)}
                    style={{ minHeight: `${height}px` }}
                  >
                    <div
                      className="w-full relative bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20"
                      style={{ height: `${height}px` }}
                    >
                      {mediaUrl ? (
                        <>
                          {isVideo ? (
                            <>
                              <video
                                src={mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                                Video
                              </div>
                            </>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-bg-secondary" />
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2">
              {column2.map((post) => {
                const firstMedia = post.media?.[0]
                const mediaUrl = firstMedia?.url
                const isVideo = post.isVideo || firstMedia?.type === 'video'
                const height = getRandomHeight(isVideo)

                return (
                  <Card
                    key={post._id}
                    className="overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity group relative"
                    onClick={() => handlePostClick(post._id)}
                    style={{ minHeight: `${height}px` }}
                  >
                    <div
                      className="w-full relative bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20"
                      style={{ height: `${height}px` }}
                    >
                      {mediaUrl ? (
                        <>
                          {isVideo ? (
                            <>
                              <video
                                src={mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                                Video
                              </div>
                            </>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-bg-secondary" />
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-2">
              {column3.map((post) => {
                const firstMedia = post.media?.[0]
                const mediaUrl = firstMedia?.url
                const isVideo = post.isVideo || firstMedia?.type === 'video'
                const height = getRandomHeight(isVideo)

                return (
                  <Card
                    key={post._id}
                    className="overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity group relative"
                    onClick={() => handlePostClick(post._id)}
                    style={{ minHeight: `${height}px` }}
                  >
                    <div
                      className="w-full relative bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20"
                      style={{ height: `${height}px` }}
                    >
                      {mediaUrl ? (
                        <>
                          {isVideo ? (
                            <>
                              <video
                                src={mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded">
                                Video
                              </div>
                            </>
                          ) : (
                            <img
                              src={mediaUrl}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-bg-secondary" />
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            No posts found
          </div>
        )}
      </div>
    </div>
  )
}
