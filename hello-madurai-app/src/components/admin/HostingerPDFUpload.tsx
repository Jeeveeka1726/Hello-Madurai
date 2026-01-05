'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { DocumentIcon, CloudArrowUpIcon, LinkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/hooks/useLanguage'

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
    if (!file.type.includes('pdf')) {
      toast.error(t('invalid_pdf', 'Please select a PDF file', 'PDF கோப்பைத் தேர்ந்தெடுக்கவும்'))
      return
    }

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(t('file_too_large', 'File too large. Maximum size is 500MB.', 'கோப்பு மிகப் பெரியது. அதிகபட்ச அளவு 500MB.'))
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/hostinger-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      onUpload(data.url)
      toast.success(t('upload_success', 'PDF uploaded successfully!', 'PDF வெற்றிகரமாக பதிவேற்றப்பட்டது!'))
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(t('upload_failed', 'Upload failed. Please try again.', 'பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.'))
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
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
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
      <Label className="text-sm font-medium">{label}</Label>
      
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
              {t('max_size_500mb', 'Maximum file size: 500MB', 'அதிகபட்ச கோப்பு அளவு: 500MB')}
            </p>
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
          <Input
            type="url"
            placeholder="https://drive.google.com/file/d/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
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
