import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  getNotifications,
  readNotifications,
  clearError,
} from '../store/reducers/notificationsSlice'
import { followUser, unfollowUser } from '../store/reducers/profileSlice'
import { Card, LoadingSpinner, Alert, Avatar, Button } from '../components/ui'
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  UserPlus,
  UserMinus,
  Users,
  Image as ImageIcon,
  UserCheck,
} from 'lucide-react'

export function NotificationsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { notifications, loading, error } = useAppSelector((state) => state.notifications)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
    dispatch(getNotifications())
    // Mark all as read when page loads (matching mobile app)
    dispatch(readNotifications())
  }, [dispatch])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'post') {
      if (!notification.post) {
        alert('This post was deleted by the post owner.')
        return
      }
      navigate(`/post/${notification.post._id}`)
    } else if (notification.type === 'group') {
      if (notification.chatroom) {
        navigate(`/messages/${notification.chatroom._id}`)
      }
    } else if (notification.type === 'message') {
      if (notification.textMessage?.sender) {
        // Navigate to chat with the sender
        // We might need to find or create the room ID
        navigate(`/messages`)
      }
    } else if (notification.type === 'profile') {
      if (notification.otherUser) {
        navigate(`/u/${notification.otherUser.username}`)
      }
    }
  }

  const isFollowing = (otherUser: any) => {
    if (!user?.following || !otherUser?._id) return false
    return user.following.some((f: any) => f._id === otherUser._id)
  }

  const handleFollow = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation()
    dispatch(followUser(userId))
  }

  const handleUnfollow = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation()
    dispatch(unfollowUser(userId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
      case 'post':
        return <Heart className="w-5 h-5 text-error" />
      case 'message':
        return <MessageCircle className="w-5 h-5 text-brand-primary" />
      case 'group':
        return <Users className="w-5 h-5 text-brand-primary" />
      case 'profile':
      case 'follow':
        return <UserPlus className="w-5 h-5 text-brand-primary" />
      default:
        return <MessageCircle className="w-5 h-5 text-text-secondary" />
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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

        {/* Follow Requests Section - Matching mobile app */}
        <Card
          className="mb-4 p-4 hover:bg-bg-secondary transition-colors cursor-pointer"
          onClick={() => navigate('/follow-requests')}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-error flex items-center justify-center">
                <span className="text-xs font-bold text-white">255</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text">Follow Request</h3>
              <p className="text-sm text-text-secondary">Approve or ignore requests</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-text-secondary rotate-180" />
          </div>
        </Card>

        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">No notifications yet</p>
            <p className="text-sm text-text-muted mt-2">
              When you get notifications, they'll show up here
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const otherUser = notification.otherUser
              return (
                <Card
                  key={notification._id}
                  className={`p-4 hover:bg-bg-secondary transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-bg-secondary/50 border-l-4 border-l-brand-primary' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Link
                      to={`/u/${otherUser?.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0"
                    >
                      <Avatar
                        src={otherUser?.profilePicture || otherUser?.media}
                        alt={otherUser?.username}
                        name={otherUser?.username}
                        size="md"
                      />
                    </Link>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-text">
                            {notification.message}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {formatTime(notification.date || notification.createdAt || '')}
                          </p>
                        </div>

                        {/* Notification Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Post Preview Image */}
                      {notification.type === 'post' && notification.post && (
                        <div className="mt-3 w-20 h-20 rounded-lg overflow-hidden bg-bg-secondary">
                          {typeof notification.post.media === 'string' ? (
                            <img
                              src={notification.post.media}
                              alt="Post preview"
                              className="w-full h-full object-cover"
                            />
                          ) : notification.post.media?.[0] ? (
                            <img
                              src={notification.post.media[0].url || notification.post.media[0]}
                              alt="Post preview"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Follow Button for Profile Notifications */}
                    {notification.type === 'profile' && otherUser && otherUser._id !== user?._id && (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isFollowing(otherUser) ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handleUnfollow(e, otherUser._id)}
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Following
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => handleFollow(e, otherUser._id)}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Follow
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
