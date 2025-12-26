'use client'

import { useState, useRef } from 'react'
import { 
  PhotoIcon, 
  DocumentIcon, 
  XMarkIcon, 
  ArrowPathIcon, 
  CloudArrowUpIcon,
  LinkIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

interface FileUploadProps {
  label: string
  fileType: 'image' | 'pdf' | 'audio' | 'document'
  currentFile?: string
  currentUrl?: string
  onFileUpload: (url: string) => void
  onUrlChange: (url: string) => void
  className?: string
  accept?: string
  maxSize?: number // in MB
  showUrlOption?: boolean
}

const fileTypeConfig = {
  image: {
    icon: PhotoIcon,
    accept: 'image/*',
    maxSize: 5,
    label: 'Image'
  },
  pdf: {
    icon: DocumentIcon,
    accept: 'application/pdf',
    maxSize: 10,
    label: 'PDF'
  },
  audio: {
    icon: SpeakerWaveIcon,
    accept: 'audio/*',
    maxSize: 50,
    label: 'Audio'
  },
  document: {
    icon: DocumentIcon,
    accept: '.pdf,.doc,.docx,.txt',
    maxSize: 10,
    label: 'Document'
  }
}

export default function FileUpload({
  label,
  fileType,
  currentFile,
  currentUrl,
  onFileUpload,
  onUrlChange,
  className = '',
  accept,
  maxSize,
  showUrlOption = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState(currentUrl || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const config = fileTypeConfig[fileType]
  const IconComponent = config.icon
  const acceptTypes = accept || config.accept
  const maxFileSize = (maxSize || config.maxSize) * 1024 * 1024 // Convert to bytes

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (acceptTypes && !file.type.match(acceptTypes.replace(/\*/g, '.*'))) {
      toast.error(`Only ${config.label.toLowerCase()} files are allowed.`)
      return
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`File size cannot exceed ${maxSize || config.maxSize}MB.`)
      return
    }

    setUploading(true)

    try {
      // Use Cloudinary for audio files (better for large files and streaming)
      if (fileType === 'audio') {
        await handleAudioUploadToCloudinary(file)
      } else {
        // Use regular upload for other file types
        await handleRegularUpload(file)
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error(`⏰ Upload timeout. Please try again with a smaller file.`)
      } else {
        toast.error(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleAudioUploadToCloudinary = async (file: File) => {
    console.log('📤 Uploading audio file to Cloudinary (direct upload)...')
    console.log('📊 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    // Step 1: Get upload signature from our API
    const signatureResponse = await fetch('/api/upload/radio-audio')
    if (!signatureResponse.ok) {
      throw new Error('Failed to get upload signature')
    }
    const { signature, timestamp, cloudName, apiKey, folder } = await signatureResponse.json()

    console.log('🔑 Got upload signature, uploading directly to Cloudinary...')

    // Step 2: Upload directly to Cloudinary (bypasses Vercel's 4.5MB limit)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('folder', folder)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json()
      console.error('❌ Cloudinary upload failed:', errorData)
      throw new Error(errorData.error?.message || 'Cloudinary upload failed')
    }

    const cloudinaryData = await cloudinaryResponse.json()
    console.log('✅ Cloudinary upload successful:', cloudinaryData.public_id)

    // Step 3: Save metadata to our database
    const metadataResponse = await fetch('/api/upload/save-audio-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        duration: cloudinaryData.duration
          ? `${Math.floor(cloudinaryData.duration / 60)}:${String(Math.floor(cloudinaryData.duration % 60)).padStart(2, '0')}`
          : null,
      }),
    })

    if (!metadataResponse.ok) {
      throw new Error('Failed to save audio metadata')
    }

    const metadataData = await metadataResponse.json()
    console.log('✅ Metadata saved:', metadataData.id)

    onFileUpload(cloudinaryData.secure_url)
    toast.success('✅ Audio file uploaded to Cloudinary successfully!')
  }

  const handleRegularUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileType)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      onFileUpload(data.url)

      if (data.resized) {
        toast.success(`✅ ${config.label} uploaded and resized to 1280x720!`)
      } else {
        toast.success(`✅ ${config.label} uploaded successfully!`)
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Upload failed:', errorData)
      toast.error(`❌ Upload failed: ${errorData.error || 'Unknown error'}. Please try again.`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileChange(e.dataTransfer.files)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlChange(urlInput.trim())
      toast.success('URL updated successfully!')
    }
  }

  const removeFile = () => {
    onFileUpload('')
    onUrlChange('')
    setUrlInput('')
  }

  const currentFileUrl = currentFile || currentUrl

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Mode Toggle */}
      {showUrlOption && (
        <div className="flex space-x-2 mb-4">
          <Button
            type="button"
            variant={uploadMode === 'file' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('file')}
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-1" />
            Upload File
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'url' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('url')}
          >
            <LinkIcon className="h-4 w-4 mr-1" />
            Use URL
          </Button>
        </div>
      )}

      {uploadMode === 'file' ? (
        /* File Upload Mode */
        <div>
          {!currentFileUrl ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                onChange={(e) => handleFileChange(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
                value=""
              />
              
              <div className="flex flex-col items-center space-y-2">
                <IconComponent className="h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  {uploading ? (
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                      <br />
                      <span className="text-xs">
                        Max size: {maxSize || config.maxSize}MB
                        {fileType === 'image' && (
                          <><br />Recommended: 1280px × 720px</>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* File Preview */
            <div className="relative border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {config.label} uploaded
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentFileUrl}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {fileType === 'image' && currentFileUrl && (
                <div className="mt-3">
                  <img
                    src={currentFileUrl}
                    alt="Preview"
                    className="max-h-32 rounded border"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* URL Input Mode */
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={`Enter ${config.label.toLowerCase()} URL...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              Set URL
            </Button>
          </div>
          
          {currentUrl && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                  {currentUrl}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
