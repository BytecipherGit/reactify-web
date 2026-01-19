/**
 * File Upload Utility
 * Since direct S3 uploads from browser are blocked by CORS,
 * we'll upload through the backend API instead
 */

import { api } from './api'

/**
 * Upload file through backend API
 * Backend should handle S3 upload and return the URL
 * @param file - File object from input
 * @returns Promise<string> - The S3 URL of the uploaded file
 */
export const uploadFileViaBackend = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mimeType', file.type)

    // Try to upload via backend endpoint
    // If this endpoint doesn't exist, backend needs to be updated
    const response = await api.post('/upload/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Backend should return { url: "https://s3-url..." }
    return response.data?.url || response.data?.data?.url || response.data?.media
  } catch (error: any) {
    console.error('Backend upload error:', error)
    
    // If backend endpoint doesn't exist, fall back to direct S3 upload
    // (will fail due to CORS, but at least we tried)
    throw new Error(
      'Backend upload endpoint not available. Please configure S3 CORS or add /upload/media endpoint to backend.'
    )
  }
}
