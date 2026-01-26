'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Reel {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  thumbnailUrl?: string
  reelType: string
  duration?: string
  views: number
  likes: number
  active: boolean
  orderNumber: number
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface ReelFormProps {
  reel?: Reel | null
  onClose: () => void
  onSave: () => void
}

export default function ReelForm({ reel, onClose, onSave }: ReelFormProps) {
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    videoUrl: '',
    thumbnailUrl: '',
    reelType: 'youtube',
    duration: '',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)

  useEffect(() => {
    if (reel) {
      setFormData({
        title: reel.title,
        title_ta: reel.title_ta || '',
        videoUrl: reel.videoUrl,
        thumbnailUrl: reel.thumbnailUrl || '',
        reelType: reel.reelType,
        duration: reel.duration || '',
        active: reel.active
      })
    }
  }, [reel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = reel ? `/api/reels/${reel.id}` : '/api/reels'
      const method = reel ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(`Reel ${reel ? 'updated' : 'created'} successfully`)
        onSave()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save reel')
      }
    } catch (error) {
      console.error('Error saving reel:', error)
      toast.error('Failed to save reel')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, videoUrl: url }))

    // Auto-detect reel type only (no thumbnail auto-generation)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setFormData(prev => ({ ...prev, reelType: 'youtube' }))
    } else if (url.includes('instagram.com')) {
      setFormData(prev => ({ ...prev, reelType: 'instagram' }))
    } else {
      setFormData(prev => ({ ...prev, reelType: 'upload' }))
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!file.type || !allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type: ${file.type}. Please upload JPG, PNG, GIF, WebP, or SVG`)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingThumbnail(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'image')
      uploadFormData.append('skipResize', 'true')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        console.error('Upload error response:', errorData)
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      console.log('Upload success:', data)
      setFormData(prev => ({ ...prev, thumbnailUrl: data.url }))
      toast.success('Thumbnail uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload thumbnail'
      toast.error(errorMessage)
    } finally {
      setUploadingThumbnail(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {reel ? 'Edit Reel' : 'Add New Reel'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (English) *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Title Tamil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Tamil)
            </label>
            <input
              type="text"
              value={formData.title_ta}
              onChange={(e) => setFormData(prev => ({ ...prev, title_ta: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports YouTube Shorts, Instagram Reels, or direct video uploads
            </p>
          </div>

          {/* Reel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reel Type
            </label>
            <select
              value={formData.reelType}
              onChange={(e) => setFormData(prev => ({ ...prev, reelType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="upload">Direct Upload</option>
            </select>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <input
              type="text"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="Paste thumbnail URL or upload image below"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.thumbnailUrl
                ? '✓ Thumbnail URL set. You can paste a different URL or upload a new image below.'
                : 'Paste a thumbnail URL here or upload an image below.'}
            </p>

            {/* File Upload Option */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload Thumbnail Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadingThumbnail}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingThumbnail && (
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </p>
              )}
              {formData.thumbnailUrl && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 mb-1">✓ Thumbnail set</p>
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-24 h-40 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 0:30, 1:15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active (show on homepage)
            </label>
          </div>

          {/* Preview */}
          {formData.videoUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Preview
              </label>
              <div className="w-32 h-56 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {formData.thumbnailUrl ? (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Reel preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500 text-xs p-2">
                    No thumbnail
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Saving...' : (reel ? 'Update Reel' : 'Add Reel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
