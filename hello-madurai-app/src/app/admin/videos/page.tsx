'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AdminSearchBox from '@/components/admin/AdminSearchBox'

interface Video {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  videoType: string // "upload", "youtube", or "drive"
  thumbnailUrl?: string
  category: string
  orderNumber: number
  duration?: string
  views: number
  likes: number
  dislikes: number
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

// Video categories
const videoCategories = [
  { id: 'agri', name: 'Agri', name_ta: 'விவசாயம்' },
  { id: 'art', name: 'Art', name_ta: 'கலை' },
  { id: 'business', name: 'Business', name_ta: 'வணிகம்' },
  { id: 'cinema', name: 'Cinema', name_ta: 'சினிமா' },
  { id: 'education', name: 'Education', name_ta: 'கல்வி' },
  { id: 'food', name: 'Food', name_ta: 'உணவு' },
  { id: 'game', name: 'Game', name_ta: 'விளையாட்டு' },
  { id: 'heritage', name: 'Heritage', name_ta: 'பாரம்பரியம்' },
  { id: 'temple', name: 'Temple', name_ta: 'கோவில்' },
  { id: 'tourism', name: 'Tourism', name_ta: 'சுற்றுலா' },
  { id: 'pets', name: 'Pets', name_ta: 'செல்லப்பிராணிகள்' },
  { id: 'jallikattu', name: 'Jallikattu', name_ta: 'ஜல்லிக்கட்டு' },
  { id: 'medical', name: 'Medical', name_ta: 'மருத்துவம்' },
  { id: 'fitness', name: 'Fitness', name_ta: 'உடற்பயிற்சி' },
  { id: 'motors', name: 'Motors', name_ta: 'வாகனங்கள்' },
  { id: 'music', name: 'Music', name_ta: 'இசை' },
  { id: 'social', name: 'Social', name_ta: 'சமூகம்' }
]

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [thumbnailType, setThumbnailType] = useState<'url' | 'drive'>('url')
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    videoUrl: '',
    videoType: 'youtube', // 'youtube' or 'drive'
    thumbnailUrl: '',
    category: 'agri',
    duration: '',
    featured: false
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
        setFilteredVideos(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredVideos(videos)
      return
    }

    const filtered = videos.filter(video => {
      const searchFields = [
        video.title,
        video.title_ta,
        video.category,
        video.videoType
      ].filter(Boolean).join(' ').toLowerCase()

      return searchFields.includes(query.toLowerCase())
    })

    setFilteredVideos(filtered)
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingVideo
        ? `/api/admin/videos/${editingVideo.id}`
        : '/api/admin/videos'

      const method = editingVideo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingVideo ? 'Video updated successfully!' : 'Video created successfully!')
        setShowForm(false)
        setEditingVideo(null)
        setThumbnailType('url')
        setFormData({
          title: '',
          title_ta: '',
          videoUrl: '',
          videoType: 'youtube',
          thumbnailUrl: '',
          category: 'agri',
          duration: '',
          featured: false
        })
        fetchVideos()
      } else {
        alert('Failed to save video')
      }
    } catch (error) {
      console.error('Error saving video:', error)
      alert('Error saving video')
    }
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    // Detect thumbnail type
    const thumbUrl = video.thumbnailUrl || ''
    const isThumbDrive = thumbUrl.includes('drive.google.com')
    setThumbnailType(isThumbDrive ? 'drive' : 'url')
    setFormData({
      title: video.title,
      title_ta: video.title_ta || '',
      videoUrl: video.videoUrl,
      videoType: video.videoType || 'youtube',
      thumbnailUrl: thumbUrl,
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
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Video deleted successfully!')
        fetchVideos()
      } else {
        alert('Failed to delete video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Error deleting video')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Manage Videos</h1>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingVideo(null)
              setThumbnailType('url')
              setFormData({
                title: '',
                title_ta: '',
                videoUrl: '',
                videoType: 'youtube',
                thumbnailUrl: '',
                category: 'agri',
                duration: '',
                featured: false
              })
            }}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Video
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title (Tamil)
                    </label>
                    <input
                      type="text"
                      value={formData.title_ta}
                      onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Video Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Source *
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="youtube"
                        checked={formData.videoType === 'youtube'}
                        onChange={(e) => setFormData({ ...formData, videoType: e.target.value, videoUrl: '' })}
                        className="mr-2"
                      />
                      YouTube URL
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="drive"
                        checked={formData.videoType === 'drive'}
                        onChange={(e) => setFormData({ ...formData, videoType: e.target.value, videoUrl: '' })}
                        className="mr-2"
                      />
                      Google Drive URL
                    </label>
                  </div>
                </div>

                {/* Video URL Input */}
                {formData.videoType === 'youtube' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Supports youtube.com/watch, youtu.be, and youtube.com/shorts links</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Drive Share URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Open the file in Google Drive → Share → Copy link. Make sure sharing is set to <strong>Anyone with the link</strong>.
                    </p>
                  </div>
                )}

                {/* Thumbnail (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image (Optional)
                  </label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        value="url"
                        checked={thumbnailType === 'url'}
                        onChange={() => { setThumbnailType('url'); setFormData({ ...formData, thumbnailUrl: '' }) }}
                        className="mr-2"
                      />
                      Image URL
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        value="drive"
                        checked={thumbnailType === 'drive'}
                        onChange={() => { setThumbnailType('drive'); setFormData({ ...formData, thumbnailUrl: '' }) }}
                        className="mr-2"
                      />
                      Google Drive Image URL
                    </label>
                  </div>
                  {thumbnailType === 'url' ? (
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.videoType === 'youtube'
                      ? "Leave empty to use YouTube's auto-generated thumbnail"
                      : 'Provide a thumbnail image URL or a Google Drive image link'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {videoCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} / {cat.name_ta}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 5:30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Video
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingVideo(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                    {editingVideo ? 'Update Video' : 'Create Video'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search Box */}
        <div className="mb-6">
          <AdminSearchBox
            placeholder="Search videos by title, category, or type..."
            placeholderTa="தலைப்பு, வகை அல்லது வகை மூலம் வீடியோக்களைத் தேடுங்கள்..."
            onSearch={handleSearch}
            className="max-w-md"
          />
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredVideos.length} videos for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Videos List */}
        <Card>
          <CardHeader>
            <CardTitle>All Videos ({filteredVideos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading videos...</p>
            ) : videos.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No videos yet. Create your first video!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVideos.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          {searchQuery
                            ? 'No videos found matching your search'
                            : 'No videos found. Add your first video!'
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredVideos.map((video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{video.title}</div>
                          {video.title_ta && (
                            <div className="text-sm text-gray-500">{video.title_ta}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            video.videoType === 'youtube' ? 'bg-red-100 text-red-800' :
                            video.videoType === 'drive' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {video.videoType === 'youtube' ? 'YouTube' : video.videoType === 'drive' ? 'Drive' : 'Upload'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {videoCategories.find(c => c.id === video.category)?.name || video.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {video.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {video.featured && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(video)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

