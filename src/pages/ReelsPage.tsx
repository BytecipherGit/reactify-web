import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getReels } from '../store/reducers/postSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Card, Alert } from '../components/ui'
import { PostCard } from '../components/post-card'
import { Video } from 'lucide-react'

export function ReelsPage() {
  const dispatch = useAppDispatch()
  const { reels, reelsLoading, reelsHasMore, reelsPage, error } = useAppSelector(
    (state) => state.post
  )
  const { user } = useAppSelector((state) => state.auth)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (reels.length === 0) {
      dispatch(getReels({ page: 1, limit: 20 }))
    }
  }, [dispatch, reels.length])

  const loadMore = useCallback(() => {
    if (!reelsLoading && reelsHasMore && !isFetching) {
      setIsFetching(true)
      dispatch(getReels({ page: (reelsPage || 1) + 1, limit: 20 })).finally(() => {
        setIsFetching(false)
      })
    }
  }, [dispatch, reelsLoading, reelsHasMore, reelsPage, isFetching])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-brand-primary" />
          <h1 className="text-2xl font-bold text-text">Reels</h1>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {reelsLoading && reels.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reels.length > 0 ? (
          <div className="space-y-6">
            {reels.map((reel: any) => (
              <PostCard key={reel._id} post={reel} currentUserId={user?._id} />
            ))}
            {reelsLoading && (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="md" />
              </div>
            )}
            {!reelsHasMore && reels.length > 0 && (
              <div className="text-center py-4 text-text-secondary text-sm">
                No more reels to load
              </div>
            )}
          </div>
        ) : (
          <Card>
            <div className="p-12 text-center">
              <Video className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No reels yet</h3>
              <p className="text-sm text-text-secondary">
                Reels will appear here when available
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
