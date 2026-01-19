import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getChatUsers, clearError } from '../store/reducers/chatSlice'
import { Card, LoadingSpinner, Alert, Avatar, Input } from '../components/ui'
import { Search, MessageCircle, ArrowLeft } from 'lucide-react'

export function MessagesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { chats, loading, error } = useAppSelector((state) => state.chat)
  const { user } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState<typeof chats>([])

  useEffect(() => {
    dispatch(clearError())
    dispatch(getChatUsers())
  }, [dispatch])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chats.filter((chat) =>
        chat.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredChats(filtered)
    } else {
      setFilteredChats(chats)
    }
  }, [searchQuery, chats])

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (loading && chats.length === 0) {
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

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">
              {searchQuery ? 'No chats found' : 'No messages yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-text-muted mt-2">
                Start a conversation by visiting someone's profile
              </p>
            )}
          </Card>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <Link
                key={chat._id || chat.roomId}
                to={`/messages/${chat._id || chat.roomId || chat.userId || ''}`}
                className="block"
              >
                <Card className="p-4 hover:bg-bg-secondary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={chat.profilePicture || chat.media}
                      alt={chat.username}
                      name={chat.username}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-text truncate">
                          {chat.username || chat.firstName || 'Unknown User'}
                        </p>
                        {chat.lastMessageTime && (
                          <p className="text-xs text-text-muted whitespace-nowrap ml-2">
                            {formatTime(chat.lastMessageTime)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-secondary truncate flex-1">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <span className="ml-2 bg-brand-primary text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
