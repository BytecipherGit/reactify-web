import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getSavedPosts } from '../store/reducers/postSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Card, CardContent, Alert } from '../components/ui'
import { PostCard } from '../components/post-card'
import { Grid3x3, Play, Image as ImageIcon, Bookmark } from 'lucide-react'

export function SavedPostsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { savedPosts, savedPostsLoading, error } = useAppSelector((state) => state.post)
  const { user } = useAppSelector((state) => state.auth)
  const [currentTab, setCurrentTab] = useState(0) // 0: All, 1: Videos, 2: Images

  useEffect(() => {
    dispatch(getSavedPosts())
  }, [dispatch])

  const getCurrentPosts = () => {
    if (currentTab === 0) return savedPosts || []
    if (currentTab === 1) {
      return (savedPosts || []).filter((post: any) => 
        post.mimeType?.includes('video') || post.media?.type === 'video'
      )
    }
    return (savedPosts || []).filter((post: any) => 
      post.mimeType?.includes('image') || post.media?.type === 'image'
    )
  }

  const currentPosts = getCurrentPosts()

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Bookmark className="w-6 h-6 text-brand-primary" />
          <h1 className="text-2xl font-bold text-text">Saved Posts</h1>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <div className="border-t border-border mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setCurrentTab(0)}
              className={`py-4 border-b-2 transition-colors ${
                currentTab === 0
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <Grid3x3 className="w-5 h-5 inline mr-2" />
              All
            </button>
            <button
              onClick={() => setCurrentTab(1)}
              className={`py-4 border-b-2 transition-colors ${
                currentTab === 1
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <Play className="w-5 h-5 inline mr-2" />
              Videos
            </button>
            <button
              onClick={() => setCurrentTab(2)}
              className={`py-4 border-b-2 transition-colors ${
                currentTab === 2
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <ImageIcon className="w-5 h-5 inline mr-2" />
              Images
            </button>
          </div>
        </div>

        {/* Posts */}
        {savedPostsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : currentPosts.length > 0 ? (
          <div className="space-y-6">
            {currentPosts.map((post: any) => (
              <PostCard key={post._id} post={post} currentUserId={user?._id} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No saved posts yet</h3>
              <p className="text-sm text-text-secondary mb-6">
                Posts you save will appear here
              </p>
              <button
                onClick={() => navigate('/feed')}
                className="text-brand-primary hover:opacity-80 font-semibold"
              >
                Explore Feed
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
