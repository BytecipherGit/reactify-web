import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getUserProfile, followUserFromList, unFollowFromListUser, clearError } from '../store/reducers/profileSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Avatar, Button, Alert } from '../components/ui'
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react'

export function FollowingPage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, loading, followLoad, error } = useAppSelector((state) => state.profile)
  const { user: currentUser } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (username) {
      dispatch(clearError())
      // Fetch profile to get following list
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

  const checkIfFollowing = (followingUser: any) => {
    if (!currentUser?.following || !followingUser?._id) return false
    return currentUser.following.some((f: any) => f._id === followingUser._id)
  }

  const isCurrentUser = (followingUser: any) => {
    return followingUser?._id === currentUser?._id
  }

  const handleFollow = (followingId: string) => {
    if (user?._id && !followLoad) {
      dispatch(followUserFromList({ userId: followingId, profileId: user._id }))
    }
  }

  const handleUnfollow = (followingId: string) => {
    if (user?._id && !followLoad) {
      dispatch(unFollowFromListUser({ userId: followingId, profileId: user._id }))
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

  const following = user?.following || []

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
          <h1 className="text-2xl font-bold text-text">Following</h1>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {following.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-lg font-semibold mb-2">Not following anyone yet</p>
            <p className="text-sm">
              {username === currentUser?.username
                ? "You're not following anyone yet."
                : `${user?.username} is not following anyone yet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((followingUser: any) => {
              const isFollowing = checkIfFollowing(followingUser)
              const isOwn = isCurrentUser(followingUser)

              return (
                <div
                  key={followingUser._id}
                  className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg hover:bg-bg-secondary/80 transition-colors"
                >
                  <Link
                    to={`/u/${followingUser.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <Avatar
                      src={followingUser.media || followingUser.profilePicture}
                      alt={followingUser.username}
                      name={followingUser.username}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-text">{followingUser.username}</p>
                      {followingUser.firstName && (
                        <p className="text-sm text-text-secondary">
                          {followingUser.firstName} {followingUser.lastName}
                        </p>
                      )}
                    </div>
                  </Link>
                  {!isOwn && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (isFollowing) {
                          handleUnfollow(followingUser._id)
                        } else {
                          handleFollow(followingUser._id)
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
