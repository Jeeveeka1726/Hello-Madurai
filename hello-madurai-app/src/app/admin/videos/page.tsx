'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import TranslateField from '@/components/admin/TranslateField'
import TranslatedText from '@/components/TranslatedText'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, VideoCameraIcon, PlayIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Video {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  videoUrl: string
  youtubeId?: string
  thumbnail?: string
  category: string
  duration?: string
  views: number
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export default function AdminVideosPage() {
  const { language } = useLanguage()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    videoUrl: '',
    thumbnail: '',
    category: 'business',
    duration: '',
    featured: false
  })

  const videoCategories = [
    { value: 'business', label: 'Business' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'education', label: 'Education' },
    { value: 'culture', label: 'Culture' },
    { value: 'tourism', label: 'Tourism' },
    { value: 'technology', label: 'Technology' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'news', label: 'News' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      } else {
        toast.error('Failed to fetch videos')
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast.error('Error fetching videos')
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Extract YouTube ID if it's a YouTube URL
      const youtubeId = extractYouTubeId(formData.videoUrl)
      
      const response = await fetch('/api/admin/videos', {
        method: editingVideo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          youtubeId,
          ...(editingVideo && { id: editingVideo.id })
        }),
      })

      if (response.ok) {
        await fetchVideos()
        setShowForm(false)
        setEditingVideo(null)
        setFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          videoUrl: '',
          thumbnail: '',
          category: 'business',
          duration: '',
          featured: false
        })
        toast.success(editingVideo ? 'Video updated successfully!' : 'Video created successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error saving video')
      }
    } catch (error) {
      console.error('Error saving video:', error)
      toast.error('Error saving video')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      title_ta: video.title_ta || '',
      description: video.description,
      description_ta: video.description_ta || '',
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail || '',
      category: video.category,
      duration: video.duration || '',
      featured: video.featured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchVideos()
        toast.success('Video deleted successfully!')
      } else {
        toast.error('Error deleting video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Error deleting video')
    }
  }

  const getVideoThumbnail = (video: Video) => {
    if (video.thumbnail) return video.thumbnail
    if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
    return null
  }

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading videos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              <TranslatedText>Video Management</TranslatedText>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              <TranslatedText>Create, edit, and manage video content</TranslatedText>
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingVideo(null)
              setFormData({
                title: '',
                title_ta: '',
                description: '',
                description_ta: '',
                videoUrl: '',
                thumbnail: '',
                category: 'business',
                duration: '',
                featured: false
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <TranslatedText>Add Video</TranslatedText>
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-purple-900">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  <TranslatedText>{editingVideo ? 'Edit Video' : 'Add Video'}</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <TranslateField
                    label="Title"
                    englishValue={formData.title}
                    tamilValue={formData.title_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, title: value })}
                    onTamilChange={(value) => setFormData({ ...formData, title_ta: value })}
                    required={true}
                    placeholder={{
                      english: "Enter video title in English",
                      tamil: "வீடியோ தலைப்பை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  <TranslateField
                    label="Description"
                    englishValue={formData.description}
                    tamilValue={formData.description_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, description: value })}
                    onTamilChange={(value) => setFormData({ ...formData, description_ta: value })}
                    type="textarea"
                    required={true}
                    placeholder={{
                      english: "Enter video description in English",
                      tamil: "வீடியோ விளக்கத்தை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  {/* Video Upload/URL */}
                  <FileUpload
                    label="Video File or URL"
                    fileType="video"
                    currentFile={formData.videoUrl}
                    onFileUpload={(url) => setFormData({ ...formData, videoUrl: url })}
                    onUrlChange={(url) => setFormData({ ...formData, videoUrl: url })}
                    className="mb-6"
                  />

                  {/* Thumbnail Upload */}
                  <FileUpload
                    label="Thumbnail Image"
                    fileType="image"
                    currentFile={formData.thumbnail}
                    onFileUpload={(url) => setFormData({ ...formData, thumbnail: url })}
                    onUrlChange={(url) => setFormData({ ...formData, thumbnail: url })}
                    className="mb-6"
                  />

                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      >
                        {videoCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="e.g., 5:30"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          <TranslatedText>Featured Video</TranslatedText>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      <TranslatedText>Cancel</TranslatedText>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.title || !formData.description || !formData.videoUrl}
                    >
                      {loading ? 'Saving...' : <TranslatedText>{editingVideo ? 'Update Video' : 'Create Video'}</TranslatedText>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} hover className="h-full">
              <CardContent>
                <div className="relative mb-4">
                  {getVideoThumbnail(video) ? (
                    <div className="relative">
                      <img
                        src={getVideoThumbnail(video)!}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                        <PlayIcon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {language === 'ta' && video.title_ta ? video.title_ta : video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {language === 'ta' && video.description_ta ? video.description_ta : video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{video.category}</span>
                    <div className="flex items-center space-x-2">
                      {video.duration && <span>{video.duration}</span>}
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {video.views || 0}
                      </div>
                    </div>
                  </div>
                  {video.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <TranslatedText>Featured</TranslatedText>
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(video)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(video.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(video.videoUrl, '_blank')}
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    <TranslatedText>Watch</TranslatedText>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length === 0 && !loading && (
          <div className="text-center py-12">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              <TranslatedText>No videos</TranslatedText>
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <TranslatedText>Get started by adding a new video.</TranslatedText>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}