import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  getPost,
  getPostsComments,
  addComment,
  addCommentReply,
  likePost,
  savePost,
  deletePost,
  likeComment,
  likeReply,
  deleteComment,
  deleteReply,
  clearError,
} from '../store/reducers/postSlice'
import { Card, LoadingSpinner, Alert, Button, Input, Avatar } from '../components/ui'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Send,
  Trash2,
  Maximize2,
} from 'lucide-react'

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentPost, comments, loading, commentsLoading, error } = useAppSelector(
    (state) => state.post
  )
  const { user } = useAppSelector((state) => state.auth)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [showActions, setShowActions] = useState(false)

  const handleViewMedia = (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (mediaType === 'image') {
      navigate(`/view-media?image=${encodeURIComponent(mediaUrl)}&type=image`)
    } else {
      navigate(`/view-media?video=${encodeURIComponent(mediaUrl)}&type=video`)
    }
  }

  // Parse hashtags from caption and make them clickable
  const renderCaption = (caption: string) => {
    if (!caption) return null
    
    const parts = caption.split(/(#\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const hashtag = part.substring(1)
        return (
          <Link
            key={index}
            to={`/hashtag/${hashtag}`}
            className="text-brand-primary hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  useEffect(() => {
    if (postId) {
      dispatch(clearError())
      dispatch(getPost(postId))
      dispatch(getPostsComments(postId))
    }
  }, [dispatch, postId])

  const handleLike = () => {
    if (postId && !loading) {
      dispatch(likePost(postId))
    }
  }

  const handleSave = () => {
    if (postId && !loading) {
      dispatch(savePost(postId))
    }
  }

  const handleAddComment = () => {
    if (!commentText.trim() || !postId) return

    if (replyingTo) {
      // Reply to comment - Matching mobile app
      dispatch(
        addCommentReply({
          postId,
          text: commentText,
          commentId: replyingTo._id,
        })
      ).then(() => {
        // Refresh comments after adding reply
        dispatch(getPostsComments(postId))
      })
    } else {
      // Add new comment
      dispatch(addComment({ postId, text: commentText })).then(() => {
        // Refresh comments after adding comment
        dispatch(getPostsComments(postId))
      })
    }

    setCommentText('')
    setReplyingTo(null)
  }

  const handleDeletePost = () => {
    if (postId && currentPost && window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(postId))
      navigate('/feed')
    }
  }

  // Helper to check if liked
  const isLiked = () => {
    if (!currentPost?.likes || currentPost.likes.length === 0) return false
    return currentPost.likes.some((like: any) =>
      typeof like === 'string' ? like === user?._id : like.user === user?._id
    )
  }

  // Helper to check if saved
  const isSaved = () => {
    if (!currentPost?.saves || currentPost.saves.length === 0) return false
    return currentPost.saves.some((save: any) =>
      typeof save === 'string' ? save === user?._id : save.user === user?._id
    )
  }

  const likeCount = currentPost?.likes?.length || 0
  const postUser = currentPost?.user || currentPost?.userId
  const isOwnPost = postUser?._id === user?._id

  if (loading && !currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Alert variant="error">Post not found</Alert>
          <Button onClick={() => navigate('/feed')} className="mt-4">
            Back to Feed
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-lg font-semibold text-text">Post</h1>
          <div className="ml-auto relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-text" />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                {isOwnPost ? (
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-bg-secondary rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete Post
                  </button>
                ) : (
                  <button className="w-full px-4 py-2 text-left text-sm text-text hover:bg-bg-secondary rounded-lg">
                    Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Media */}
          <div className="bg-bg-secondary rounded-lg overflow-hidden relative group">
            {typeof currentPost.media === 'string' ? (
              <>
                <img
                  src={currentPost.media}
                  alt={currentPost.text || currentPost.caption || 'Post'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleViewMedia(currentPost.media, 'image')}
                />
                <button
                  onClick={() => handleViewMedia(currentPost.media, 'image')}
                  className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
                </button>
              </>
            ) : Array.isArray(currentPost.media) && currentPost.media.length > 0 ? (
              <div className="aspect-square relative group">
                {currentPost.media[0].type === 'video' ||
                currentPost.mimeType?.includes('video') ? (
                  <>
                    <video
                      src={currentPost.media[0].url || currentPost.media}
                      controls
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleViewMedia(currentPost.media[0].url || currentPost.media, 'video')}
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="View fullscreen"
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <img
                      src={currentPost.media[0].url || currentPost.media}
                      alt={currentPost.text || currentPost.caption || 'Post'}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleViewMedia(currentPost.media[0].url || currentPost.media, 'image')}
                    />
                    <button
                      onClick={() => handleViewMedia(currentPost.media[0].url || currentPost.media, 'image')}
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="View fullscreen"
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* Post Details & Comments */}
          <div className="flex flex-col">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Link to={`/u/${postUser?.username}`}>
                <Avatar
                  src={postUser?.profilePicture || postUser?.media}
                  alt={postUser?.username}
                  size="md"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/u/${postUser?.username}`}>
                  <p className="font-semibold text-text hover:text-brand-primary">
                    {postUser?.firstName && postUser?.lastName
                      ? `${postUser.firstName} ${postUser.lastName}`
                      : postUser?.username || 'Unknown User'}
                  </p>
                </Link>
                <p className="text-sm text-text-secondary">@{postUser?.username}</p>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
              {/* Post Caption as first comment */}
              {(currentPost.text || currentPost.caption) && (
                <div className="flex gap-3">
                  <Link to={`/u/${postUser?.username}`}>
                    <Avatar
                      src={postUser?.profilePicture || postUser?.media}
                      alt={postUser?.username}
                      size="sm"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="text-text">
                      <Link to={`/u/${postUser?.username}`}>
                        <span className="font-semibold hover:text-brand-primary">
                          {postUser?.username}
                        </span>
                      </Link>{' '}
                      <span>{renderCaption(currentPost.text || currentPost.caption)}</span>
                    </div>
                    {currentPost.location && (
                      <p className="text-sm text-brand-primary mt-1">{currentPost.location}</p>
                    )}
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(currentPost.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Comments */}
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : comments && Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment: any) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    currentUserId={user?._id}
                    onReply={() => setReplyingTo(comment)}
                    postId={postId!}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={loading}
                  className={`transition-colors ${
                    isLiked() ? 'text-error' : 'text-text-secondary hover:text-error'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked() ? 'fill-current' : ''}`} />
                </button>

                <button className="text-text-secondary hover:text-brand-primary transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`ml-auto transition-colors ${
                    isSaved()
                      ? 'text-brand-primary'
                      : 'text-text-secondary hover:text-brand-primary'
                  }`}
                >
                  <Bookmark className={`w-6 h-6 ${isSaved() ? 'fill-current' : ''}`} />
                </button>

                <button className="text-text-secondary hover:text-brand-primary transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Like count */}
              {likeCount > 0 && (
                <p className="text-sm font-semibold text-text">
                  {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </p>
              )}

              {/* Location */}
              {currentPost.location && (
                <p className="text-sm text-brand-primary">{currentPost.location}</p>
              )}

              {/* Add Comment Form */}
              {replyingTo && (
                <div className="bg-bg-secondary p-3 rounded-lg mb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text">
                      Replying to <span className="font-semibold">@{replyingTo.userId?.username}</span>
                    </p>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-text-muted hover:text-text"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingTo ? `Reply to @${replyingTo.userId?.username}` : 'Add a comment...'}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || loading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Comment Item Component
interface CommentItemProps {
  comment: any
  currentUserId?: string
  onReply: () => void
  postId: string
}

function CommentItem({ comment, currentUserId, onReply, postId }: CommentItemProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const commentUser = comment.userId || comment.user
  const isOwnComment = commentUser?._id === user?._id

  const handleLikeComment = () => {
    dispatch(likeComment(comment._id))
  }

  const handleDeleteComment = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(comment._id)).then(() => {
        dispatch(getPostsComments(postId))
      })
    }
  }

  const isLiked = () => {
    if (!comment.likes || comment.likes.length === 0) return false
    return comment.likes.some((like: any) =>
      typeof like === 'string' ? like === currentUserId : like.user === currentUserId
    )
  }

  return (
    <div className="flex gap-3">
      <Link to={`/u/${commentUser?.username}`}>
        <Avatar
          src={commentUser?.profilePicture || commentUser?.media}
          alt={commentUser?.username}
          size="sm"
        />
      </Link>
      <div className="flex-1">
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="text-text">
            <Link to={`/u/${commentUser?.username}`}>
              <span className="font-semibold hover:text-brand-primary">
                {commentUser?.username}
              </span>
            </Link>{' '}
            <span>{comment.text}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          <p className="text-xs text-text-muted">
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
          <button
            onClick={handleLikeComment}
            className={`text-xs transition-colors ${
              isLiked() ? 'text-error font-semibold' : 'text-text-muted hover:text-error'
            }`}
          >
            {comment.likes?.length || 0} likes
          </button>
          <button
            onClick={onReply}
            className="text-xs text-text-muted hover:text-brand-primary"
          >
            Reply
          </button>
          {isOwnComment && (
            <button
              onClick={handleDeleteComment}
              className="text-xs text-error hover:text-error-dark"
            >
              Delete
            </button>
          )}
        </div>

        {/* Replies - Matching mobile app structure */}
        {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
          <div className="mt-3 ml-4 space-y-3 border-l-2 border-border pl-4">
            {comment.replies.map((reply: any) => (
              <ReplyItem
                key={reply._id}
                reply={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                postId={postId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

