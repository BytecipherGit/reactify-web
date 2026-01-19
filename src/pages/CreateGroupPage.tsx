import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { createGroup, clearError } from '../store/reducers/groupsSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import { Button, Input, Card, CardContent, StatusMessage, LoadingSpinner, Avatar } from '../components/ui'
import { ArrowLeft, X, Search, Users, Camera } from 'lucide-react'
import { searchUsers, type SearchUser } from '../lib/search'

export function CreateGroupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const { createLoading, error } = useAppSelector((state) => state.groups)

  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedMembersData, setSelectedMembersData] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const maxMembers = currentUser?.profileType === 'business' ? 20 : 5

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const results = await searchUsers(query)
      // Filter out current user and already selected members
      const filtered = results.filter(
        (user) =>
          user._id !== currentUser?._id &&
          !selectedMembers.includes(user._id)
      )
      setSearchResults(filtered)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = (user: SearchUser) => {
    if (selectedMembers.length >= maxMembers) {
      alert(
        `${currentUser?.profileType === 'business' ? 'Business' : 'Personal'} users can add a maximum of ${maxMembers} members`
      )
      return
    }
    if (!selectedMembers.includes(user._id)) {
      setSelectedMembers([...selectedMembers, user._id])
      setSelectedMembersData([...selectedMembersData, user])
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((id) => id !== userId))
    setSelectedMembersData(selectedMembersData.filter((user) => user._id !== userId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setSuccessMsg(null)

    if (!groupName.trim()) {
      return
    }

    if (selectedMembers.length === 0) {
      alert('Please add at least one member to create a group')
      return
    }

    try {
      await dispatch(
        createGroup({
          groupName: groupName.trim(),
          members: selectedMembers,
        })
      ).unwrap()
      setSuccessMsg('Group created successfully!')
      setTimeout(() => {
        navigate('/groups')
      }, 1500)
    } catch (err: any) {
      console.error('Failed to create group:', err)
    }
  }

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
          <h1 className="text-2xl font-bold text-text">Create Group</h1>
        </div>

        {error && (
          <StatusMessage type="error" message={error} className="mb-4" />
        )}

        {successMsg && (
          <StatusMessage type="success" message={successMsg} className="mb-4" />
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-text mb-2">
                  Group Name *
                </label>
                <Input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                  maxLength={100}
                />
              </div>

              {/* Add Members */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Add Members ({selectedMembers.length}/{maxMembers}) *
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <Input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-bg-secondary">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => handleAddMember(user)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors text-left"
                        >
                          <Avatar
                            src={user.avatar || user.media}
                            alt={user.username}
                            name={user.username}
                            size="sm"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-text">@{user.username}</p>
                            {(user.firstName || user.name) && (
                              <p className="text-sm text-text-secondary">
                                {user.firstName} {user.lastName}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-text-secondary">
                        No users found
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-text mb-2">
                      Selected Members ({selectedMembers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembersData.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-3 py-1.5"
                        >
                          <Avatar
                            src={user.avatar || user.media}
                            alt={user.username}
                            name={user.username}
                            size="xs"
                          />
                          <span className="text-sm text-text">@{user.username}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(user._id)}
                            className="ml-1 text-text-muted hover:text-error transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-2 text-xs text-text-muted">
                  {currentUser?.profileType === 'business'
                    ? 'Business users can add up to 20 members'
                    : 'Personal users can add up to 5 members'}
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={createLoading}
                  disabled={createLoading || !groupName.trim() || selectedMembers.length === 0}
                  className="flex-1"
                >
                  Create Group
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
