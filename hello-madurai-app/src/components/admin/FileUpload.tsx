'use client'

import { useState, useRef } from 'react'
import { 
  PhotoIcon, 
  DocumentIcon, 
  VideoCameraIcon,
  XMarkIcon, 
  ArrowPathIcon, 
  CloudArrowUpIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

interface FileUploadProps {
  label: string
  fileType: 'image' | 'pdf' | 'video' | 'audio' | 'document'
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
  video: {
    icon: VideoCameraIcon,
    accept: 'video/*',
    maxSize: 100,
    label: 'Video'
  },
  audio: {
    icon: VideoCameraIcon,
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
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileType)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onFileUpload(data.url)
        toast.success(`${config.label} uploaded successfully!`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to upload ${config.label.toLowerCase()}.`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('An unexpected error occurred during upload.')
    } finally {
      setUploading(false)
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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                isDragging
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600'
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
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {uploading ? (
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-purple-600 hover:text-purple-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                      <br />
                      <span className="text-xs">
                        Max size: {maxSize || config.maxSize}MB
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* File Preview */
            <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {config.label} uploaded
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
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
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
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
