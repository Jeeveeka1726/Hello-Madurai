'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Ad {
  id: string
  title: string
  title_ta?: string
  imageUrl?: string
  htmlCode?: string
  link?: string
  active: boolean
  position: number
  category?: string
  impressions: number
  clicks: number
  createdAt: string
}

export default function AdminAdsPage() {
  const { language } = useLanguage()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    imageUrl: '',
    htmlCode: '',
    link: '',
    active: true,
    position: 0,
    category: 'news'
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/admin/ads')
      if (response.ok) {
        const data = await response.json()
        setAds(data)
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, imageUrl: data.url })
        toast.success('✅ Image uploaded!')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads'
      const method = editingAd ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAds()
        setShowForm(false)
        setEditingAd(null)
        setFormData({
          title: '',
          title_ta: '',
          imageUrl: '',
          htmlCode: '',
          link: '',
          active: true,
          position: 0,
          category: 'news'
        })
        toast.success(editingAd ? 'Ad updated!' : 'Ad created!')
      } else {
        toast.error('Error saving ad')
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      toast.error('Error saving ad')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      title_ta: ad.title_ta || '',
      imageUrl: ad.imageUrl || '',
      htmlCode: ad.htmlCode || '',
      link: ad.link || '',
      active: ad.active,
      position: ad.position,
      category: ad.category || 'news'
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த விளம்பரத்தை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this ad?')) return

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAds()
        toast.success('Ad deleted!')
      } else {
        toast.error('Error deleting ad')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast.error('Error deleting ad')
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !active }),
      })

      if (response.ok) {
        await fetchAds()
        toast.success(active ? 'Ad deactivated' : 'Ad activated')
      }
    } catch (error) {
      console.error('Error toggling ad:', error)
    }
  }

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'ta' ? 'விளம்பர மேலாண்மை' : 'Ads Management'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {language === 'ta' 
                ? 'செய்தி கட்டுரைகளில் தானாக காண்பிக்க விளம்பரங்களை நிர்வகிக்கவும்'
                : 'Manage ads that appear automatically in news articles'}
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingAd(null)
              setFormData({
                title: '',
                title_ta: '',
                imageUrl: '',
                htmlCode: '',
                link: '',
                active: true,
                position: 0,
                category: 'news'
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {language === 'ta' ? 'விளம்பரம் சேர்க்க' : 'Add Ad'}
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-blue-900">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  {editingAd ? (language === 'ta' ? 'விளம்பரத்தை திருத்து' : 'Edit Ad') : (language === 'ta' ? 'புதிய விளம்பரம்' : 'New Ad')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ta' ? 'தலைப்பு' : 'Title'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={language === 'ta' ? 'விளம்பர தலைப்பு' : 'Ad title'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-white"
                    />
                  </div>

                  {/* Image Upload or HTML Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Option */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <PhotoIcon className="h-4 w-4 inline mr-1" />
                        {language === 'ta' ? 'படம் பதிவேற்றம்' : 'Image Upload'}
                      </label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file)
                          }}
                          disabled={uploading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md text-sm dark:bg-blue-800 dark:text-white"
                        />
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          ✅ {language === 'ta' 
                            ? 'படங்கள் தானாக 1280×720 px அளவுக்கு மாற்றப்படும்' 
                            : 'Images will be auto-resized to 1280×720 px'}
                        </p>
                        {formData.imageUrl && (
                          <img
                            src={formData.imageUrl}
                            alt="Ad preview"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}
                      </div>
                    </div>

                    {/* HTML Code Option */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CodeBracketIcon className="h-4 w-4 inline mr-1" />
                        {language === 'ta' ? 'HTML குறியீடு (AdSense)' : 'HTML Code (AdSense)'}
                      </label>
                      <textarea
                        value={formData.htmlCode}
                        onChange={(e) => setFormData({ ...formData, htmlCode: e.target.value })}
                        placeholder="<script>...</script>"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-white text-sm font-mono"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ta' 
                          ? 'Google AdSense அல்லது HTML குறியீடு ஒட்டவும்'
                          : 'Paste Google AdSense or custom HTML code'}
                      </p>
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ta' ? 'இணைப்பு URL (விருப்பம்)' : 'Link URL (Optional)'}
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-white"
                    />
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ta' ? 'நிலை' : 'Position'}
                      </label>
                      <input
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ta' ? 'வகை' : 'Category'}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-800 dark:text-white"
                      >
                        <option value="news">{language === 'ta' ? 'செய்திகள்' : 'News'}</option>
                        <option value="all">{language === 'ta' ? 'அனைத்தும்' : 'All'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      {language === 'ta' ? 'செயலில்' : 'Active'}
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                    </Button>
                    <Button type="submit" disabled={loading || uploading}>
                      {loading || uploading 
                        ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') 
                        : (editingAd ? (language === 'ta' ? 'புதுப்பி' : 'Update') : (language === 'ta' ? 'உருவாக்கு' : 'Create'))
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ads List */}
        <div className="space-y-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="bg-white dark:bg-blue-900 border-gray-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {ad.imageUrl && (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full max-w-md h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {ad.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full ${ad.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {ad.active ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலற்றது' : 'Inactive')}
                      </span>
                      <span>👁️ {ad.impressions} {language === 'ta' ? 'பார்வைகள்' : 'views'}</span>
                      <span>🖱️ {ad.clicks} {language === 'ta' ? 'கிளிக்குகள்' : 'clicks'}</span>
                      <span>📍 Position: {ad.position}</span>
                    </div>
                    {ad.link && (
                      <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                        🔗 {ad.link}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(ad.id, ad.active)}
                      className={ad.active ? 'text-yellow-600' : 'text-green-600'}
                    >
                      {ad.active ? '⏸️' : '▶️'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(ad)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {ads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'ta' 
                  ? 'இதுவரை விளம்பரங்கள் எதுவும் இல்லை. முதல் விளம்பரத்தை உருவாக்குங்கள்!'
                  : 'No ads yet. Create your first ad!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

