'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Magazine {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  pdfUrl: string
  coverImage?: string
  issueNumber: string
  publishedAt: string
  downloads: number
  featured: boolean
}

export default function AdminMagazinesPage() {
  const { t } = useLanguage()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    pdfUrl: '',
    coverImage: '',
    issueNumber: '',
    featured: false
  })

  // Fetch magazines
  useEffect(() => {
    fetchMagazines()
  }, [])

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/admin/magazines')
      if (response.ok) {
        const data = await response.json()
        setMagazines(data)
      }
    } catch (error) {
      console.error('Error fetching magazines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/magazines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Magazine added successfully!')
        setFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          pdfUrl: '',
          coverImage: '',
          issueNumber: '',
          featured: false
        })
        setShowForm(false)
        fetchMagazines()
      } else {
        alert('Failed to add magazine')
      }
    } catch (error) {
      console.error('Error adding magazine:', error)
      alert('Error adding magazine')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.magazines.title', 'Magazine Management', 'பத்திரிகை மேலாண்மை')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('admin.magazines.subtitle', 'Manage digital magazines and publications', 'டிஜிட்டல் பத்திரிகைகள் மற்றும் வெளியீடுகளை நிர்வகிக்கவும்')}
          </p>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            {showForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.magazines.add', 'Add Magazine', 'பத்திரிகை சேர்க்கவும்')}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.magazines.addNew', 'Add New Magazine', 'புதிய பத்திரிகை சேர்க்கவும்')}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.magazines.pdfUrl', 'PDF URL', 'PDF URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.pdfUrl}
                      onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})}
                      placeholder="https://example.com/magazine.pdf"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.magazines.coverImage', 'Cover Image URL', 'அட்டைப்படம் URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                      placeholder="https://example.com/cover.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.magazines.issueNumber', 'Issue Number', 'இதழ் எண்')}
                  </label>
                  <input
                    type="text"
                    value={formData.issueNumber}
                    onChange={(e) => setFormData({...formData, issueNumber: e.target.value})}
                    placeholder="Vol 1, Issue 1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
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
                      {t('admin.featured', 'Featured Magazine', 'சிறப்பு பத்திரிகை')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="bg-primary-600 text-white hover:bg-primary-700"
                  >
                    {t('admin.save', 'Save Magazine', 'பத்திரிகையை சேமிக்கவும்')}
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
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading magazines...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {magazines.map((magazine) => (
              <Card key={magazine.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  {magazine.coverImage && (
                    <img 
                      src={magazine.coverImage} 
                      alt={magazine.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {magazine.title}
                  </h3>
                  {magazine.title_ta && (
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {magazine.title_ta}
                    </h4>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {magazine.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Issue: {magazine.issueNumber}</span>
                    <span>Downloads: {magazine.downloads}</span>
                  </div>
                  {magazine.featured && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Featured
                      </span>
                    </div>
                  )}
                  <div>
                    <a 
                      href={magazine.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Download PDF →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && magazines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No magazines found. Add your first magazine!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
