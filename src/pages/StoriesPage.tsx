import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getStories, viewStory } from '../store/reducers/storiesSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Card, Alert, Avatar } from '../components/ui'
import { Plus, Play } from 'lucide-react'
import type { StoryGroup } from '../store/reducers/storiesSlice'

export function StoriesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { stories, loading, error, userStories } = useAppSelector((state) => state.stories)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getStories())
  }, [dispatch])

  const handleStoryClick = async (storyGroup: StoryGroup, storyIndex: number = 0) => {
    // Mark story as viewed
    if (storyGroup.stories[storyIndex]) {
      await dispatch(viewStory(storyGroup.stories[storyIndex].story_id))
    }
    // Navigate to story viewer (can be enhanced with full-screen viewer)
    navigate(`/stories/${storyGroup.user_id}`, {
      state: { storyGroup, initialIndex: storyIndex },
    })
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Stories</h1>
          <p className="text-sm text-text-secondary mt-1">
            Stories disappear after 24 hours
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create Story Card */}
            <Card className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/create-story')}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">Create Story</p>
                    <p className="text-sm text-text-secondary">Share a moment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stories List */}
            {stories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {stories.map((storyGroup: StoryGroup) => (
                  <Card
                    key={storyGroup.user_id}
                    className="cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                    onClick={() => handleStoryClick(storyGroup)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={storyGroup.user_image}
                          alt={storyGroup.user_name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm font-semibold truncate">
                            {storyGroup.user_name}
                          </p>
                          <p className="text-white/80 text-xs">
                            {storyGroup.stories.length} {storyGroup.stories.length === 1 ? 'story' : 'stories'}
                          </p>
                        </div>
                        {storyGroup.stories.some((s) => s.views && s.views.length > 0) && (
                          <div className="absolute top-2 right-2">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="p-12 text-center">
                  <p className="text-text-secondary">No stories available</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
