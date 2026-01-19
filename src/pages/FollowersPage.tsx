import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getUserProfile, followUserFromList, unFollowFromListUser, clearError } from '../store/reducers/profileSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Avatar, Button, Alert } from '../components/ui'
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react'

export function FollowersPage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, loading, followLoad, error } = useAppSelector((state) => state.profile)
  const { user: currentUser } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (username) {
      dispatch(clearError())
      // Fetch profile to get followers list
      // Assuming username can be used directly or we need userId
      fetchProfile()
    }
  }, [dispatch, username])

  const fetchProfile = async () => {
    try {
      // If username is the current user, use current user's ID
      if (username === currentUser?.username) {
        dispatch(getUserProfile(currentUser._id))
      } else {
        // For other users, we might need a different endpoint or pass username
        // For now, using username as identifier
        dispatch(getUserProfile(username as any))
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const checkIfFollowing = (follower: any) => {
    if (!currentUser?.following || !follower?._id) return false
    return currentUser.following.some((f: any) => f._id === follower._id)
  }

  const isCurrentUser = (follower: any) => {
    return follower?._id === currentUser?._id
  }

  const handleFollow = (followerId: string) => {
    if (user?._id && !followLoad) {
      dispatch(followUserFromList({ userId: followerId, profileId: user._id }))
    }
  }

  const handleUnfollow = (followerId: string) => {
    if (user?._id && !followLoad) {
      dispatch(unFollowFromListUser({ userId: followerId, profileId: user._id }))
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const followers = user?.followers || []

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-2xl font-bold text-text">Followers</h1>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {followers.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-lg font-semibold mb-2">No followers yet</p>
            <p className="text-sm">
              {username === currentUser?.username
                ? "You don't have any followers yet."
                : `${user?.username} doesn't have any followers yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followers.map((follower: any) => {
              const isFollowing = checkIfFollowing(follower)
              const isOwn = isCurrentUser(follower)

              return (
                <div
                  key={follower._id}
                  className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-secondary/80 transition-colors"
                >
                  <Link
                    to={`/u/${follower.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <Avatar
                      src={follower.media || follower.profilePicture}
                      alt={follower.username}
                      name={follower.username}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-text">{follower.username}</p>
                      {follower.firstName && (
                        <p className="text-sm text-text-secondary">
                          {follower.firstName} {follower.lastName}
                        </p>
                      )}
                    </div>
                  </Link>
                  {!isOwn && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (isFollowing) {
                          handleUnfollow(follower._id)
                        } else {
                          handleFollow(follower._id)
                        }
                      }}
                      disabled={followLoad}
                      isLoading={followLoad}
                      variant={isFollowing ? 'secondary' : 'default'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
