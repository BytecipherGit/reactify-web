import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { likePost, savePost } from "../store/reducers/postSlice";
import { Card } from "./ui";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";

interface PostCardProps {
  post: any;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.post);
console.log('post', post.media);

  const isLiked = () =>
    post.likes?.some((l: any) =>
      typeof l === "string" ? l === currentUserId : l.user === currentUserId
    );

  const isSaved = () =>
    post.saves?.some((s: any) =>
      typeof s === "string" ? s === currentUserId : s.user === currentUserId
    );

  const handleLike = () => !loading && dispatch(likePost(post._id));
  const handleSave = () => !loading && dispatch(savePost(post._id));

  const isVideo = post.mimeType?.startsWith("video");

  return (
    <Card className="overflow-hidden border border-border rounded-none sm:rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={`/u/${post.user?.username}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
            {post.user?.firstName?.[0] || post.user?.username?.[0]}
          </div>
        </Link>
        <Link
          to={`/u/${post.user?.username}`}
          className="font-semibold text-sm hover:text-brand-primary"
        >
          {post.user?.username}
        </Link>
      </div>
      {/* Media */}
      {post.media && (
        <div className="relative bg-black aspect-square flex items-center justify-center">
          {isVideo ? (
            <video
              src={post.media}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={post.media}
              alt="post"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={isLiked() ? "text-error" : "text-text"}
          >
            <Heart className={`w-6 h-6 ${isLiked() ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => navigate(`/post/${post._id}`)}
            className="text-text"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          <button className="text-text">
            <Share2 className="w-6 h-6" />
          </button>

          <button
            onClick={handleSave}
            className={`ml-auto ${
              isSaved() ? "text-brand-primary" : "text-text"
            }`}
          >
            <Bookmark
              className={`w-6 h-6 ${isSaved() ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Likes */}
        {post.likes?.length > 0 && (
          <p className="text-sm font-semibold">{post.likes.length} likes</p>
        )}

        {/* Caption */}
        {post.text && (
          <p className="text-sm">
            <span className="font-semibold mr-1">{post.user?.username}</span>
            {post.text}
          </p>
        )}

        {/* View comments */}
        {(post.comments?.length || post.commentsCount) > 0 && (
          <Link to={`/post/${post._id}`} className="text-sm text-text-muted">
            View all {post.comments?.length || post.commentsCount} comments
          </Link>
        )}

        {/* Location */}
        {post.location && (
          <p className="text-xs text-text-muted">{post.location}</p>
        )}
      </div>
    </Card>
  );
}

// import { Link, useNavigate } from 'react-router-dom'
// import { useAppDispatch, useAppSelector } from '../hooks/redux'
// import { likePost, savePost } from '../store/reducers/postSlice'
// import { Card } from './ui'
// import { Heart, MessageCircle, Bookmark, Share2, Maximize2 } from 'lucide-react'

// interface PostCardProps {
//   post: any
//   currentUserId?: string
//   isFullScreen?: boolean
// }

// export function PostCard({ post, currentUserId, isFullScreen = false }: PostCardProps) {
//   const dispatch = useAppDispatch()
//   const navigate = useNavigate()
//   const { loading } = useAppSelector((state) => state.post)

//   // Helper to check if liked (handles both string[] and {user: string}[] formats - matching mobile)
//   const isLiked = () => {
//     if (!post.likes || post.likes.length === 0) return false
//     return post.likes.some((like: any) =>
//       typeof like === 'string' ? like === currentUserId : like.user === currentUserId
//     )
//   }

//   // Helper to check if saved
//   const isSaved = () => {
//     if (!post.saves || post.saves.length === 0) return false
//     return post.saves.some((save: any) =>
//       typeof save === 'string' ? save === currentUserId : save.user === currentUserId
//     )
//   }

//   // Get like count
//   const likeCount = post.likes?.length || 0

//   const handleLike = () => {
//     if (!loading) {
//       dispatch(likePost(post._id))
//     }
//   }

//   const handleSave = () => {
//     if (!loading) {
//       dispatch(savePost(post._id))
//     }
//   }

//   const handleViewMedia = (mediaUrl: string, mediaType: 'image' | 'video') => {
//     if (mediaType === 'image') {
//       navigate(`/view-media?image=${encodeURIComponent(mediaUrl)}&type=image`)
//     } else {
//       navigate(`/view-media?video=${encodeURIComponent(mediaUrl)}&type=video`)
//     }
//   }

//   // Parse hashtags from caption and make them clickable
//   const renderCaption = (caption: string) => {
//     if (!caption) return null

//     const parts = caption.split(/(#\w+)/g)
//     return parts.map((part, index) => {
//       if (part.startsWith('#')) {
//         const hashtag = part.substring(1)
//         return (
//           <Link
//             key={index}
//             to={`/hashtag/${hashtag}`}
//             className="text-brand-primary hover:underline font-semibold"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {part}
//           </Link>
//         )
//       }
//       return <span key={index}>{part}</span>
//     })
//   }

//   return (
//     <Card className={`overflow-hidden ${isFullScreen ? 'h-full flex flex-col' : ''}`}>
//       {/* Post Header - Matching mobile app structure */}
//       <div className="flex items-center gap-3 p-4 border-b border-border">
//         <Link to={`/u/${(post.userId || post.user)?.username}`}>
//           <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold hover:opacity-80 transition-opacity cursor-pointer">
//             {(post.userId || post.user)?.firstName?.[0] || (post.userId || post.user)?.username?.[0] || 'U'}
//           </div>
//         </Link>
//         <div className="flex-1">
//           <Link to={`/u/${(post.userId || post.user)?.username}`}>
//             <p className="font-semibold text-text hover:text-brand-primary">
//               {((post.userId || post.user)?.firstName && (post.userId || post.user)?.lastName)
//                 ? `${(post.userId || post.user).firstName} ${(post.userId || post.user).lastName}`
//                 : (post.userId || post.user)?.username || 'Unknown User'}
//             </p>
//           </Link>
//           <Link to={`/u/${(post.userId || post.user)?.username}`}>
//             <p className="text-sm text-text-secondary hover:text-brand-primary">
//               @{(post.userId || post.user)?.username}
//             </p>
//           </Link>
//         </div>
//       </div>

//       {/* Post Media - Matching mobile app structure */}
//       {post.media && (
//         <div className={`bg-bg-secondary relative group ${isFullScreen ? 'flex-1 flex items-center justify-center' : ''}`}>
//           {/* Mobile app uses post.media as string URL, or media array */}
//           {typeof post.media === 'string' ? (
//             <>
//               {post.mimeType?.includes('video') ? (
//                 <video
//                   src={post.media}
//                   controls={!isFullScreen}
//                   autoPlay={isFullScreen}
//                   muted={isFullScreen}
//                   loop={isFullScreen}
//                   playsInline
//                   className={isFullScreen ? 'w-full h-full object-cover' : 'w-full h-auto object-cover cursor-pointer'}
//                   onClick={() => !isFullScreen && handleViewMedia(post.media, 'video')}
//                 />
//               ) : (
//                 <>
//                   <img
//                     src={post.media}
//                     alt={post.text || post.caption || 'Post image'}
//                     className={isFullScreen ? 'w-full h-full object-cover' : 'w-full h-auto object-cover cursor-pointer'}
//                     onClick={() => handleViewMedia(post.media, 'image')}
//                   />
//                   {!isFullScreen && (
//                     <button
//                       onClick={() => handleViewMedia(post.media, 'image')}
//                       className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
//                       aria-label="View fullscreen"
//                     >
//                       <Maximize2 className="w-5 h-5 text-white" />
//                     </button>
//                   )}
//                 </>
//               )}
//             </>
//           ) : Array.isArray(post.media) && post.media.length > 0 ? (
//             <div className={isFullScreen ? 'w-full h-full relative' : 'aspect-square relative group'}>
//               {post.media[0].type === 'video' || post.mimeType?.includes('video') ? (
//                 <>
//                   <video
//                     src={post.media[0].url || post.media}
//                     controls={!isFullScreen}
//                     autoPlay={isFullScreen}
//                     muted={isFullScreen}
//                     loop={isFullScreen}
//                     playsInline
//                     className={isFullScreen ? 'w-full h-full object-cover' : 'w-full h-full object-cover'}
//                   />
//                   {!isFullScreen && (
//                     <button
//                       onClick={() => handleViewMedia(post.media[0].url || post.media, 'video')}
//                       className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
//                       aria-label="View fullscreen"
//                     >
//                       <Maximize2 className="w-5 h-5 text-white" />
//                     </button>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <img
//                     src={post.media[0].url || post.media}
//                     alt={post.text || post.caption || 'Post image'}
//                     className={isFullScreen ? 'w-full h-full object-cover' : 'w-full h-full object-cover cursor-pointer'}
//                     onClick={() => handleViewMedia(post.media[0].url || post.media, 'image')}
//                   />
//                   {!isFullScreen && (
//                     <button
//                       onClick={() => handleViewMedia(post.media[0].url || post.media, 'image')}
//                       className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
//                       aria-label="View fullscreen"
//                     >
//                       <Maximize2 className="w-5 h-5 text-white" />
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>
//           ) : null}
//         </div>
//       )}

//       {/* Post Actions */}
//       <div className={`p-4 space-y-3 ${isFullScreen ? 'flex-shrink-0' : ''}`}>
//         <div className="flex items-center gap-4">
//           <button
//             onClick={handleLike}
//             disabled={loading}
//             className={`flex items-center gap-2 transition-colors ${
//               isLiked() ? 'text-error' : 'text-text-secondary hover:text-error'
//             }`}
//           >
//             <Heart className={`w-6 h-6 ${isLiked() ? 'fill-current' : ''}`} />
//             <span className="text-sm font-medium">{likeCount}</span>
//           </button>

//           <Link
//             to={`/post/${post._id}`}
//             className="flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors"
//           >
//             <MessageCircle className="w-6 h-6" />
//             <span className="text-sm font-medium">
//               {post.comments?.length || post.commentsCount || 0}
//             </span>
//           </Link>

//           <button
//             onClick={handleSave}
//             disabled={loading}
//             className={`ml-auto transition-colors ${
//               isSaved()
//                 ? 'text-brand-primary'
//                 : 'text-text-secondary hover:text-brand-primary'
//             }`}
//           >
//             <Bookmark
//               className={`w-6 h-6 ${isSaved() ? 'fill-current' : ''}`}
//             />
//           </button>

//           <button className="text-text-secondary hover:text-brand-primary transition-colors">
//             <Share2 className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Post Caption - Matching mobile app (text field) with hashtag links */}
//         {(post.text || post.caption) && (
//           <div className="text-text">
//             <span className="font-semibold">@{(post.userId || post.user)?.username}</span>{' '}
//             <span>{renderCaption(post.text || post.caption)}</span>
//           </div>
//         )}

//         {/* Location - Matching mobile app */}
//         {post.location && (
//           <p className="text-sm text-brand-primary mt-1">
//             {post.location}
//           </p>
//         )}

//         {/* Liked by text - Matching mobile app */}
//         {likeCount > 0 && (
//           <p className="text-sm text-text mt-1">
//             Liked by <span className="font-semibold">{likeCount}</span>
//           </p>
//         )}

//         {/* Comments Preview */}
//         {(post.comments?.length > 0 || post.commentsCount > 0) && (
//           <Link
//             to={`/post/${post._id}`}
//             className="text-sm text-text-muted hover:text-text-secondary mt-1 block"
//           >
//             View all {post.comments?.length || post.commentsCount || 0} comments
//           </Link>
//         )}
//       </div>
//     </Card>
//   )
// }
