import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getMyGroups, clearError } from '../store/reducers/groupsSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { LoadingSpinner, Card, CardContent, Avatar, Button, Alert, Input } from '../components/ui'
import { Plus, Search, Users, MessageCircle } from 'lucide-react'

export function GroupsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { groups, loading, error } = useAppSelector((state) => state.groups)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(clearError())
    dispatch(getMyGroups())
  }, [dispatch])

  const filteredGroups = groups.filter((group) =>
    group.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">Groups</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage your groups and chat rooms
            </p>
          </div>
          <Button onClick={() => navigate('/groups/create')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGroups.map((group) => {
              const members = Array.isArray(group.members) ? group.members : []
              const admin = typeof group.admin === 'object' ? group.admin : null
              const memberCount = members.length

              return (
                <Link key={group._id} to={`/groups/${group._id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={group.image}
                          alt={group.groupName}
                          name={group.groupName}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-text truncate mb-1">
                            {group.groupName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                            </div>
                          </div>
                          {admin && (
                            <div className="text-xs text-text-muted">
                              Admin: @{admin.username || 'Unknown'}
                            </div>
                          )}
                        </div>
                        <MessageCircle className="w-5 h-5 text-text-muted flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first group to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/groups/create')}>
                  Create Group
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
