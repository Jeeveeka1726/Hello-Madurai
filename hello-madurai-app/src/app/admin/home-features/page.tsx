'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import BilingualField from '@/components/admin/BilingualField'

interface HomeFeature {
  id: string
  nameEn: string
  nameTa?: string
  descEn: string
  descTa?: string
  href: string
  iconColor: string
  backgroundImage?: string
  orderNumber: number
  active: boolean
  createdAt: string
}

export default function AdminHomeFeaturesPage() {
  const { language } = useLanguage()
  const [features, setFeatures] = useState<HomeFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFeature, setEditingFeature] = useState<HomeFeature | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nameEn: '',
    nameTa: '',
    descEn: '',
    descTa: '',
    href: '',
    iconColor: 'bg-blue-500',
    backgroundImage: '',
    orderNumber: 0,
    active: true
  })

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/admin/home-features')
      if (response.ok) {
        const data = await response.json()
        setFeatures(data)
      }
    } catch (error) {
      console.error('Error fetching features:', error)
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

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('upload_preset', 'hello-madurai')

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
        }
      )

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, backgroundImage: data.secure_url })
        toast.success('Image uploaded successfully!')
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
      const url = editingFeature ? `/api/admin/home-features/${editingFeature.id}` : '/api/admin/home-features'
      const method = editingFeature ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchFeatures()
        setShowForm(false)
        setEditingFeature(null)
        resetForm()
        toast.success(editingFeature ? 'Feature updated!' : 'Feature created!')
      } else {
        toast.error('Error saving feature')
      }
    } catch (error) {
      console.error('Error saving feature:', error)
      toast.error('Error saving feature')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (feature: HomeFeature) => {
    setEditingFeature(feature)
    setFormData({
      nameEn: feature.nameEn,
      nameTa: feature.nameTa || '',
      descEn: feature.descEn,
      descTa: feature.descTa || '',
      href: feature.href,
      iconColor: feature.iconColor,
      backgroundImage: feature.backgroundImage || '',
      orderNumber: feature.orderNumber,
      active: feature.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return

    try {
      const response = await fetch(`/api/admin/home-features/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFeatures()
        toast.success('Feature deleted!')
      } else {
        toast.error('Error deleting feature')
      }
    } catch (error) {
      console.error('Error deleting feature:', error)
      toast.error('Error deleting feature')
    }
  }

  const resetForm = () => {
    setFormData({
      nameEn: '',
      nameTa: '',
      descEn: '',
      descTa: '',
      href: '',
      iconColor: 'bg-blue-500',
      backgroundImage: '',
      orderNumber: 0,
      active: true
    })
  }

  const iconColors = [
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-pink-500', label: 'Pink' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ta' ? 'முகப்பு அம்சங்கள்' : 'Home Features'}
          </h1>
          <Button onClick={() => { setShowForm(true); setEditingFeature(null); resetForm(); }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            {language === 'ta' ? 'புதிய அம்சம்' : 'New Feature'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingFeature
                  ? (language === 'ta' ? 'அம்சத்தைத் திருத்து' : 'Edit Feature')
                  : (language === 'ta' ? 'புதிய அம்சம்' : 'New Feature')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <BilingualField
                  label="Name"
                  labelTamil="பெயர்"
                  englishValue={formData.nameEn}
                  tamilValue={formData.nameTa}
                  onEnglishChange={(value) => setFormData({ ...formData, nameEn: value })}
                  onTamilChange={(value) => setFormData({ ...formData, nameTa: value })}
                  required={true}
                  placeholder={{ english: "e.g., News", tamil: "எ.கா., செய்திகள்" }}
                />

                <BilingualField
                  label="Description"
                  labelTamil="விளக்கம்"
                  type="textarea"
                  englishValue={formData.descEn}
                  tamilValue={formData.descTa}
                  onEnglishChange={(value) => setFormData({ ...formData, descEn: value })}
                  onTamilChange={(value) => setFormData({ ...formData, descTa: value })}
                  required={true}
                  placeholder={{ english: "Short description", tamil: "சுருக்கமான விளக்கம்" }}
                  rows={3}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'இணைப்பு URL' : 'Link URL'}
                  </label>
                  <input
                    type="text"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="/news, /events, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'ஐகான் நிறம்' : 'Icon Color'}
                    </label>
                    <select
                      value={formData.iconColor}
                      onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {iconColors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'வரிசை எண்' : 'Order Number'}
                    </label>
                    <input
                      type="number"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'பின்னணி படம் (பரிந்துரைக்கப்பட்ட அளவு: 800x600px)' : 'Background Image (Recommended: 800x600px)'}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      disabled={uploading}
                    />
                    {formData.backgroundImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                  {formData.backgroundImage && (
                    <div className="mt-4">
                      <img src={formData.backgroundImage} alt="Preview" className="w-full max-w-md rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {language === 'ta' ? 'செயலில்' : 'Active'}
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading || uploading}>
                    {loading ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (language === 'ta' ? 'சேமி' : 'Save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setEditingFeature(null); resetForm(); }}
                  >
                    {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading && !showForm ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {feature.backgroundImage && (
                      <div className="w-48 h-36 flex-shrink-0">
                        <img
                          src={feature.backgroundImage}
                          alt={feature.nameEn}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {language === 'ta' && feature.nameTa ? feature.nameTa : feature.nameEn}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {language === 'ta' && feature.descTa ? feature.descTa : feature.descEn}
                          </p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>Link: {feature.href}</span>
                            <span>Order: {feature.orderNumber}</span>
                            <span className={`px-2 py-1 rounded ${feature.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {feature.active ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலில் இல்லை' : 'Inactive')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(feature)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(feature.id)}>
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {features.length === 0 && (
              <div className="text-center py-12">
                <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ta' ? 'அம்சங்கள் இல்லை' : 'No Features'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ta' ? 'தொடங்க ஒரு புதிய அம்சத்தைச் சேர்க்கவும்' : 'Add a new feature to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
