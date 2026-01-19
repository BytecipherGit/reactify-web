import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  getUserProfile,
  followUser,
  unfollowUser,
  blockUser,
  clearError,
  clearProfile,
} from '../store/reducers/profileSlice'
import { getUserPosts } from '../store/reducers/postSlice'
import { Card, LoadingSpinner, Alert, Button, Avatar } from '../components/ui'
import {
  Grid3x3,
  Play,
  Image as ImageIcon,
  Settings,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  ArrowLeft,
  MessageCircle,
  Heart,
} from 'lucide-react'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, loading, followLoad, error } = useAppSelector((state) => state.profile)
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const { allPost, userVideos, userImages, profileLoading } = useAppSelector(
    (state) => state.post
  )
  const [currentTab, setCurrentTab] = useState(0) // 0: All, 1: Videos, 2: Images
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    if (username) {
      dispatch(clearError())
      dispatch(clearProfile())
      // Fetch profile - we need userId, so we'll get it from username
      // For now, assuming username can be used or we need to fetch by username first
      fetchProfileByUsername()
    }

    return () => {
      dispatch(clearProfile())
    }
  }, [dispatch, username])

  const fetchProfileByUsername = async () => {
    // First, we might need to get userId from username
    // For now, assuming the API accepts username or we have userId
    // Mobile app passes userDetails with _id, so we'll need to handle username lookup
    // This is a placeholder - adjust based on actual API
    try {
      // If username is the current user, use current user's ID
      if (username === currentUser?.username) {
        dispatch(getUserProfile(currentUser._id))
        dispatch(getUserPosts(currentUser._id))
      } else {
        // For other users, we might need a different endpoint or pass username
        // Assuming API supports /user/username or we need to search first
        // For now, using a workaround - you may need to adjust this
        dispatch(getUserProfile(username as any)) // Adjust based on API
        dispatch(getUserPosts(username as any))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleFollow = () => {
    if (user?._id && !followLoad) {
      dispatch(followUser(user._id))
    }
  }

  const handleUnfollow = () => {
    if (user?._id && !followLoad) {
      dispatch(unfollowUser(user._id))
    }
  }

  const handleBlock = () => {
    if (user?._id && window.confirm('Are you sure you want to block this user?')) {
      dispatch(blockUser(user._id))
    }
  }

  const isFollowing = () => {
    if (!user?.followers || !currentUser?._id) return false
    return user.followers.some((follower: any) => follower._id === currentUser._id)
  }

  const isOwnProfile = user?._id === currentUser?._id
  const isBlocked = user?.blockedBy?.includes(currentUser?._id || '')

  // Get posts for current tab
  const getCurrentPosts = () => {
    if (currentTab === 0) return allPost || []
    if (currentTab === 1) return userVideos || []
    return userImages || []
  }

  const currentPosts = getCurrentPosts()

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Alert variant="error">User not found</Alert>
          <Button onClick={() => navigate('/feed')} className="mt-4">
            Back to Feed
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <Avatar
              src={user?.media}
              alt={user?.username}
              name={user?.username}
              size="xl"
            />

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-text">{user?.username}</h2>
                {!isOwnProfile && (
                  <div className="flex items-center gap-2">
                    {isFollowing() ? (
                      <Button
                        onClick={handleUnfollow}
                        disabled={followLoad}
                        variant="secondary"
                        size="sm"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        disabled={followLoad}
                        isLoading={followLoad}
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </Button>
                    )}
                  </div>
                )}
                {isOwnProfile && (
                  <Link to="/edit-profile">
                    <Button variant="secondary" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="font-semibold text-text">{allPost?.length || 0}</p>
                  <p className="text-sm text-text-secondary">posts</p>
                </div>
                <Link
                  to={`/u/${user?.username}/followers`}
                  className="text-center hover:opacity-80"
                >
                  <p className="font-semibold text-text">{user?.followers?.length || 0}</p>
                  <p className="text-sm text-text-secondary">followers</p>
                </Link>
                <Link
                  to={`/u/${user?.username}/following`}
                  className="text-center hover:opacity-80"
                >
                  <p className="font-semibold text-text">{user?.following?.length || 0}</p>
                  <p className="text-sm text-text-secondary">following</p>
                </Link>
              </div>

              {/* Bio */}
              {user?.bio && (
                <div className="text-text">
                  <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
              Posts
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

        {/* Posts Grid */}
        {profileLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : currentPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {currentPosts.map((post: any) => (
              <Link
                key={post._id}
                to={`/post/${post._id}`}
                className="aspect-square bg-bg-secondary relative group overflow-hidden rounded-lg"
              >
                {typeof post.media === 'string' ? (
                  <img
                    src={post.media}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                ) : post.media?.[0] ? (
                  post.media[0].type === 'video' || post.mimeType?.includes('video') ? (
                    <div className="relative w-full h-full">
                      <video
                        src={post.media[0].url || post.media}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                      <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-80" />
                    </div>
                  ) : (
                    <img
                      src={post.media[0].url || post.media}
                      alt=""
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  )
                ) : null}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5" />
                    <span className="font-semibold">{post.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-semibold">{post.comments?.length || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-lg font-semibold mb-2">No posts yet</p>
            <p className="text-sm">
              {isOwnProfile
                ? 'Start sharing your moments!'
                : `${user?.username} hasn't shared any posts yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
