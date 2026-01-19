import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { NavigationHeader } from '../components/NavigationHeader'
import { Input, Card, CardContent, Avatar, LoadingSpinner } from '../components/ui'
import { Search, Hash, Users, Image as ImageIcon, Video, TrendingUp } from 'lucide-react'
import { searchUsers, searchPosts, searchReels, getTrendingHashtags, type SearchUser, type SearchPost, type Hashtag } from '../lib/search'

type SearchTab = 'all' | 'users' | 'posts' | 'reels'

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  
  const [users, setUsers] = useState<SearchUser[]>([])
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [reels, setReels] = useState<SearchPost[]>([])
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([])
  
  const [usersLoading, setUsersLoading] = useState(false)
  const [postsLoading, setPostsLoading] = useState(false)
  const [reelsLoading, setReelsLoading] = useState(false)
  const [trendingLoading, setTrendingLoading] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Load trending hashtags on mount
  useEffect(() => {
    const loadTrending = async () => {
      setTrendingLoading(true)
      const hashtags = await getTrendingHashtags()
      setTrendingHashtags(hashtags)
      setTrendingLoading(false)
    }
    loadTrending()
  }, [])

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      const performSearch = async () => {
        if (activeTab === 'all' || activeTab === 'users') {
          setUsersLoading(true)
          const userResults = await searchUsers(debouncedQuery)
          setUsers(userResults)
          setUsersLoading(false)
        }
        if (activeTab === 'all' || activeTab === 'posts') {
          setPostsLoading(true)
          const postResults = await searchPosts(debouncedQuery)
          setPosts(postResults)
          setPostsLoading(false)
        }
        if (activeTab === 'all' || activeTab === 'reels') {
          setReelsLoading(true)
          const reelResults = await searchReels(debouncedQuery)
          setReels(reelResults)
          setReelsLoading(false)
        }
      }
      performSearch()
    } else {
      setUsers([])
      setPosts([])
      setReels([])
    }
  }, [debouncedQuery, activeTab])

  const isHashtag = useMemo(() => {
    return debouncedQuery.trim().startsWith('#')
  }, [debouncedQuery])

  const hashtagTag = useMemo(() => {
    if (isHashtag) {
      return debouncedQuery.trim().slice(1)
    }
    return null
  }, [debouncedQuery, isHashtag])

  const hasQuery = debouncedQuery.length >= 2
  const isLoading = usersLoading || postsLoading || reelsLoading

  const displayedUsers = activeTab === 'all' || activeTab === 'users' ? users : []
  const displayedPosts = activeTab === 'all' || activeTab === 'posts' ? posts : []
  const displayedReels = activeTab === 'all' || activeTab === 'reels' ? reels : []

  const hasResults = displayedUsers.length > 0 || displayedPosts.length > 0 || displayedReels.length > 0

  return (
    <div className="min-h-screen bg-bg">
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
            <Input
              placeholder="Search users, hashtags, posts, reels…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Hashtag Link */}
        {isHashtag && hashtagTag && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Link
                to={`/hashtag/${hashtagTag}`}
                className="flex items-center gap-2 text-gradient-primary hover:opacity-80 transition-opacity font-semibold"
              >
                <Hash className="w-5 h-5 text-brand-primary" />
                <span>View all posts with #{hashtagTag}</span>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        {hasQuery && (
          <div className="flex gap-2 border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'reels'
                  ? 'border-brand-primary text-brand-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              Reels
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && hasQuery && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Search Results */}
        {hasQuery && !isLoading && (
          <>
            {/* Users Results */}
            {(activeTab === 'all' || activeTab === 'users') && displayedUsers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users
                </h2>
                <div className="space-y-3">
                  {displayedUsers.map((user) => (
                    <Link key={user._id} to={`/u/${user.username}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar
                              src={user.avatar || user.media}
                              alt={user.username}
                              name={user.username}
                              size="md"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-text">@{user.username}</p>
                              {(user.firstName || user.name) && (
                                <p className="text-sm text-text-secondary">
                                  {user.firstName} {user.lastName}
                                </p>
                              )}
                              <div className="flex gap-4 mt-1 text-xs text-text-muted">
                                <span>{user.followers || 0} followers</span>
                                <span>{user.following || 0} following</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {(activeTab === 'all' || activeTab === 'posts') && displayedPosts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Posts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedPosts.map((post) => (
                    <Link key={post._id} to={`/post/${post._id}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-0">
                          {post.mediaUrl && (
                            <div className="aspect-square relative overflow-hidden rounded-t-lg">
                              {post.mediaType === 'video' ? (
                                <video
                                  src={post.mediaUrl}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={post.mediaUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          <div className="p-4">
                            <p className="text-sm text-text line-clamp-2 mb-2">
                              {post.text || 'No caption'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span>@{post.user.username}</span>
                              <span>{post.likeCount} likes</span>
                              <span>{post.commentCount} comments</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reels Results */}
            {(activeTab === 'all' || activeTab === 'reels') && displayedReels.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Reels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedReels.map((reel) => (
                    <Link key={reel._id} to={`/post/${reel._id}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-0">
                          {reel.mediaUrl && (
                            <div className="aspect-[9/16] relative overflow-hidden rounded-t-lg">
                              <video
                                src={reel.mediaUrl}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <p className="text-sm text-text line-clamp-2 mb-2">
                              {reel.text || 'No caption'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span>@{reel.user.username}</span>
                              <span>{reel.likeCount} likes</span>
                              <span>{reel.commentCount} comments</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!hasResults && (
              <div className="text-center py-12">
                <p className="text-lg font-semibold text-text mb-2">No results found</p>
                <p className="text-sm text-text-secondary">
                  Try a different search term
                </p>
              </div>
            )}
          </>
        )}

        {/* Trending Hashtags (when no query) */}
        {!hasQuery && (
          <div>
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending Hashtags
            </h2>
            {trendingLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : trendingHashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((hashtag) => (
                  <Link
                    key={hashtag._id}
                    to={`/hashtag/${hashtag.tag}`}
                    className="px-4 py-2 bg-bg-secondary rounded-full hover:bg-bg-secondary/80 transition-colors"
                  >
                    <span className="text-brand-primary font-semibold">#{hashtag.tag}</span>
                    <span className="text-sm text-text-secondary ml-2">
                      {hashtag.count} posts
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No trending hashtags</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
