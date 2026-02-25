'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

interface HostingerPDFUploadProps {
  label: string
  currentUrl?: string
  onUpload: (url: string) => void
  className?: string
}

const CHUNK_SIZE = 1 * 1024 * 1024 // 1MB per chunk — safely under any server limit
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB max total

export default function HostingerPDFUpload({
  label,
  currentUrl,
  onUpload,
  className = ''
}: HostingerPDFUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0) // 0–100
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleFileUpload = async (file: File) => {
    console.log('🚀 handleFileUpload called with:', file.name, file.type, file.size)

    if (!file.type.includes('pdf')) {
      toast.error(t('invalid_pdf', 'Please select a PDF file', 'PDF கோப்பைத் தேர்ந்தெடுக்கவும்'))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      toast.error(
        t('file_too_large',
          `File too large (${fileSizeMB}MB). Maximum size is 50MB. Compress at: https://bigpdf.11zon.com`,
          `கோப்பு மிகப் பெரியது (${fileSizeMB}MB). அதிகபட்ச அளவு 50MB.`
        ),
        { duration: 8000 }
      )
      return
    }

    const fileSizeKB = Math.round(file.size / 1024)
    console.log(`📊 File size: ${fileSizeKB}KB (max: ${MAX_FILE_SIZE / 1024}KB)`)
    console.log(`📤 Starting upload for PDF: ${fileSizeKB}KB`)

    try {
      await uploadInChunks(file)
    } catch (error) {
      console.error('❌ Upload failed:', error)
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const uploadInChunks = async (file: File) => {
    const uploadUrl = process.env.NEXT_PUBLIC_HOSTINGER_PDF_UPLOAD_URL

    if (!uploadUrl) {
      throw new Error('PDF upload URL not configured. Set NEXT_PUBLIC_HOSTINGER_PDF_UPLOAD_URL.')
    }

    setUploading(true)
    setProgress(0)

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    // Unique ID for this upload session (used by PHP to group chunks)
    const fileId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')

    console.log(`📦 Uploading in ${totalChunks} chunk(s) of ${CHUNK_SIZE / 1024}KB each`)

    let finalUrl: string | null = null

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk, cleanFilename)
      formData.append('chunkIndex', i.toString())
      formData.append('totalChunks', totalChunks.toString())
      formData.append('fileId', fileId)
      formData.append('filename', cleanFilename)

      console.log(`📤 Uploading chunk ${i + 1}/${totalChunks} (${Math.round(chunk.size / 1024)}KB)`)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = `Chunk ${i + 1} upload failed (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData?.error || errorMessage
        } catch { /* ignore */ }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Update progress bar
      const pct = Math.round(((i + 1) / totalChunks) * 100)
      setProgress(pct)

      // Last chunk returns the assembled file URL
      if (data.url) {
        finalUrl = data.url
        console.log('✅ PDF assembled and saved:', finalUrl)
      }
    }

    if (!finalUrl) {
      throw new Error('Upload completed but no URL returned from server')
    }

    onUpload(finalUrl)
    toast.success(t('upload_success', 'PDF uploaded successfully!', 'PDF வெற்றிகரமாக பதிவேற்றப்பட்டது!'))
    setUploading(false)
    setProgress(0)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFileUpload(files[0])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed:', e.target.files)
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
              {t('max_size_50mb', 'Maximum file size: 50MB', 'அதிகபட்ச கோப்பு அளவு: 50MB')}
            </p>

            {/* Progress bar (visible while uploading) */}
            {uploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {t('uploading_progress', `Uploading... ${progress}%`, `பதிவேற்றுகிறது... ${progress}%`)}
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
                ? t('uploading', `Uploading ${progress}%...`, `பதிவேற்றுகிறது ${progress}%...`)
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

      {/* Current File Display */}
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
