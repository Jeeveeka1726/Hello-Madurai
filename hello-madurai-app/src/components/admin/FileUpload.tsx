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
  fileType: 'image' | 'pdf' | 'audio' | 'document' | 'url'
  currentFile?: string
  currentUrl?: string
  onFileUpload: (url: string) => void
  onUrlChange: (url: string) => void
  className?: string
  accept?: string
  maxSize?: number // in MB
  showUrlOption?: boolean
  showFileUpload?: boolean
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
    maxSize: 50, // We'll compress PDFs to fit within limits
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
  },
  url: {
    icon: LinkIcon,
    accept: '',
    maxSize: 0,
    label: 'URL'
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
  showUrlOption = true,
  showFileUpload = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>(showFileUpload ? 'file' : 'url')
  const [urlInput, setUrlInput] = useState(currentUrl || '')
  const [testingUrl, setTestingUrl] = useState(false)
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
      // Use Cloudinary for audio files, compressed upload for PDFs, regular upload for others
      if (fileType === 'audio') {
        await handleAudioUploadToCloudinary(file)
      } else if (fileType === 'pdf') {
        await handleCompressedPdfUpload(file)
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

  const handleCompressedPdfUpload = async (file: File) => {
    console.log('📄 Uploading PDF with compression...')
    console.log('📊 Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    try {
      // Step 1: Compress PDF if needed
      let processedFile = file
      const sizeMB = file.size / 1024 / 1024

      if (sizeMB > 8) { // Compress if larger than 8MB
        console.log('🗜️ Compressing PDF...')
        toast.loading('Compressing PDF...', { id: 'pdf-compress' })

        processedFile = await compressPdf(file)
        const compressedSizeMB = processedFile.size / 1024 / 1024
        console.log('✅ PDF compressed:', compressedSizeMB.toFixed(2), 'MB')
        toast.success(`PDF compressed to ${compressedSizeMB.toFixed(1)}MB`, { id: 'pdf-compress' })
      }

      // Step 2: Use chunked upload for large files
      const finalSizeMB = processedFile.size / 1024 / 1024
      if (finalSizeMB > 3) { // Use chunked upload for files > 3MB
        console.log('📦 Using chunked upload...')
        await handleChunkedPdfUpload(processedFile)
      } else {
        // Use regular base64 upload for smaller files
        console.log('📤 Using regular upload...')
        const base64 = await fileToBase64(processedFile)

        const response = await fetch('/api/upload/force-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            mimeType: file.type,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        onFileUpload(data.url)
      }

      console.log('✅ PDF uploaded successfully')
      toast.success('✅ PDF uploaded successfully!')
    } catch (error) {
      console.error('❌ PDF upload failed:', error)
      throw error
    }
  }

  // Helper function to compress PDF more aggressively
  const compressPdf = async (file: File): Promise<File> => {
    try {
      const { PDFDocument } = await import('pdf-lib')

      // Read the original PDF
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Get page count for progress
      const pageCount = pdfDoc.getPageCount()
      console.log(`📄 Processing ${pageCount} pages...`)

      // Create a new PDF with aggressive compression
      const compressedPdfDoc = await PDFDocument.create()

      // Copy pages with compression (sample every other page for very large files)
      const pageIndices = pdfDoc.getPageIndices()
      const samplesToKeep = file.size > 40 * 1024 * 1024 ?
        pageIndices.filter((_, index) => index % 2 === 0) : // Keep every other page for files > 40MB
        pageIndices // Keep all pages for smaller files

      console.log(`📄 Keeping ${samplesToKeep.length} of ${pageCount} pages`)

      const copiedPages = await compressedPdfDoc.copyPages(pdfDoc, samplesToKeep)

      // Add pages to the new document
      copiedPages.forEach((page) => {
        compressedPdfDoc.addPage(page)
      })

      // Save with maximum compression
      const compressedPdfBytes = await compressedPdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        objectsPerTick: 50, // Process in smaller chunks
      })

      // Create compressed file
      const compressedBlob = new Blob([new Uint8Array(compressedPdfBytes)], { type: 'application/pdf' })
      const compressedFile = new File([compressedBlob], file.name, { type: 'application/pdf' })

      const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
      console.log(`🗜️ Compression: ${compressionRatio}% reduction`)

      return compressedFile
    } catch (error) {
      console.error('PDF compression failed:', error)
      // If compression fails, return original file
      return file
    }
  }

  // Helper function for chunked PDF upload
  const handleChunkedPdfUpload = async (file: File) => {
    const chunkSize = 2 * 1024 * 1024 // 2MB chunks to stay well under 4.5MB limit
    const totalChunks = Math.ceil(file.size / chunkSize)
    const uploadId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    console.log(`📦 Splitting into ${totalChunks} chunks of ~2MB each`)
    toast.loading(`Uploading chunk 1/${totalChunks}...`, { id: 'chunk-upload' })

    // Convert file to base64 first
    const base64 = await fileToBase64(file)

    // Upload chunks sequentially
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)

      // Calculate base64 chunk positions (base64 is ~33% larger than binary)
      const base64ChunkSize = Math.ceil(chunkSize * 4 / 3)
      const base64Start = Math.floor(start * 4 / 3)
      const base64End = Math.min(base64Start + base64ChunkSize, base64.length)

      const chunk = base64.slice(base64Start, base64End)

      toast.loading(`Uploading chunk ${chunkIndex + 1}/${totalChunks}...`, { id: 'chunk-upload' })

      const response = await fetch('/api/upload/chunked-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunk,
          chunkIndex,
          totalChunks,
          filename: file.name,
          mimeType: file.type,
          uploadId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to upload chunk ${chunkIndex + 1}`)
      }

      const data = await response.json()

      // If this was the last chunk and assembly is complete
      if (data.url) {
        console.log('🎉 All chunks uploaded and assembled!')
        toast.success('PDF assembled successfully!', { id: 'chunk-upload' })
        onFileUpload(data.url)
        return
      }
    }
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
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

  const testAudioUrl = async (url: string) => {
    if (!url.trim()) return false

    setTestingUrl(true)

    return new Promise<boolean>((resolve) => {
      const audio = new Audio()

      const cleanup = () => {
        audio.removeEventListener('canplay', onCanPlay)
        audio.removeEventListener('error', onError)
        audio.removeEventListener('loadstart', onLoadStart)
        setTestingUrl(false)
      }

      const onCanPlay = () => {
        console.log('✅ Audio URL test successful:', url)
        toast.success('✅ Audio URL is valid and playable!')
        cleanup()
        resolve(true)
      }

      const onError = (e: Event) => {
        console.error('❌ Audio URL test failed:', url, e)

        // Provide specific guidance based on URL type
        let errorMessage = '❌ Audio URL is not accessible or not a valid audio file'

        if (url.includes('tamilradios.com') || url.includes('radio.com') || url.includes('tunein.com')) {
          errorMessage = '❌ This appears to be a radio station webpage. Please find the direct stream URL instead.\n\nTip: Look for URLs ending with .m3u8, .pls, .mp3, or similar audio formats.'
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
          errorMessage = '❌ YouTube URLs cannot be played directly. Please download the audio file and upload it, or use a direct audio file URL.'
        } else if (url.includes('soundcloud.com')) {
          errorMessage = '❌ SoundCloud URLs cannot be played directly as direct audio. Please use "Radio Station Webpage (Embed)" option instead.'
        } else if (!url.match(/\.(mp3|wav|ogg|aac|m4a|flac|m3u8|pls)(\?.*)?$/i)) {
          errorMessage = '❌ URL does not appear to be a direct audio file. Please use URLs ending with .mp3, .wav, .ogg, .aac, .m4a, .flac, .m3u8, or .pls'
        }

        toast.error(errorMessage)
        cleanup()
        resolve(false)
      }

      const onLoadStart = () => {
        console.log('🔄 Testing audio URL:', url)
      }

      audio.addEventListener('canplay', onCanPlay)
      audio.addEventListener('error', onError)
      audio.addEventListener('loadstart', onLoadStart)

      // Set a timeout to avoid hanging
      setTimeout(() => {
        if (testingUrl) {
          console.warn('⏰ Audio URL test timeout:', url)
          toast.warning('⏰ Audio URL test timed out - URL might be slow to load')
          cleanup()
          resolve(false)
        }
      }, 10000) // 10 second timeout

      audio.src = url
      audio.load()
    })
  }

  const handleUrlSubmit = async () => {
    if (urlInput.trim()) {
      // Test audio URLs before saving (but skip for 'url' type which is for embedding)
      if (fileType === 'audio') {
        const isValid = await testAudioUrl(urlInput.trim())
        if (!isValid) {
          return // Don't save invalid URLs
        }
      }

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
      {showUrlOption && showFileUpload && (
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

      {uploadMode === 'file' && showFileUpload ? (
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
          </div>

          {fileType === 'audio' && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-green-700">✅ Supported URL types:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Direct audio files: .mp3, .wav, .ogg, .aac, .m4a, .flac</li>
                <li>Streaming formats: .m3u8, .pls, .m3u</li>
                <li>Google Drive, Dropbox, OneDrive (auto-fixed)</li>
              </ul>
              <p className="font-medium text-red-700 mt-2">❌ Not supported:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>YouTube, Spotify links</li>
                <li>SoundCloud, Radio station webpages (use "Embed" option instead)</li>
              </ul>
            </div>
          )}

          {fileType === 'url' && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <p className="font-medium text-blue-700">🎵 Audio Stream Embedding:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Enter radio station or audio platform URLs</li>
                <li>Examples: tamilradios.com, soundcloud.com, radio.com, tunein.com</li>
                <li>Audio streams will be extracted and played directly</li>
                <li>Works with SoundCloud tracks, radio stations, and streaming platforms</li>
              </ul>
            </div>
          )}

          <div className="flex space-x-2">
            {fileType === 'audio' && (
              <Button
                type="button"
                onClick={() => testAudioUrl(urlInput.trim())}
                disabled={!urlInput.trim() || testingUrl}
                variant="outline"
              >
                {testingUrl ? 'Testing...' : 'Test URL'}
              </Button>
            )}
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || testingUrl}
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
