'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TranslatedText from '@/components/TranslatedText'
import FileUpload from '@/components/admin/FileUpload'
import TranslateField from '@/components/admin/TranslateField'
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface Business {
  id: number
  name: string
  name_ta: string
  description: string
  description_ta: string
  category: string
  address: string
  address_ta: string
  phone: string
  email?: string
  website?: string
  featured: boolean
  image?: string
  createdAt: string
}

const businessCategories = [
  { id: 'restaurant', name: 'Restaurant', name_ta: 'உணவகம்' },
  { id: 'retail', name: 'Retail', name_ta: 'சில்லறை' },
  { id: 'service', name: 'Service', name_ta: 'சேவை' },
  { id: 'healthcare', name: 'Healthcare', name_ta: 'சுகாதாரம்' },
  { id: 'education', name: 'Education', name_ta: 'கல்வி' },
  { id: 'automotive', name: 'Automotive', name_ta: 'வாகன சேவை' },
  { id: 'other', name: 'Other', name_ta: 'மற்றவை' }
]

export default function AdminDirectoryPage() {
  const { isAdmin, isLoading } = useAdmin()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    description: '',
    description_ta: '',
    category: 'restaurant',
    address: '',
    address_ta: '',
    phone: '',
    email: '',
    website: '',
    featured: false,
    image: ''
  })

  useEffect(() => {
    if (isAdmin) {
      fetchBusinesses()
    }
  }, [isAdmin])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/directory')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingBusiness ? 'PUT' : 'POST'
      const url = editingBusiness ? `/api/admin/directory/${editingBusiness.id}` : '/api/admin/directory'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchBusinesses()
        setShowForm(false)
        setEditingBusiness(null)
        setFormData({
          name: '',
          name_ta: '',
          description: '',
          description_ta: '',
          category: 'restaurant',
          address: '',
          address_ta: '',
          phone: '',
          email: '',
          website: '',
          featured: false,
          image: ''
        })
      }
    } catch (error) {
      console.error('Error saving business:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setFormData({
      name: business.name,
      name_ta: business.name_ta,
      description: business.description,
      description_ta: business.description_ta,
      category: business.category,
      address: business.address,
      address_ta: business.address_ta,
      phone: business.phone,
      email: business.email || '',
      website: business.website || '',
      featured: business.featured,
      image: business.image || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business?')) return

    try {
      const response = await fetch(`/api/admin/directory/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchBusinesses()
      }
    } catch (error) {
      console.error('Error deleting business:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            <TranslatedText>Access Denied</TranslatedText>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            <TranslatedText>You don't have permission to access this page.</TranslatedText>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              <TranslatedText>Manage Directory</TranslatedText>
            </h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span><TranslatedText>Add Business</TranslatedText></span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Total Businesses</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{businesses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GlobeAltIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Featured Businesses</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {businesses.filter(b => b.featured).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPinIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Categories</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(businesses.map(b => b.category)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  <TranslatedText>{editingBusiness ? 'Edit Business' : 'Add Business'}</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <TranslatedText>Business Image</TranslatedText>
                    </label>
                    <FileUpload
                      label="Business Image"
                      fileType="image"
                      onFileUpload={(url) => setFormData({ ...formData, image: url })}
                      onUrlChange={(url) => setFormData({ ...formData, image: url })}
                      currentFile={formData.image}
                      accept="image/*"
                      maxSize={5} // 5MB
                    />
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Business Name (English)</TranslatedText>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Business name in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Business Name (Tamil)</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={formData.name_ta}
                        onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Business name in Tamil"
                      />
                    </div>
                  </div>

                  {/* Category and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Category</TranslatedText>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      >
                        {businessCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Phone Number</TranslatedText>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  {/* Email and Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Email (Optional)</TranslatedText>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="business@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Website (Optional)</TranslatedText>
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="https://business.com"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Address (English)</TranslatedText>
                      </label>
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Business address in English"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Address (Tamil)</TranslatedText>
                      </label>
                      <textarea
                        value={formData.address_ta}
                        onChange={(e) => setFormData({ ...formData, address_ta: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Business address in Tamil"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <TranslateField
                    label="Description"
                    englishValue={formData.description}
                    tamilValue={formData.description_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, description: value })}
                    onTamilChange={(value) => setFormData({ ...formData, description_ta: value })}
                    type="textarea"
                    placeholder={{
                      english: "Business description in English",
                      tamil: "Business description in Tamil"
                    }}
                  />

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      <TranslatedText>Featured Business</TranslatedText>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingBusiness(null)
                      }}
                    >
                      <TranslatedText>Cancel</TranslatedText>
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingBusiness ? 'Update Business' : 'Add Business'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Businesses List */}
        <div className="space-y-4">
          {businesses.map((business) => (
            <Card key={business.id} className="bg-white dark:bg-purple-900 border-gray-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Business Image */}
                  {business.image && (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={business.image}
                        alt={business.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        business.featured 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-purple-800 dark:text-purple-200'
                      }`}>
                        {business.featured ? 'Featured' : 'Regular'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {businessCategories.find(cat => cat.id === business.category)?.name || business.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {business.name}
                    </h3>
                    {business.name_ta && (
                      <h4 className="text-md text-gray-700 dark:text-gray-300 mb-2">
                        {business.name_ta}
                      </h4>
                    )}
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <p className="flex items-center">
                        <PhoneIcon className="inline h-4 w-4 mr-2" />
                        {business.phone}
                      </p>
                      <p className="flex items-center">
                        <MapPinIcon className="inline h-4 w-4 mr-2" />
                        {business.address}
                      </p>
                      {business.website && (
                        <p className="flex items-center">
                          <GlobeAltIcon className="inline h-4 w-4 mr-2" />
                          <a href={business.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800">
                            {business.website}
                          </a>
                        </p>
                      )}
                    </div>
                    {business.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {business.description.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(business)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(business.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {businesses.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  <TranslatedText>No businesses yet</TranslatedText>
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  <TranslatedText>Get started by adding your first business.</TranslatedText>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
