import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Button } from '../components/ui'
import { ArrowLeft, Shield } from 'lucide-react'

export function AccountPrivacyPage() {
  const navigate = useNavigate()
  const [isPrivateAccount, setIsPrivateAccount] = useState(false)
  const [showMoreDetail, setShowMoreDetail] = useState(false)

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-brand-primary" />
            <h1 className="text-2xl font-bold text-text">Account Privacy</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Private Account Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text">Private Account</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    When your account is private, only people you approve can see your posts and stories.
                  </p>
                </div>
                <button
                  onClick={() => setIsPrivateAccount(!isPrivateAccount)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPrivateAccount ? 'bg-brand-primary' : 'bg-text-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPrivateAccount ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-border">
                <p className={`text-sm text-text-secondary ${showMoreDetail ? '' : 'line-clamp-3'}`}>
                  When your account is private, only people you approve can see your photos and videos on Reactify.
                  Your existing followers won't be affected. If someone wants to follow you, they'll need to send a
                  follow request that you can approve or ignore. You can make your account private at any time.
                </p>
                <button
                  onClick={() => setShowMoreDetail(!showMoreDetail)}
                  className="mt-2 text-sm font-semibold text-brand-primary hover:underline"
                >
                  {showMoreDetail ? 'Show less' : 'Learn more'}
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={() => {
                    // TODO: Implement API call to update privacy settings
                    alert('Privacy settings will be saved (API integration pending)')
                    navigate(-1)
                  }}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
