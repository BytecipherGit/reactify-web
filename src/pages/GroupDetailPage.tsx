import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getGroupDetail, leaveGroup, clearError, clearGroupDetail } from '../store/reducers/groupsSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Card, CardContent, Avatar, Button, Alert, StatusMessage } from '../components/ui'
import { ArrowLeft, Users, MessageCircle, Settings, LogOut, Trash2 } from 'lucide-react'
import type { Group, GroupMember } from '../store/reducers/groupsSlice'

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { groupDetail, loading, error, deleteLoading } = useAppSelector((state) => state.groups)
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  useEffect(() => {
    if (groupId) {
      dispatch(clearError())
      dispatch(getGroupDetail(groupId))
    }

    return () => {
      dispatch(clearGroupDetail())
    }
  }, [dispatch, groupId])

  const isAdmin = () => {
    if (!groupDetail || !currentUser) return false
    const adminId = typeof groupDetail.admin === 'object' ? groupDetail.admin._id : groupDetail.admin
    return adminId === currentUser._id
  }

  const getMembers = (): GroupMember[] => {
    if (!groupDetail) return []
    const members = groupDetail.members || []
    return members.map((member) => {
      if (typeof member === 'object') return member
      return { _id: member, username: 'Unknown' } as GroupMember
    })
  }

  const handleLeaveGroup = async () => {
    if (!groupId || !currentUser) return

    try {
      await dispatch(
        leaveGroup({
          groupId,
          memberId: currentUser._id,
        })
      ).unwrap()
      navigate('/groups')
    } catch (err: any) {
      console.error('Failed to leave group:', err)
    }
  }

  if (loading && !groupDetail) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!groupDetail) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Alert variant="error">Group not found</Alert>
          <Button onClick={() => navigate('/groups')} className="mt-4">
            Back to Groups
          </Button>
        </div>
      </div>
    )
  }

  const members = getMembers()
  const admin = typeof groupDetail.admin === 'object' ? groupDetail.admin : null
  const adminId = typeof groupDetail.admin === 'object' ? groupDetail.admin._id : groupDetail.admin

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
          <h1 className="text-2xl font-bold text-text">Group Details</h1>
        </div>

        {error && (
          <StatusMessage type="error" message={error} className="mb-4" />
        )}

        {/* Group Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar
                src={groupDetail.image}
                alt={groupDetail.groupName}
                name={groupDetail.groupName}
                size="xl"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-text mb-2">
                  {groupDetail.groupName}
                </h2>
                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                  </div>
                </div>
                {admin && (
                  <div className="text-sm text-text-secondary">
                    Admin: <span className="font-semibold text-text">@{admin.username}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <Link to={`/messages/${groupId}`} className="flex-1">
                <Button className="w-full flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Open Chat
                </Button>
              </Link>
              {isAdmin() && (
                <Link to={`/groups/${groupId}/edit`}>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
              )}
              <Button
                variant="secondary"
                onClick={() => setShowLeaveConfirm(true)}
                className="flex items-center gap-2"
                disabled={deleteLoading}
              >
                <LogOut className="w-4 h-4" />
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members ({members.length})
            </h3>
            <div className="space-y-3">
              {/* Admin */}
              {admin && (
                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={admin.media}
                      alt={admin.username}
                      name={admin.username}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-text">@{admin.username}</p>
                      <p className="text-xs text-text-secondary">Admin</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Members */}
              {members
                .filter((member) => member._id !== adminId)
                .map((member) => (
                  <Link
                    key={member._id}
                    to={`/u/${member.username}`}
                    className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={member.media}
                        alt={member.username}
                        name={member.username}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold text-text">@{member.username}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Leave Confirmation Modal */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text mb-2">Leave Group?</h3>
                <p className="text-sm text-text-secondary mb-6">
                  Are you sure you want to leave "{groupDetail.groupName}"? You won't be able to access this group chat anymore.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLeaveGroup}
                    isLoading={deleteLoading}
                    disabled={deleteLoading}
                    className="flex-1"
                  >
                    Leave Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
