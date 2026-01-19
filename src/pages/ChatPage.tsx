import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  loadMessages,
  sendMessage,
  addMessage,
  clearMessages,
  clearError,
} from '../store/reducers/chatSlice'
import { getUserProfile } from '../store/reducers/profileSlice'
import { Card, LoadingSpinner, Alert, Avatar, Input, Button } from '../components/ui'
import { ArrowLeft, Send, Image as ImageIcon, Video } from 'lucide-react'
import { initializeSocket, getSocket } from '../lib/socket'

export function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { messages, messagesLoading, error } = useAppSelector((state) => state.chat)
  const { user } = useAppSelector((state) => state.auth)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [otherUser, setOtherUser] = useState<any>(null)

  useEffect(() => {
    if (roomId) {
      dispatch(clearError())
      dispatch(clearMessages())
      dispatch(loadMessages(roomId))
      
      // Get socket for real-time messaging (already initialized in auth)
      const socket = getSocket()
      
      if (socket) {
        // Listen for new messages - Matching mobile app event name
        socket.on('message received', (newMessage: any) => {
          dispatch(addMessage(newMessage))
          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        })

        return () => {
          socket.off('message received')
        }
      }
    }
  }, [dispatch, roomId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get other user info from messages - Matching mobile app structure
  useEffect(() => {
    if (messages.length > 0) {
      // Mobile app uses message.user structure
      const firstMessage = messages[0]
      const otherUserFromMessage = firstMessage.user || firstMessage.sender
      
      if (otherUserFromMessage?._id && otherUserFromMessage._id !== user?._id) {
        // Fetch full user profile
        dispatch(getUserProfile(otherUserFromMessage._id)).then((result) => {
          if (getUserProfile.fulfilled.match(result)) {
            setOtherUser(result.payload)
          } else {
            setOtherUser(otherUserFromMessage)
          }
        })
      } else if (firstMessage.receiver && firstMessage.receiver._id !== user?._id) {
        setOtherUser(firstMessage.receiver)
      }
    }
  }, [messages, user, dispatch])

  const handleSendMessage = () => {
    if (!messageText.trim() || !roomId) return

    dispatch(sendMessage({ roomId, text: messageText }))
    setMessageText('')
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 24 && days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const displayUser = otherUser || {
    username: 'User',
    profilePicture: null,
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-bg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <Link to={`/u/${displayUser.username}`} className="flex items-center gap-3 flex-1">
            <Avatar
              src={displayUser.profilePicture || displayUser.media}
              alt={displayUser.username}
              name={displayUser.username}
              size="md"
            />
            <div>
              <p className="font-semibold text-text">
                {displayUser.firstName && displayUser.lastName
                  ? `${displayUser.firstName} ${displayUser.lastName}`
                  : displayUser.username}
              </p>
              <p className="text-xs text-text-secondary">@{displayUser.username}</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {error && (
          <Alert variant="error" className="m-4">
            {error}
          </Alert>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messagesLoading && messages.length === 0 ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                // Mobile app uses message.user structure
                const messageUser = message.user || message.sender
                const isOwnMessage = messageUser._id === user?._id
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isOwnMessage ? 'bg-brand-primary text-white' : 'bg-bg-secondary text-text'
                      } rounded-lg p-3`}
                    >
                      {/* Message Image */}
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Message"
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}

                      {/* Message Video */}
                      {message.video && (
                        <video
                          src={message.video}
                          controls
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}

                      {/* Message Text */}
                      {message.text && (
                        <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-text'}`}>
                          {message.text}
                        </p>
                      )}

                      {/* Message Time */}
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-white/70' : 'text-text-muted'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4 bg-bg">
          <div className="flex items-center gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || messagesLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
