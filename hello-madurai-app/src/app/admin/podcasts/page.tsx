'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import TranslateField from '@/components/admin/TranslateField'
import TranslatedText from '@/components/TranslatedText'
import { PlusIcon, PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Podcast {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  audioUrl: string
  duration: string
  category: string
  publishedAt: string
  plays: number
  featured: boolean
}

export default function AdminPodcastsPage() {
  const { t } = useLanguage()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    audioUrl: '',
    duration: '',
    category: 'talk',
    featured: false
  })

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/api/admin/podcasts')
      if (response.ok) {
        const data = await response.json()
        setPodcasts(data)
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/podcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Podcast added successfully!')
        setFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          audioUrl: '',
          duration: '',
          category: 'talk',
          featured: false
        })
        setShowForm(false)
        fetchPodcasts()
      } else {
        alert('Failed to add podcast')
      }
    } catch (error) {
      console.error('Error adding podcast:', error)
      alert('Error adding podcast')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.podcasts.title', 'Podcast Management', 'பாட்காஸ்ட் மேலாண்மை')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('admin.podcasts.subtitle', 'Manage audio content and radio shows', 'ஆடியோ உள்ளடக்கம் மற்றும் வானொலி நிகழ்ச்சிகளை நிர்வகிக்கவும்')}
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {showForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.podcasts.add', 'Add Podcast', 'பாட்காஸ்ட் சேர்க்கவும்')}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.podcasts.addNew', 'Add New Podcast', 'புதிய பாட்காஸ்ட் சேர்க்கவும்')}
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md bg-white dark:bg-purple-800 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md bg-white dark:bg-purple-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.podcasts.audioUrl', 'Audio URL', 'ஆடியோ URL')}
                  </label>
                  <input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md bg-white dark:bg-purple-800 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md bg-white dark:bg-purple-800 text-gray-900 dark:text-white"
                    >
                      <option value="talk">Talk Show</option>
                      <option value="music">Music</option>
                      <option value="news">News</option>
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.podcasts.duration', 'Duration', 'கால அளவு')}
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="45:30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md bg-white dark:bg-purple-800 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <TranslateField
                  label="Description"
                  englishValue={formData.description}
                  tamilValue={formData.description_ta}
                  onEnglishChange={(value) => setFormData({...formData, description: value})}
                  onTamilChange={(value) => setFormData({...formData, description_ta: value})}
                  type="textarea"
                  required={true}
                  placeholder={{
                    english: "Podcast description in English",
                    tamil: "Podcast description in Tamil"
                  }}
                />

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.featured', 'Featured Podcast', 'சிறப்பு பாட்காஸ்ட்')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {t('admin.save', 'Save Podcast', 'பாட்காஸ்டை சேமிக்கவும்')}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading podcasts...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((podcast) => (
              <Card key={podcast.id} className="bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {podcast.title}
                  </h3>
                  {podcast.title_ta && (
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {podcast.title_ta}
                    </h4>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {podcast.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Duration: {podcast.duration}</span>
                    <span>Plays: {podcast.plays}</span>
                  </div>
                  {podcast.featured && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={podcast.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && podcasts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No podcasts found. Add your first podcast!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
