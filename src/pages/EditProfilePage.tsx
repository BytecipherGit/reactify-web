import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { editProfile, clearError } from '../store/reducers/profileSlice'
import { Button, Input, Card, CardContent, StatusMessage, Avatar } from '../components/ui'
import { ArrowLeft, Edit } from 'lucide-react'
import { uploadFile } from '../lib/s3Upload'

export function EditProfilePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const { editProfileLoading, error } = useAppSelector((state) => state.profile)
  
  const [firstName, setFirstName] = useState(currentUser?.firstName || '')
  const [lastName, setLastName] = useState(currentUser?.lastName || '')
  const [bio, setBio] = useState(currentUser?.description || currentUser?.bio || '')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setSuccessMsg(null)

    try {
      setUploading(true)
      
      // Matching mobile app flow EXACTLY:
      // Mobile app: Upload to S3 first (direct), get URL, then send JSON { description, media: url } to backend
      // Backend only needs media as URL string, not file
      
      if (profileImage) {
        // Upload to S3 first (matching mobile app exactly)
        try {
          const fileUrl = await uploadFile(profileImage)
          
          // Send JSON with description and media URL (matching mobile app when image is selected)
          const formData = {
            description: bio,
            media: fileUrl
          }
          
          const result = await dispatch(editProfile(formData))
          
          if (editProfile.fulfilled.match(result)) {
            setSuccessMsg('Profile updated successfully!')
            setTimeout(() => {
              navigate(`/u/${currentUser?.username}`)
            }, 1500)
          } else {
            const errorMsg = result.payload as string
            alert(errorMsg || 'Failed to update profile')
          }
        } catch (uploadError) {
          console.error('Failed to upload image to S3:', uploadError)
          alert(
            'Failed to upload image. S3 CORS needs to be configured.\n\n' +
            'Please configure CORS on S3 bucket "reelmails" to allow uploads from your web domain.\n' +
            'See S3_CORS_CONFIGURATION.md for instructions.'
          )
          return
        }
      } else {
        // No new image - send JSON with firstName, lastName, description, and existing media (matching mobile app)
        const formData = {
          description: bio,
          firstName: firstName || currentUser?.firstName,
          lastName: lastName || currentUser?.lastName,
          media: currentUser?.media || currentUser?.profilePicture
        }
        
        const result = await dispatch(editProfile(formData))
        
        if (editProfile.fulfilled.match(result)) {
          setSuccessMsg('Profile updated successfully!')
          setTimeout(() => {
            navigate(`/u/${currentUser?.username}`)
          }, 1500)
        } else {
          const errorMsg = result.payload as string
          alert(errorMsg || 'Failed to update profile')
        }
      }
    } catch (err) {
      console.error('Failed to update profile:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-2xl font-bold text-text">Edit Profile</h1>
        </div>

        {error && (
          <StatusMessage type="error" message={error} className="mb-4" />
        )}

        {successMsg && (
          <StatusMessage type="success" message={successMsg} className="mb-4" />
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture - Matching mobile app layout */}
              <div className="flex items-start gap-4 mb-8">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={previewImage || currentUser?.media || currentUser?.profilePicture}
                    alt={currentUser?.username || 'Profile'}
                    name={currentUser?.username || 'Profile'}
                    size="xl"
                    className="w-20 h-20 border-2 border-black rounded-full"
                  />
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#EC3D72] rounded-full border-2 border-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-base font-semibold text-text mb-1">Edit Your Profile</h3>
                  <p className="text-sm text-text-secondary">
                    Edit your profile photo, name and date of birth to let people know who you are.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="profile-image-input"
                />
              </div>

              {/* First Name - Matching mobile app */}
              <div className="flex items-center border border-border rounded px-4 h-12">
                <label htmlFor="firstName" className="text-sm font-medium text-text-secondary w-20 flex-shrink-0">
                  First name:
                </label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="border-0 bg-transparent px-0 focus:ring-0"
                />
              </div>

              {/* Last Name - Matching mobile app */}
              <div className="flex items-center border border-border rounded px-4 h-12">
                <label htmlFor="lastName" className="text-sm font-medium text-text-secondary w-20 flex-shrink-0">
                  Last name:
                </label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="border-0 bg-transparent px-0 focus:ring-0"
                />
              </div>

              {/* Username - Matching mobile app (read-only) */}
              <div className="flex items-center border border-border rounded px-4 h-12 bg-bg-secondary">
                <label htmlFor="username" className="text-sm font-medium text-text-secondary w-20 flex-shrink-0">
                  Username:
                </label>
                <Input
                  id="username"
                  type="text"
                  value={currentUser?.username || ''}
                  disabled
                  className="border-0 bg-transparent px-0 cursor-not-allowed"
                />
              </div>

              {/* Email - Matching mobile app (read-only) */}
              <div className="flex items-center border border-border rounded px-4 h-12 bg-bg-secondary">
                <label htmlFor="email" className="text-sm font-medium text-text-secondary w-20 flex-shrink-0">
                  Email:
                </label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="border-0 bg-transparent px-0 cursor-not-allowed"
                />
              </div>

              {/* Bio - Matching mobile app */}
              <div className="flex items-center border border-border rounded px-4 min-h-[50px] py-2">
                <label htmlFor="bio" className="text-sm font-medium text-text-secondary w-20 flex-shrink-0">
                  Bio:
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio"
                  rows={2}
                  className="flex-1 border-0 bg-transparent px-0 resize-none focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Submit Button - Matching mobile app */}
              <div className="flex justify-center pt-8 pb-4">
                <Button
                  type="submit"
                  isLoading={editProfileLoading || uploading}
                  disabled={editProfileLoading || uploading}
                  className="bg-gradient-primary text-white px-12 py-3 hover:opacity-90"
                >
                  {uploading ? 'Uploading...' : editProfileLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
