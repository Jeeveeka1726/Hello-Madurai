'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import { DocumentIcon, CloudArrowUpIcon, LinkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import PDFCompressionHelp from './PDFCompressionHelp'

interface HostingerPDFUploadProps {
  label: string
  currentUrl?: string
  onUpload: (url: string) => void
  className?: string
}

export default function HostingerPDFUpload({
  label,
  currentUrl,
  onUpload,
  className = ''
}: HostingerPDFUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState(currentUrl || '')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleFileUpload = async (file: File) => {
    console.log('🚀 handleFileUpload called with:', file.name, file.type, file.size)

    if (!file.type.includes('pdf')) {
      console.log('❌ Invalid file type:', file.type)
      toast.error(t('invalid_pdf', 'Please select a PDF file', 'PDF கோப்பைத் தேர்ந்தெடுக்கவும்'))
      return
    }

    // Check file size (10MB limit for Cloudinary free plan)
    const fileSizeKB = Math.round(file.size / 1024)
    const maxSizeKB = 10 * 1024 // 10MB in KB

    console.log(`📊 File size: ${fileSizeKB}KB (max: ${maxSizeKB}KB)`)

    if (file.size > maxSizeKB * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      console.log('❌ File too large:', fileSizeMB, 'MB')
      toast.error(
        t('file_too_large',
          `File too large (${fileSizeMB}MB). Maximum size is 10MB. Please compress your PDF first: https://bigpdf.11zon.com`,
          `கோப்பு மிகப் பெரியது (${fileSizeMB}MB). அதிகபட்ச அளவு 10MB. முதலில் PDF ஐ சுருக்கவும்: https://bigpdf.11zon.com`
        ),
        { duration: 8000 }
      )
      return
    }

    console.log(`📤 Starting upload for PDF: ${fileSizeKB}KB`)
    try {
      await uploadToCloudinary(file)
    } catch (error) {
      console.error('❌ Upload failed:', error)
      toast.error('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const uploadToCloudinary = async (file: File) => {

    setUploading(true)

    try {
      // Step 1: Get upload signature from our API
      console.log('🔑 Getting upload signature...')
      const signatureResponse = await fetch('/api/upload/magazine-pdf')
      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature')
      }
      const { signature, timestamp, cloudName, apiKey, folder, resourceType } = await signatureResponse.json()

      // Step 2: Upload directly to Cloudinary
      console.log('📤 Uploading PDF to Cloudinary...')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', apiKey)
      formData.append('folder', folder)
      // Note: resource_type is NOT included in form data for /raw/upload endpoint

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error('Cloudinary error:', errorData)

        // Handle specific Cloudinary errors
        if (errorData.error?.message?.includes('File size too large')) {
          throw new Error('File size exceeds 10MB limit. Please compress your PDF or upgrade your Cloudinary plan.')
        } else if (errorData.error?.message?.includes('Invalid file type')) {
          throw new Error('Invalid file type. Please upload a PDF file.')
        } else {
          throw new Error(errorData.error?.message || 'Cloudinary upload failed')
        }
      }

      const uploadData = await uploadResponse.json()
      console.log('✅ PDF uploaded to Cloudinary:', uploadData.secure_url)

      // Step 3: Return the Cloudinary URL
      onUpload(uploadData.secure_url)
      toast.success(t('upload_success', 'PDF uploaded successfully!', 'PDF வெற்றிகரமாக பதிவேற்றப்பட்டது!'))
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'

      // Show specific error message or fallback to generic message
      if (errorMessage.includes('File size')) {
        toast.error(errorMessage, { duration: 8000 })
      } else {
        toast.error(t('upload_failed', errorMessage, 'பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.'), { duration: 6000 })
      }
    } finally {
      setUploading(false)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed:', e.target.files)
    const files = e.target.files
    if (files && files.length > 0) {
      console.log('📄 Selected file:', files[0].name, files[0].size, 'bytes')
      handleFileUpload(files[0])
    } else {
      console.log('❌ No files selected')
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpload(urlInput.trim())
      toast.success(t('url_saved', 'URL saved successfully!', 'URL வெற்றிகரமாக சேமிக்கப்பட்டது!'))
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Upload Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('file')}
        >
          <CloudArrowUpIcon className="w-4 h-4 mr-1" />
          {t('upload_file', 'Upload File', 'கோப்பு பதிவேற்றம்')}
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('url')}
        >
          <LinkIcon className="w-4 h-4 mr-1" />
          {t('enter_url', 'Enter URL', 'URL உள்ளிடவும்')}
        </Button>
      </div>

      {uploadMode === 'file' ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <CardContent className="p-6 text-center">
            <DocumentIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              {t('drag_drop_pdf', 'Drag and drop PDF file here, or click to select', 'PDF கோப்பை இங்கே இழுத்து விடவும் அல்லது தேர்ந்தெடுக்க கிளிக் செய்யவும்')}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {t('max_size_10mb', 'Maximum file size: 10MB (Cloudinary free plan)', 'அதிகபட்ச கோப்பு அளவு: 10MB (Cloudinary இலவச திட்டம்)')}
            </p>

            {/* Compression Help */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">
                {t('compression_help_title', 'Need to compress your PDF?', 'உங்கள் PDF ஐ சுருக்க வேண்டுமா?')}
              </p>
              <p className="text-xs text-blue-600 mb-2">
                {t('compression_help', 'If your PDF is larger than 10MB, compress it first using 11zon', 'உங்கள் PDF 10MB க்கும் அதிகமாக இருந்தால், முதலில் 11zon பயன்படுத்தி சுருக்கவும்')}
              </p>
              <a
                href="https://bigpdf.11zon.com/en/compress-pdf/compress-pdf-to-chosen-size.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {t('manual_compression', 'Open 11zon Compression Tool →', '11zon சுருக்க கருவியைத் திறக்கவும் →')}
              </a>
            </div>

            <div className="mb-4">
              <PDFCompressionHelp />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? t('uploading', 'Uploading...', 'பதிவேற்றுகிறது...') : t('select_file', 'Select File', 'கோப்பைத் தேர்ந்தெடுக்கவும்')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://drive.google.com/file/d/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            size="sm"
          >
            {t('save_url', 'Save URL', 'URL சேமிக்கவும்')}
          </Button>
        </div>
      )}

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
