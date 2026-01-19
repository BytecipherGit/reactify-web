import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getNotificationsCount } from '../store/reducers/notificationsSlice'
import { logout } from '../store/reducers/authSlice'
import { Avatar, Button } from './ui'
import { Home, MessageCircle, Bell, User, Search, Bookmark, LogOut, Settings, Plus, Compass } from 'lucide-react'

export function NavigationHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { notificationsCount } = useAppSelector((state) => state.notifications)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch notifications count on mount (matching mobile app - no interval found)
    dispatch(getNotificationsCount())
    // Note: Mobile app doesn't use setInterval for notification count polling
    // It only fetches on mount and when screen is focused
  }, [dispatch])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login', { replace: true })
    setShowMenu(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/feed" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Reactify
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link to="/search" className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              <div className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-bg text-text-muted cursor-pointer hover:border-brand-primary transition-colors">
                Search...
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/feed"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/feed') || location.pathname === '/'
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <Home className="w-6 h-6" />
            </Link>

            <Link
              to="/search"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/search')
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <Search className="w-6 h-6" />
            </Link>

            <Link
              to="/explore"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/explore')
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <Compass className="w-6 h-6" />
            </Link>

            <Link
              to="/messages"
              className={`p-2 rounded-lg transition-colors relative ${
                isActive('/messages')
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
            </Link>

            <Link
              to="/saved"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/saved')
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <Bookmark className="w-6 h-6" />
            </Link>

            <button
              onClick={() => {
                // Create file input for media selection (matching mobile app flow)
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*,video/*'
                input.onchange = (e: any) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate video duration (matching mobile app: 15s for reels, 40s for posts)
                    if (file.type.startsWith('video/')) {
                      const video = document.createElement('video')
                      video.preload = 'metadata'
                      video.onloadedmetadata = () => {
                        const duration = video.duration
                        const isReel = duration <= 15
                        if (duration > 40) {
                          alert('Video can be upto 40 seconds.')
                          return
                        }
                        // Create preview URL and navigate
                        const selectedPhoto = {
                          url: URL.createObjectURL(file),
                          type: file.type,
                          mimeType: file.type,
                          isReel: isReel,
                          file: file, // Keep file reference for upload
                        }
                        navigate('/post-caption-and-tag-friend', { state: { selectedPhoto } })
                      }
                      video.src = URL.createObjectURL(file)
                    } else {
                      // Image
                      const selectedPhoto = {
                        url: URL.createObjectURL(file),
                        type: file.type,
                        mimeType: file.type,
                        isReel: false,
                        file: file,
                      }
                      navigate('/post-caption-and-tag-friend', { state: { selectedPhoto } })
                    }
                  }
                }
                input.click()
              }}
              className={`p-2 rounded-lg transition-colors ${
                isActive('/post-caption-and-tag-friend')
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <Plus className="w-6 h-6" />
            </button>

            <Link
              to="/notifications"
              className={`p-2 rounded-lg transition-colors relative ${
                isActive('/notifications')
                  ? 'text-brand-primary bg-bg-secondary'
                  : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
              }`}
            >
              <Bell className="w-6 h-6" />
              {notificationsCount > 0 && (
                <span className="absolute top-1 right-1 bg-error text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  isActive(`/u/${user?.username}`)
                    ? 'text-brand-primary bg-bg-secondary'
                    : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
                }`}
              >
                <Avatar
                  src={user?.profilePicture || user?.media}
                  alt={user?.username}
                  name={user?.username}
                  size="sm"
                />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      to={`/u/${user?.username}`}
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-bg-secondary transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-bg-secondary transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-bg-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
