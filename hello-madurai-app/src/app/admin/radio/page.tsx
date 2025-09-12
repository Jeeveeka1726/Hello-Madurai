'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FolderIcon, MicrophoneIcon, PlusIcon } from '@heroicons/react/24/outline'

interface RadioFolder {
  id: string
  name: string
  name_ta?: string
  description?: string
  description_ta?: string
  coverImage?: string
  featured: boolean
  radioShows: RadioShow[]
}

interface RadioShow {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  host: string
  duration: string
  audioUrl: string
  featured: boolean
  plays: number
  publishedAt: string
  folderId: string
}

export default function AdminRadioPage() {
  const { t } = useLanguage()
  const [radioFolders, setRadioFolders] = useState<RadioFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [showShowForm, setShowShowForm] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  
  const [folderFormData, setFolderFormData] = useState({
    name: '',
    name_ta: '',
    description: '',
    description_ta: '',
    coverImage: '',
    featured: false
  })
  
  const [showFormData, setShowFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    host: '',
    audioUrl: '',
    duration: '',
    folderId: '',
    featured: false
  })

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  useEffect(() => {
    fetchRadioData()
  }, [])

  const fetchRadioData = async () => {
    try {
      const response = await fetch('/api/radio/folders')
      if (response.ok) {
        const data = await response.json()
        setRadioFolders(data)
      }
    } catch (error) {
      console.error('Error fetching radio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/radio/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderFormData),
      })

      if (response.ok) {
        alert('Radio folder created successfully!')
        setFolderFormData({
          name: '',
          name_ta: '',
          description: '',
          description_ta: '',
          coverImage: '',
          featured: false
        })
        setShowFolderForm(false)
        fetchRadioData()
      } else {
        alert('Failed to create radio folder')
      }
    } catch (error) {
      console.error('Error creating radio folder:', error)
      alert('Error creating radio folder')
    }
  }

  const handleAudioFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('audio', file)

    const response = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload audio file')
    }

    const data = await response.json()
    return data.url
  }

  const handleShowSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that either file or URL is provided
    if (!audioFile && !showFormData.audioUrl.trim()) {
      alert('Please either upload an audio file or provide an audio URL')
      return
    }

    setUploadingAudio(true)

    try {
      let audioUrl = showFormData.audioUrl

      // If user uploaded a file, upload it first
      if (audioFile) {
        audioUrl = await handleAudioFileUpload(audioFile)
      }

      const response = await fetch('/api/radio/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...showFormData,
          audioUrl
        }),
      })

      if (response.ok) {
        alert('Radio show added successfully!')
        setShowFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          host: '',
          audioUrl: '',
          duration: '',
          folderId: '',
          featured: false
        })
        setAudioFile(null)
        setShowShowForm(false)
        fetchRadioData()
      } else {
        alert('Failed to add radio show')
      }
    } catch (error) {
      console.error('Error adding radio show:', error)
      alert('Error adding radio show')
    } finally {
      setUploadingAudio(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.radio.title', 'Radio Management', 'வானொலி மேலாண்மை')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('admin.radio.subtitle', 'Manage radio folders and shows', 'வானொலி கோப்புகள் மற்றும் நிகழ்ச்சிகளை நிர்வகிக்கவும்')}
          </p>
        </div>

        <div className="mb-6 flex space-x-4">
          <Button
            onClick={() => setShowFolderForm(!showFolderForm)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <FolderIcon className="h-4 w-4 mr-2" />
            {showFolderForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.radio.addFolder', 'Add Folder', 'கோப்பு சேர்க்கவும்')}
          </Button>
          
          <Button
            onClick={() => setShowShowForm(!showShowForm)}
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={radioFolders.length === 0}
          >
            <MicrophoneIcon className="h-4 w-4 mr-2" />
            {showShowForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.radio.addShow', 'Add Show', 'நிகழ்ச்சி சேர்க்கவும்')}
          </Button>
        </div>

        {/* Folder Form */}
        {showFolderForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.radio.addNewFolder', 'Add New Radio Folder', 'புதிய வானொலி கோப்பு சேர்க்கவும்')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFolderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.name', 'Name (English)', 'பெயர் (ஆங்கிலம்)')} *
                    </label>
                    <input
                      type="text"
                      value={folderFormData.name}
                      onChange={(e) => setFolderFormData({...folderFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.nameTa', 'Name (Tamil)', 'பெயர் (தமிழ்)')}
                    </label>
                    <input
                      type="text"
                      value={folderFormData.name_ta}
                      onChange={(e) => setFolderFormData({...folderFormData, name_ta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.radio.coverImage', 'Cover Image URL', 'அட்டைப்படம் URL')}
                  </label>
                  <input
                    type="url"
                    value={folderFormData.coverImage}
                    onChange={(e) => setFolderFormData({...folderFormData, coverImage: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.description', 'Description (English)', 'விளக்கம் (ஆங்கிலம்)')}
                    </label>
                    <textarea
                      value={folderFormData.description}
                      onChange={(e) => setFolderFormData({...folderFormData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.descriptionTa', 'Description (Tamil)', 'விளக்கம் (தமிழ்)')}
                    </label>
                    <textarea
                      value={folderFormData.description_ta}
                      onChange={(e) => setFolderFormData({...folderFormData, description_ta: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={folderFormData.featured}
                      onChange={(e) => setFolderFormData({...folderFormData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.featured', 'Featured Folder', 'சிறப்பு கோப்பு')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-purple-600 text-white hover:bg-purple-700">
                    {t('admin.save', 'Save Folder', 'கோப்பை சேமிக்கவும்')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowFolderForm(false)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {t('admin.cancel', 'Cancel', 'ரத்து')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Show Form */}
        {showShowForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.radio.addNewShow', 'Add New Radio Show', 'புதிய வானொலி நிகழ்ச்சி சேர்க்கவும்')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShowSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.radio.selectFolder', 'Select Folder', 'கோப்பை தேர்ந்தெடுக்கவும்')} *
                  </label>
                  <select
                    value={showFormData.folderId}
                    onChange={(e) => setShowFormData({...showFormData, folderId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a folder...</option>
                    {radioFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name} {folder.name_ta && `(${folder.name_ta})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.title', 'Title (English)', 'தலைப்பு (ஆங்கிலம்)')} *
                    </label>
                    <input
                      type="text"
                      value={showFormData.title}
                      onChange={(e) => setShowFormData({...showFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.titleTa', 'Title (Tamil)', 'தலைப்பு (தமிழ்)')}
                    </label>
                    <input
                      type="text"
                      value={showFormData.title_ta}
                      onChange={(e) => setShowFormData({...showFormData, title_ta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.radio.host', 'Host', 'தொகுப்பாளர்')} *
                    </label>
                    <input
                      type="text"
                      value={showFormData.host}
                      onChange={(e) => setShowFormData({...showFormData, host: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.radio.duration', 'Duration', 'கால அளவு')} *
                    </label>
                    <input
                      type="text"
                      value={showFormData.duration}
                      onChange={(e) => setShowFormData({...showFormData, duration: e.target.value})}
                      placeholder="45:30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.radio.audio', 'Audio', 'ஆடியோ')} *
                  </label>
                  <div className="space-y-3">
                    {/* File Upload Option */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Upload Audio File (MP3, WAV, etc.)
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setAudioFile(file)
                            setShowFormData({...showFormData, audioUrl: ''}) // Clear URL when file is selected
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {audioFile && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Selected: {audioFile.name}
                        </p>
                      )}
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                      <span className="px-3 text-sm text-gray-500 dark:text-gray-400">OR</span>
                      <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    {/* URL Option */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Audio URL
                      </label>
                      <input
                        type="url"
                        value={showFormData.audioUrl}
                        onChange={(e) => {
                          setShowFormData({...showFormData, audioUrl: e.target.value})
                          if (e.target.value) {
                            setAudioFile(null) // Clear file when URL is entered
                          }
                        }}
                        placeholder="https://example.com/audio.mp3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={!!audioFile}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.description', 'Description (English)', 'விளக்கம் (ஆங்கிலம்)')} *
                    </label>
                    <textarea
                      value={showFormData.description}
                      onChange={(e) => setShowFormData({...showFormData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.descriptionTa', 'Description (Tamil)', 'விளக்கம் (தமிழ்)')}
                    </label>
                    <textarea
                      value={showFormData.description_ta}
                      onChange={(e) => setShowFormData({...showFormData, description_ta: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showFormData.featured}
                      onChange={(e) => setShowFormData({...showFormData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.featured', 'Featured Show', 'சிறப்பு நிகழ்ச்சி')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-green-600 text-white hover:bg-green-700"
                    disabled={uploadingAudio}
                  >
                    {uploadingAudio ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {audioFile ? 'Uploading Audio...' : 'Saving...'}
                      </>
                    ) : (
                      t('admin.save', 'Save Show', 'நிகழ்ச்சியை சேமிக்கவும்')
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowShowForm(false)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {t('admin.cancel', 'Cancel', 'ரத்து')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Radio Folders Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading radio data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {radioFolders.map((folder) => (
              <Card key={folder.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center">
                    <FolderIcon className="h-5 w-5 mr-2 text-purple-600" />
                    {folder.name}
                    {folder.name_ta && <span className="ml-2 text-gray-600 dark:text-gray-400">({folder.name_ta})</span>}
                    {folder.featured && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {folder.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{folder.description}</p>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {folder.radioShows.map((show) => (
                      <div key={show.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{show.title}</h4>
                        {show.title_ta && (
                          <h5 className="text-sm text-gray-600 dark:text-gray-400 mb-2">{show.title_ta}</h5>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Host: {show.host}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Duration: {show.duration}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">{show.description}</p>
                        {show.featured && (
                          <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Featured
                          </span>
                        )}
                        <div className="mt-2">
                          <audio controls className="w-full">
                            <source src={show.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                    ))}
                  </div>
                  {folder.radioShows.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No radio shows in this folder yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && radioFolders.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No radio folders found. Create your first folder to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
