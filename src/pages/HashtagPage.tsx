import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getHashtagPosts, type SearchPost } from '../lib/search'
import { Card, LoadingSpinner, Avatar, Button } from '../components/ui'
import { NavigationHeader } from '../components/NavigationHeader'
import { Hash, ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react'
import { PostCard } from '../components/post-card'

export function HashtagPage() {
  const { tag } = useParams<{ tag: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [hashtagInfo, setHashtagInfo] = useState<{ tag: string; count: number } | null>(null)

  useEffect(() => {
    if (tag) {
      const fetchHashtagPosts = async () => {
        setLoading(true)
        try {
          const hashtagPosts = await getHashtagPosts(tag)
          setPosts(hashtagPosts)
          
          // Set hashtag info
          setHashtagInfo({
            tag: tag,
            count: hashtagPosts.length,
          })
        } catch (error) {
          console.error('Failed to fetch hashtag posts:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchHashtagPosts()
    }
  }, [tag])

  if (!tag) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12 text-text-secondary">
            Invalid hashtag
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">#{tag}</h1>
              {hashtagInfo && (
                <p className="text-text-secondary mt-1">
                  {hashtagInfo.count} {hashtagInfo.count === 1 ? 'post' : 'posts'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post as any} currentUserId={user?._id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Hash className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No posts found for #{tag}</p>
            <p className="text-text-muted mt-2">Be the first to post with this hashtag!</p>
          </div>
        )}
      </div>
    </div>
  )
}
