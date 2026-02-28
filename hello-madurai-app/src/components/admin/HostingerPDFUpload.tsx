'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

interface HostingerPDFUploadProps {
  label: string
  currentUrl?: string
  onUpload: (url: string) => void
  className?: string
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

export default function HostingerPDFUpload({
  label,
  currentUrl,
  onUpload,
  className = ''
}: HostingerPDFUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleFileUpload = async (file: File) => {
    console.log('🚀 [PDF Upload] Starting...', { name: file.name, type: file.type, size: `${(file.size / 1024 / 1024).toFixed(2)}MB` })

    if (!file.type.includes('pdf')) {
      toast.error(t('invalid_pdf', 'Please select a PDF file', 'PDF கோப்பைத் தேர்ந்தெடுக்கவும்'))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      toast.error(
        t('file_too_large',
          `File too large (${fileSizeMB}MB). Maximum is ${MAX_FILE_SIZE_MB}MB.`,
          `கோப்பு மிகப் பெரியது (${fileSizeMB}MB). அதிகபட்ச அளவு ${MAX_FILE_SIZE_MB}MB.`
        ),
        { duration: 8000 }
      )
      return
    }

    try {
      setUploading(true)
      setProgress(10)
      console.log('⏳ [PDF Upload] 10% - Requesting signature from API...')
      await uploadToCloudinary(file)
    } catch (error) {
      console.error('❌ [PDF Upload] Failed:', error)
      const msg = error instanceof Error ? error.message : 'Upload failed'
      toast.error(`❌ Upload failed: ${msg}`, { duration: 6000 })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const uploadToCloudinary = async (file: File) => {
    // Step 1: get signed upload token from our API (server keeps the secret)
    const folder = 'hello-madurai/magazines'
    const resourceType = 'raw'

    const sigRes = await fetch(`/api/upload/cloudinary-signature?folder=${folder}&resourceType=${resourceType}`)
    if (!sigRes.ok) {
      const err = await sigRes.json().catch(() => ({}))
      console.error('❌ [PDF Upload] Signature API failed:', sigRes.status, err)
      throw new Error(err?.error || `Failed to get upload signature (${sigRes.status})`)
    }

    const { signature, timestamp, cloudName, apiKey } = await sigRes.json()
    console.log('🔑 [PDF Upload] 20% - Signature received:', { cloudName, folder, resourceType })

    // Step 2: upload directly to Cloudinary
    setProgress(30)
    console.log('📤 [PDF Upload] 30% - Uploading to Cloudinary...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', String(timestamp))
    formData.append('api_key', apiKey)
    formData.append('folder', folder)
    formData.append('resource_type', resourceType)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
    console.log('🌐 [PDF Upload] Target URL:', uploadUrl)

    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData })

    setProgress(90)

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}))
      console.error('❌ [PDF Upload] Cloudinary rejected upload:', uploadRes.status, errData)
      throw new Error(errData?.error?.message || `Cloudinary rejected upload (${uploadRes.status})`)
    }

    const data = await uploadRes.json()
    console.log('✅ [PDF Upload] 100% - Success!', { public_id: data.public_id, url: data.secure_url })

    if (!data.secure_url) throw new Error('No URL returned from Cloudinary')

    setProgress(100)
    onUpload(data.secure_url)
    toast.success(t('upload_success', 'PDF uploaded successfully!', 'PDF வெற்றிகரமாக பதிவேற்றப்பட்டது!'))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFileUpload(files[0])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      console.log('📄 Selected file:', files[0].name, files[0].size, 'bytes')
      handleFileUpload(files[0])
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className={`border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}>
          <div className="p-6 text-center">
            <DocumentIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-1">
              {t('drag_drop_pdf', 'Drag and drop PDF file here, or click to select', 'PDF கோப்பை இங்கே இழுத்து விடவும் அல்லது தேர்ந்தெடுக்க கிளிக் செய்யவும்')}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {t('max_size_10mb', `Maximum file size: ${MAX_FILE_SIZE_MB}MB`, `அதிகபட்ச கோப்பு அளவு: ${MAX_FILE_SIZE_MB}MB`)}
            </p>

            {/* Progress bar */}
            {uploading && progress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {progress < 40
                    ? t('getting_token', 'Preparing upload...', 'பதிவேற்றத்திற்கு தயாரிக்கிறது...')
                    : progress < 90
                      ? t('uploading', 'Uploading to Cloudinary...', 'Cloudinary-ல் பதிவேற்றுகிறது...')
                      : t('finishing', 'Finishing...', 'முடிக்கிறது...')}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? t('uploading', 'Uploading...', 'பதிவேற்றுகிறது...')
                : t('select_file', 'Select File', 'கோப்பைத் தேர்ந்தெடுக்கவும்')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Current file */}
      {currentUrl && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {t('current_file', 'Current file:', 'தற்போதைய கோப்பு:')}
          </p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {currentUrl}
          </a>
        </div>
      )}
    </div>
  )
}
