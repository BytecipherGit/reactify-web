import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { createStory } from '../store/reducers/storiesSlice'
import { NavigationHeader } from '../components/NavigationHeader'
import {
  Button,
  Card,
  CardContent,
  StatusMessage,
  LoadingSpinner,
} from '../components/ui'
import { X, Image as ImageIcon, Video } from 'lucide-react'

export function CreateStoryPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.stories)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file')
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedFile) {
      setError('Please select an image or video')
      return
    }

    try {
      const formData = new FormData()
      formData.append('postType', 'Story')
      formData.append('media', selectedFile)
      formData.append('mimeType', selectedFile.type)

      const result = await dispatch(createStory(formData))

      if (createStory.fulfilled.match(result)) {
        navigate('/feed', { replace: true })
      } else {
        const errorMsg = result.payload as string
        setError(errorMsg || 'Failed to create story')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Create Story</h1>
          <p className="text-sm text-text-secondary mt-1">
            Share a moment that disappears after 24 hours
          </p>
        </div>

        {error && (
          <StatusMessage
            type="error"
            message={error}
            gradient
            dismissible
            onDismiss={() => setError(null)}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-4 space-y-4">
              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Media (Image or Video)
                </label>
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand-primary transition-colors"
                  >
                    <ImageIcon className="w-12 h-12 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">
                      Click to upload image or video
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Max size: 100MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {selectedFile.type.startsWith('image/') ? (
                      <img
                        src={preview || ''}
                        alt="Preview"
                        className="w-full h-auto rounded-lg max-h-96 object-cover"
                      />
                    ) : (
                      <video
                        src={preview || ''}
                        controls
                        className="w-full rounded-lg max-h-96"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 bg-error text-white rounded-full p-2 hover:opacity-80 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/feed')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary text-white hover:opacity-90"
                  disabled={loading || !selectedFile}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" variant="white" />
                      Creating...
                    </span>
                  ) : (
                    'Create Story'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
