import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { viewStory, replyToStory, getUserStories } from '../store/reducers/storiesSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { Button, Input, Card, CardContent, LoadingSpinner, StatusMessage } from '../components/ui'
import { ArrowLeft, ArrowRight, Send, X } from 'lucide-react'
import type { StoryGroup, Story } from '../store/reducers/storiesSlice'

export function ViewStoryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { userStories, userStoriesLoading } = useAppSelector((state) => state.stories)
  const { user } = useAppSelector((state) => state.auth)

  const storyGroup = (location.state as any)?.storyGroup as StoryGroup | null
  const initialIndex = (location.state as any)?.initialIndex || 0

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (storyGroup) {
      // Mark current story as viewed
      if (storyGroup.stories[currentIndex]) {
        dispatch(viewStory(storyGroup.stories[currentIndex].story_id))
      }
    }
  }, [dispatch, storyGroup, currentIndex])

  const currentStory = storyGroup?.stories[currentIndex]

  const handleNext = () => {
    if (storyGroup && currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      navigate('/stories')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      navigate('/stories')
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !currentStory) return

    setError(null)
    try {
      const result = await dispatch(
        replyToStory({ storyId: currentStory.story_id, text: replyText.trim() })
      )
      if (replyToStory.fulfilled.match(result)) {
        setReplyText('')
        setShowReply(false)
      } else {
        setError(result.payload as string || 'Failed to send reply')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  if (!storyGroup || !currentStory) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <div className="p-12 text-center">
              <p className="text-text-secondary">Story not found</p>
              <Button onClick={() => navigate('/stories')} className="mt-4">
                Back to Stories
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative h-screen">
        {/* Story Image/Video */}
        <div className="absolute inset-0">
          {currentStory.story_image.includes('video') || currentStory.story_image.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={currentStory.story_image}
              autoPlay
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={currentStory.story_image}
              alt="Story"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Navigation Overlay */}
        <div className="absolute inset-0 flex items-center">
          <button
            onClick={handlePrevious}
            className="absolute left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={storyGroup.user_image}
                alt={storyGroup.user_name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-white font-semibold">{storyGroup.user_name}</p>
                <p className="text-white/80 text-xs">
                  {currentIndex + 1} / {storyGroup.stories.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/stories')}
              className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reply Section */}
        {showReply && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Reply to story..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="bg-gradient-primary text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {error && (
                  <StatusMessage
                    type="error"
                    message={error}
                    className="mt-2"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {!showReply && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
            <Button
              onClick={() => setShowReply(true)}
              className="bg-gradient-primary text-white"
            >
              Reply
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
