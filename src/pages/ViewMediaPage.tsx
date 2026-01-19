import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '../components/ui'

export function ViewMediaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const image = searchParams.get('image')
  const video = searchParams.get('video')
  const type = searchParams.get('type') || (image ? 'image' : video ? 'video' : 'image')

  useEffect(() => {
    // Prevent body scroll when viewing media
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
        aria-label="Close"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Close Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Media Content */}
      <div className="w-full h-full flex items-center justify-center">
        {type === 'image' && image ? (
          <img
            src={image}
            alt="Full screen media"
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={handleBack}
          />
        ) : type === 'video' && video ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={video}
              controls
              autoPlay
              className="max-w-full max-h-full"
              onLoadedData={() => setIsVideoLoaded(true)}
              onError={() => {
                console.error('Video failed to load')
                setIsVideoLoaded(false)
              }}
            >
              Your browser does not support the video tag.
            </video>
            {!isVideoLoaded && (
              <div className="absolute text-white">Loading video...</div>
            )}
          </div>
        ) : (
          <div className="text-white text-center">
            <p className="text-lg mb-4">No media to display</p>
            <Button onClick={handleBack} variant="ghost" className="text-white">
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
