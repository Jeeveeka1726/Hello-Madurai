'use client'

import { useState, useRef } from 'react'
import { DocumentIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

interface HostingerDirectPDFUploadProps {
  onUpload: (url: string) => void
  currentUrl?: string
  className?: string
}

export default function HostingerDirectPDFUpload({
  onUpload,
  currentUrl,
  className = ''
}: HostingerDirectPDFUploadProps) {
  const { t } = useLanguage()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hostinger API endpoint - moved to root directory to avoid restrictions
  const HOSTINGER_API_URL = 'https://hellomadurai.com/upload-pdf.php'

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error(t('invalid_pdf', 'Please select a PDF file', 'PDF கோப்பைத் தேர்ந்தெடுக்கவும்'))
      return
    }

    // Check file size (512MB limit)
    const maxSize = 512 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(t('file_too_large', 'File too large. Maximum size is 512MB.', 'கோப்பு மிகப் பெரியது. அதிகபட்ச அளவு 512MB.'))
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      console.log('📤 Uploading PDF directly to Hostinger:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
          console.log(`📊 Upload progress: ${progress}%`)
        }
      })

      // Handle response
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
          }
        }

        xhr.onerror = () => reject(new Error('Network error'))
        xhr.ontimeout = () => reject(new Error('Upload timeout'))
      })

      // Configure and send request
      xhr.timeout = 300000 // 5 minutes timeout
      xhr.open('POST', HOSTINGER_API_URL)
      xhr.send(formData)

      const data = await uploadPromise

      if (data.success) {
        console.log('✅ PDF uploaded successfully to Hostinger:', data.url)
        onUpload(data.url)
        toast.success(t('upload_success', 'PDF uploaded successfully!', 'PDF வெற்றிகரமாக பதிவேற்றப்பட்டது!'))
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('❌ Hostinger upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(t('upload_failed', `Upload failed: ${errorMessage}`, `பதிவேற்றம் தோல்வியடைந்தது: ${errorMessage}`))
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const clearFile = () => {
    onUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current File Display */}
      {currentUrl && !uploading && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <DocumentIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {t('current_file', 'Current PDF', 'தற்போதைய PDF')}
              </p>
              <p className="text-xs text-green-600 truncate max-w-xs">
                {currentUrl.split('/').pop()}
              </p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="text-green-600 hover:text-green-800"
            title={t('remove_file', 'Remove file', 'கோப்பை அகற்று')}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${uploading ? 'pointer-events-none opacity-75' : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer'}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('uploading', 'Uploading to Hostinger...', 'ஹோஸ்டிங்கரில் பதிவேற்றுகிறது...')}
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {t('upload_pdf', 'Upload PDF to Hostinger', 'PDF ஐ ஹோஸ்டிங்கரில் பதிவேற்றவும்')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('drag_drop_or_click', 'Drag & drop or click to select', 'இழுத்து விடவும் அல்லது தேர்ந்தெடுக்க கிளிக் செய்யவும்')}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {t('max_size_512mb', 'Maximum file size: 512MB', 'அதிகபட்ச கோப்பு அளவு: 512MB')}
            </p>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>✅ {t('direct_hostinger', 'Direct upload to your Hostinger server', 'உங்கள் ஹோஸ்டிங்கர் சர்வரில் நேரடி பதிவேற்றம்')}</p>
        <p>✅ {t('large_files', 'Supports files up to 512MB', '512MB வரை கோப்புகளை ஆதரிக்கிறது')}</p>
        <p>✅ {t('your_domain', 'Files served from your domain', 'உங்கள் டொமைனில் இருந்து கோப்புகள் வழங்கப்படும்')}</p>
      </div>
    </div>
  )
}
