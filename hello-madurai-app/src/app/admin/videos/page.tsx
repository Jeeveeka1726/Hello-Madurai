'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

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
}

export default function AdminVideosPage() {
  const { t } = useLanguage()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    videoUrl: '',
    category: 'business',
    duration: '',
    featured: false
  })

  // Fetch videos
  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Video added successfully!')
        setFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          videoUrl: '',
          category: 'business',
          duration: '',
          featured: false
        })
        setShowForm(false)
        fetchVideos()
      } else {
        alert('Failed to add video')
      }
    } catch (error) {
      console.error('Error adding video:', error)
      alert('Error adding video')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.videos.title', 'Video Management', 'வீடியோ மேலாண்மை')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('admin.videos.subtitle', 'Manage YouTube videos and local content', 'YouTube வீடியோக்கள் மற்றும் உள்ளூர் உள்ளடக்கத்தை நிர்வகிக்கவும்')}
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            {showForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.videos.add', 'Add Video', 'வீடியோ சேர்க்கவும்')}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.videos.addNew', 'Add New Video', 'புதிய வீடியோ சேர்க்கவும்')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.title', 'Title (English)', 'தலைப்பு (ஆங்கிலம்)')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                      value={formData.title_ta}
                      onChange={(e) => setFormData({...formData, title_ta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.videos.url', 'YouTube URL', 'YouTube URL')}
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.category', 'Category', 'வகை')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="business">Business</option>
                      <option value="culture">Culture</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="medical">Medical</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.videos.duration', 'Duration', 'கால அளவு')}
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="12:34"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.description', 'Description (English)', 'விளக்கம் (ஆங்கிலம்)')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                      value={formData.description_ta}
                      onChange={(e) => setFormData({...formData, description_ta: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.featured', 'Featured Video', 'சிறப்பு வீடியோ')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-primary-600 text-white hover:bg-primary-700"
                  >
                    {t('admin.save', 'Save Video', 'வீடியோவை சேமிக்கவும்')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {t('admin.cancel', 'Cancel', 'ரத்து')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading videos...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h3>
                  {video.title_ta && (
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {video.title_ta}
                    </h4>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Category: {video.category}</span>
                    <span>Views: {video.views}</span>
                  </div>
                  {video.featured && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="mt-4">
                    <a 
                      href={video.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View on YouTube →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No videos found. Add your first video!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
