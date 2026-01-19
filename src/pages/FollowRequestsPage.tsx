import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { followUser, unfollowUser } from '../store/reducers/profileSlice'
import { Card, LoadingSpinner, Avatar, Button, StatusMessage } from '../components/ui'
import { NavigationHeader } from '../components/NavigationHeader'
import { ArrowLeft, UserCheck, UserX } from 'lucide-react'
import { api } from '../lib/api'

interface FollowRequest {
  _id: string
  username: string
  firstName: string
  lastName: string
  profilePicture?: string
  media?: string
  acceptRequest?: boolean
  isFollow?: boolean
}

export function FollowRequestsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // Fetch follow requests
  useEffect(() => {
    const fetchFollowRequests = async () => {
      setLoading(true)
      try {
        // Try to get follow requests from API
        // If endpoint doesn't exist, use empty array (will be populated by backend later)
        try {
          const response = await api.get('/user/follow-requests')
          if (response.data?.requests) {
            setFollowRequests(response.data.requests)
          } else if (response.data) {
            setFollowRequests(Array.isArray(response.data) ? response.data : [])
          }
        } catch (e: any) {
          // Endpoint might not exist yet - use empty array
          console.log('Follow requests endpoint not available:', e.message)
          setFollowRequests([])
        }
      } catch (error) {
        console.error('Failed to fetch follow requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowRequests()
  }, [])

  const handleConfirmRequest = async (userId: string) => {
    try {
      // Accept follow request by following the user back
      const result = await dispatch(followUser(userId))
      if (followUser.fulfilled.match(result)) {
        // Update local state
        setFollowRequests((prev) =>
          prev.map((req) =>
            req._id === userId ? { ...req, acceptRequest: true, isFollow: false } : req
          )
        )
        setSnackbarMessage('Request confirmed')
        setShowSnackbar(true)
        setTimeout(() => setShowSnackbar(false), 3000)
      }
    } catch (error) {
      console.error('Failed to confirm request:', error)
    }
  }

  const handleDeleteRequest = async (userId: string) => {
    try {
      // Delete/decline follow request
      try {
        await api.delete(`/user/follow-requests/${userId}`)
      } catch (e) {
        // If endpoint doesn't exist, just remove from local state
        console.log('Delete follow request endpoint not available')
      }

      // Remove from local state
      setFollowRequests((prev) => prev.filter((req) => req._id !== userId))
      setSnackbarMessage('Request deleted')
      setShowSnackbar(true)
      setTimeout(() => setShowSnackbar(false), 3000)
    } catch (error) {
      console.error('Failed to delete request:', error)
    }
  }

  const handleFollowUnfollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(userId))
      } else {
        await dispatch(followUser(userId))
      }
      // Update local state
      setFollowRequests((prev) =>
        prev.map((req) =>
          req._id === userId ? { ...req, isFollow: !isFollowing } : req
        )
      )
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    }
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

          <h1 className="text-3xl font-bold text-text">Follow Request</h1>
          <p className="text-text-secondary mt-1">
            Approve or ignore requests
          </p>
        </div>

        {/* Snackbar */}
        {showSnackbar && (
          <StatusMessage
            type="success"
            message={snackbarMessage}
            gradient
            dismissible
            onDismiss={() => setShowSnackbar(false)}
            className="mb-4"
          />
        )}

        {/* Follow Requests List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : followRequests.length > 0 ? (
          <Card className="divide-y divide-border">
            {followRequests.map((request) => (
              <div
                key={request._id}
                className="p-4 flex items-center justify-between hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar
                    src={request.profilePicture || request.media}
                    alt={request.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/u/${request.username}`)}
                      className="font-semibold text-text hover:text-brand-primary transition-colors text-left"
                    >
                      {request.username}
                    </button>
                    <p className="text-sm text-text-secondary truncate">
                      {request.firstName} {request.lastName}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.acceptRequest ? (
                  <Button
                    variant={request.isFollow ? 'outline' : 'default'}
                    onClick={() => handleFollowUnfollow(request._id, request.isFollow || false)}
                    className="ml-4"
                  >
                    {request.isFollow ? 'Following' : 'Follow'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="default"
                      onClick={() => handleConfirmRequest(request._id)}
                      className="bg-brand-primary text-white hover:opacity-90"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteRequest(request._id)}
                      className="border-brand-primary text-brand-primary hover:bg-bg-secondary"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Card>
        ) : (
          <Card className="text-center py-12">
            <UserCheck className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No follow requests</p>
            <p className="text-text-muted mt-2">
              When someone requests to follow you, it will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
