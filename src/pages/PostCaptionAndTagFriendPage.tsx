import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { createPost, getPostType } from '../store/reducers/postSlice'
import {
  Button,
  Input,
  Card,
  CardContent,
  StatusMessage,
  LoadingSpinner,
  Select,
} from '../components/ui'
import { X, Image as ImageIcon, MapPin, ArrowLeft } from 'lucide-react'

interface SelectedPhoto {
  uri?: string
  url?: string
  type?: string
  mimeType?: string
  isReel?: boolean
  width?: number
  height?: number
  file?: File // Web: File object for upload
  assets?: Array<{
    uri: string
    type: string
    width?: number
    height?: number
  }>
  [key: string]: any
}

export function PostCaptionAndTagFriendPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { loading, postCategory } = useAppSelector((state) => state.post)

  // Get selectedPhoto from route params (matching mobile app)
  const selectedPhoto: SelectedPhoto | null = location.state?.selectedPhoto || null

  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [locationText, setLocationText] = useState('')
  const [dropdownValue, setDropdownValue] = useState<string>('')
  const [postTypeValue, setPostTypeValue] = useState<string | null>(null)
  const [firstSetup, setFirstSetup] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get SelectPhoto - matching mobile app logic
  let SelectPhoto: SelectedPhoto | null = null
  if (selectedPhoto) {
    if ('assets' in selectedPhoto && selectedPhoto.assets && selectedPhoto.assets.length > 0) {
      // iOS format
      SelectPhoto = selectedPhoto.assets[0] as any
    } else {
      // Android format or web format
      SelectPhoto = selectedPhoto
    }
  }

  // Fetch post categories - matching mobile app (using Redux)
  useEffect(() => {
    dispatch(getPostType())
  }, [dispatch])

  // Set default category when categories load - matching mobile app
  useEffect(() => {
    if (!firstSetup && postCategory && postCategory.length > 0) {
      setFirstSetup(true)
      setPostTypeValue(postCategory[0]._id)
      setDropdownValue(postCategory[0]._id)
    } else {
      setFirstSetup(false)
    }
  }, [postCategory, firstSetup])

  // Create preview from selectedPhoto - matching mobile app
  useEffect(() => {
    if (SelectPhoto) {
      if (SelectPhoto.file) {
        // Web: Create preview from File object
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        if (SelectPhoto.file.type.startsWith('image/')) {
          reader.readAsDataURL(SelectPhoto.file)
        } else {
          setPreview(URL.createObjectURL(SelectPhoto.file))
        }
      } else {
        const photoUrl = SelectPhoto.uri || SelectPhoto.url || ''
        if (photoUrl) {
          setPreview(photoUrl)
        }
      }
    }
  }, [SelectPhoto])

  // Redirect if no selectedPhoto (matching mobile app behavior)
  useEffect(() => {
    if (!selectedPhoto) {
      navigate('/feed', { replace: true })
    }
  }, [selectedPhoto, navigate])

  const processedData = (postCategory || []).map((item: any) => ({
    ...item,
    displayLabel: `${item.type} ${item.time || ''}`.trim(),
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!SelectPhoto) {
      setError('No media selected')
      return
    }

    try {
      // Prepare formData matching mobile app structure
      const formData = new FormData()

      // Add text/caption
      if (caption.trim()) {
        formData.append('text', caption.trim())
      }

      // Add location
      if (locationText.trim()) {
        formData.append('location', locationText.trim())
      }

      // Add post type
      formData.append('postType', 'Post')

      // Add isReelMail flag
      formData.append('isReelMail', (SelectPhoto.isReel || false).toString())

      // Add post category
      if (dropdownValue) {
        formData.append('postCategory', dropdownValue)
      }

      // Add media file - matching mobile app (file should be passed from navigation)
      if (SelectPhoto.file) {
        // Web: File object from file input
        formData.append('media', SelectPhoto.file)
        formData.append('mimeType', SelectPhoto.file.type)
      } else if (SelectPhoto.uri || SelectPhoto.url) {
        // Fallback: convert URL to File (for compatibility)
        try {
          const response = await fetch(SelectPhoto.uri || SelectPhoto.url || '')
          const blob = await response.blob()
          const file = new File([blob], 'media', { type: SelectPhoto.type || SelectPhoto.mimeType || blob.type })
          formData.append('media', file)
          formData.append('mimeType', file.type)
        } catch (err) {
          throw new Error('Failed to process media file')
        }
      }

      const result = await dispatch(createPost(formData))

      if (createPost.fulfilled.match(result)) {
        // Navigate to feed - matching mobile app
        navigate('/feed', { replace: true })
      } else {
        const errorMsg = result.payload as string
        setError(errorMsg || 'Failed to create post')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    }
  }

  if (!selectedPhoto) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header - Matching mobile app */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/feed')}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
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
              {/* Caption - Matching mobile app (shown first) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Caption
                </label>
                <Input
                  as="textarea"
                  rows={4}
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="resize-none"
                  maxLength={500}
                />
              </div>

              {/* Location - Matching mobile app (labeled as "Add Hashtags..." in mobile but it's location) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Input
                  placeholder="Add location (optional)"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </div>

              {/* Post Category Dropdown - Matching mobile app */}
              {postCategory && postCategory.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Post Type
                  </label>
                  <Select
                    value={dropdownValue}
                    onChange={(value) => {
                      setDropdownValue(value)
                      setPostTypeValue(value)
                    }}
                    options={processedData.map((cat: any) => ({
                      value: cat._id,
                      label: cat.displayLabel || cat.type,
                    }))}
                    placeholder="Post type."
                  />
                  {SelectPhoto?.isReel && dropdownValue && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-error font-semibold">0.25</span>
                      <span className="text-sm text-text">RGC</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-text-secondary">Loading post types...</span>
                </div>
              )}

              {/* Media Preview - Matching mobile app structure */}
              {SelectPhoto && preview && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: '#764ba2', // Colors.purple from mobile app
                    paddingTop: '20px',
                    paddingBottom: '33%', // ScreenHeight / 3 from mobile
                    marginTop: '20px',
                  }}
                >
                  {SelectPhoto.type?.includes('image') || SelectPhoto.mimeType?.includes('image') ? (
                    <div style={{ height: '50vh', margin: '20px' }}>
                      <p className="text-white text-sm mb-2" style={{ fontSize: '14px', marginVertical: '10px' }}>
                        Image Preview
                      </p>
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full rounded-lg"
                        style={{
                          width: '90%',
                          height: '300px',
                          borderRadius: '20px',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: '50vh' }}>
                      <p className="text-white text-sm text-center" style={{ fontSize: '14px' }}>
                        Video Preview
                      </p>
                      <video
                        src={preview}
                        controls={false}
                        className="w-full rounded-lg"
                        style={{
                          backgroundColor: 'white',
                          width: '90%',
                          height: '70vh',
                          alignSelf: 'center',
                          marginTop: '10px',
                          borderRadius: '20px',
                          margin: '0 auto',
                          display: 'block',
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Post Button - Matching mobile app */}
              {SelectPhoto && (
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    className="bg-white text-brand-primary hover:opacity-90 flex items-center gap-2 px-8"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" variant="primary" />
                        Posting...
                      </span>
                    ) : (
                      <>
                        Post{' '}
                        <span className="text-lg">→</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
