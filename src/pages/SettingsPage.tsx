import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getBlockedUsers, unblockUser } from '../store/reducers/profileSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import {
  Card,
  CardContent,
  Button,
  LoadingSpinner,
  StatusMessage,
  Avatar,
} from '../components/ui'
import { Settings, User, Shield, Ban, ArrowLeft, Unlock, HelpCircle, Info, CreditCard, Users, Trash2, LogOut } from 'lucide-react'
import { logout } from '../store/reducers/authSlice'

type SettingsTab = 'account' | 'privacy' | 'blocked'

export function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { blockedUsers, blockedUsersLoading } = useAppSelector((state) => state.profile)
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'blocked') {
      dispatch(getBlockedUsers())
    }
  }, [activeTab, dispatch])

  const handleUnblock = async (userId: string) => {
    setError(null)
    setSuccess(null)
    try {
      const result = await dispatch(unblockUser(userId))
      if (unblockUser.fulfilled.match(result)) {
        setSuccess('User unblocked successfully')
      } else {
        setError(result.payload as string || 'Failed to unblock user')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-text mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand-primary" />
            <h1 className="text-2xl font-bold text-text">Settings</h1>
          </div>
        </div>

        {error && (
          <StatusMessage
            type="error"
            message={error}
            gradient
            dismissible
            onDismiss={() => setError(null)}
            className="mb-4"
          />
        )}

        {success && (
          <StatusMessage
            type="success"
            message={success}
            gradient
            dismissible
            onDismiss={() => setSuccess(null)}
            className="mb-4"
          />
        )}

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'account'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </div>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'privacy'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy
              </div>
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'blocked'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Blocked Users
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h2 className="text-lg font-semibold text-text mb-4">Account Settings</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-text-secondary" />
                      <span className="text-text font-medium">Edit Profile</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>

                  <button
                    onClick={() => navigate('/account-privacy')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-text-secondary" />
                      <span className="text-text font-medium">Account Privacy</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>

                  <button
                    onClick={() => navigate('/groups')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-text-secondary" />
                      <span className="text-text font-medium">My Groups</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>

                  <button
                    onClick={() => navigate('/packages')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-text-secondary" />
                      <span className="text-text font-medium">Subscription</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 space-y-4">
                <h2 className="text-lg font-semibold text-text mb-4">Support</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/help')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-text-secondary" />
                      <span className="text-text font-medium">Help</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>

                  <button
                    onClick={() => navigate('/about')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-text-secondary" />
                      <span className="text-text font-medium">About</span>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // TODO: Implement deleteUser action in authSlice
                        alert('Delete account functionality will be implemented soon')
                        // await dispatch(deleteUser())
                        // navigate('/login', { replace: true })
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 border border-error rounded-lg hover:bg-error/10 transition-colors text-error"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5" />
                      <span className="font-medium">Delete Account</span>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to logout?')) {
                        await dispatch(logout())
                        navigate('/login', { replace: true })
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors text-text"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-text-secondary" />
                      <span className="font-medium">Logout</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'privacy' && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-text mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/account-privacy')}
                    className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-text-secondary" />
                      <div className="text-left">
                        <span className="text-text font-medium block">Private Account</span>
                        <span className="text-sm text-text-secondary">Control who can see your posts</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-text-muted rotate-180" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'blocked' && (
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold text-text mb-4">Blocked Users</h2>
              {blockedUsersLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : blockedUsers.length > 0 ? (
                <div className="space-y-3">
                  {blockedUsers.map((blockedUser: any) => (
                    <div
                      key={blockedUser._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={blockedUser.media || blockedUser.profilePicture}
                          alt={blockedUser.username}
                          name={blockedUser.username}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-text">
                            {blockedUser.firstName && blockedUser.lastName
                              ? `${blockedUser.firstName} ${blockedUser.lastName}`
                              : blockedUser.username}
                          </p>
                          <p className="text-sm text-text-secondary">@{blockedUser.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => handleUnblock(blockedUser._id)}
                        className="flex items-center gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ban className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary">No blocked users</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
