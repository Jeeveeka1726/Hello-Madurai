'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TranslatedText from '@/components/TranslatedText'
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
  id: string
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
  verified: boolean
  createdAt: string
  updatedAt: string
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
    featured: false
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
      const url = editingBusiness 
        ? `/api/admin/directory/${editingBusiness.id}`
        : '/api/admin/directory'
      
      const method = editingBusiness ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
          featured: false
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
      featured: business.featured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              <TranslatedText>Directory Management</TranslatedText>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              <TranslatedText>Manage local businesses and services</TranslatedText>
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
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
                featured: false
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <TranslatedText>Add Business</TranslatedText>
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-purple-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  <TranslatedText>{editingBusiness ? 'Edit Business' : 'Add Business'}</TranslatedText>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Name */}
                  <TranslateField
                    label="Business Name"
                    value={formData.name}
                    value_ta={formData.name_ta}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    onChange_ta={(value) => setFormData({ ...formData, name_ta: value })}
                    placeholder="Enter business name in English..."
                    placeholder_ta="தமிழில் வணிக பெயரை உள்ளிடவும்..."
                    required
                  />

                  {/* Description */}
                  <TranslateField
                    label="Description"
                    value={formData.description}
                    value_ta={formData.description_ta}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    onChange_ta={(value) => setFormData({ ...formData, description_ta: value })}
                    placeholder="Enter business description in English..."
                    placeholder_ta="தமிழில் வணிக விவரணையை உள்ளிடவும்..."
                    multiline
                    required
                  />

                  {/* Address */}
                  <TranslateField
                    label="Address"
                    value={formData.address}
                    value_ta={formData.address_ta}
                    onChange={(value) => setFormData({ ...formData, address: value })}
                    onChange_ta={(value) => setFormData({ ...formData, address_ta: value })}
                    placeholder="Enter address in English..."
                    placeholder_ta="தமிழில் முகவரியை உள்ளிடவும்..."
                    multiline
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Category</TranslatedText>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        required
                      >
                        {businessCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Phone</TranslatedText>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Email</TranslatedText> (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="business@example.com"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Website</TranslatedText> (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

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

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingBusiness(null)
                      }}
                      className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <TranslatedText>Cancel</TranslatedText>
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Saving...' : editingBusiness ? 'Update Business' : 'Add Business'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white dark:bg-purple-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Total Businesses</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {businesses.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-purple-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Featured</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {businesses.filter(b => b.featured).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-purple-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Verified</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {businesses.filter(b => b.verified).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business List */}
        <Card className="bg-white dark:bg-purple-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              <TranslatedText>All Businesses</TranslatedText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No businesses found. Add your first business!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                  <Card key={business.id} className="bg-gray-50 dark:bg-purple-800 border-gray-200 dark:border-purple-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {business.name}
                          </h3>
                          {business.name_ta && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {business.name_ta}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {businessCategories.find(cat => cat.id === business.category)?.name || business.category}
                            </span>
                            {business.featured && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Featured
                              </span>
                            )}
                            {business.verified && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{business.address}</span>
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          <span>{business.phone}</span>
                        </div>
                        {business.website && (
                          <div className="flex items-center">
                            <GlobeAltIcon className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">{business.website}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(business)}
                          className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(business.id)}
                          className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}