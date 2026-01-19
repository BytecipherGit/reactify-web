import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { NavigationHeader } from './components/NavigationHeader'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { HomePage } from './pages/HomePage'
import { FeedPage } from './pages/FeedPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { EditProfilePage } from './pages/EditProfilePage'
import { FollowersPage } from './pages/FollowersPage'
import { FollowingPage } from './pages/FollowingPage'
import { MessagesPage } from './pages/MessagesPage'
import { ChatPage } from './pages/ChatPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { GroupsPage } from './pages/GroupsPage'
import { CreateGroupPage } from './pages/CreateGroupPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { EditGroupPage } from './pages/EditGroupPage'
import { SearchPage } from './pages/SearchPage'
import { SavedPostsPage } from './pages/SavedPostsPage'
import { PostCaptionAndTagFriendPage } from './pages/PostCaptionAndTagFriendPage'
import { SettingsPage } from './pages/SettingsPage'
import { ReelsPage } from './pages/ReelsPage'
import { StoriesPage } from './pages/StoriesPage'
import { CreateStoryPage } from './pages/CreateStoryPage'
import { ViewStoryPage } from './pages/ViewStoryPage'
import { ExplorePage } from './pages/ExplorePage'
import { HashtagPage } from './pages/HashtagPage'
import { ViewMediaPage } from './pages/ViewMediaPage'
import { FollowRequestsPage } from './pages/FollowRequestsPage'
import { AccountPrivacyPage } from './pages/AccountPrivacyPage'
import { HelpPage } from './pages/HelpPage'
import { AboutPage } from './pages/AboutPage'

// Routes that should hide the NavigationHeader (full-screen pages)
const HIDE_HEADER_ROUTES = [
  '/post-caption-and-tag-friend',
  '/create-story',
  '/view-media',
  '/stories',
]

function AppContent() {
  const location = useLocation()
  const shouldHideHeader = HIDE_HEADER_ROUTES.some(route => location.pathname.startsWith(route))

  return (
    <div className="min-h-screen bg-bg">
      {!shouldHideHeader && <NavigationHeader />}
      <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/hashtag/:tag" element={<HashtagPage />} />
                <Route path="/view-media" element={<ViewMediaPage />} />
                <Route path="/follow-requests" element={<FollowRequestsPage />} />
                <Route path="/post/:postId" element={<PostDetailPage />} />
                <Route path="/u/:username" element={<ProfilePage />} />
                <Route path="/u/:username/followers" element={<FollowersPage />} />
                <Route path="/u/:username/following" element={<FollowingPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/account-privacy" element={<AccountPrivacyPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:roomId" element={<ChatPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/create" element={<CreateGroupPage />} />
                <Route path="/groups/:groupId" element={<GroupDetailPage />} />
                <Route path="/groups/:groupId/edit" element={<EditGroupPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/saved" element={<SavedPostsPage />} />
                <Route path="/post-caption-and-tag-friend" element={<PostCaptionAndTagFriendPage />} />
                <Route path="/reels" element={<ReelsPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/create-story" element={<CreateStoryPage />} />
                <Route path="/stories/:userId" element={<ViewStoryPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      
      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
