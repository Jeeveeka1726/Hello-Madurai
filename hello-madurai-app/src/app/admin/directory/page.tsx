'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TranslatedText from '@/components/TranslatedText'
import BilingualField from '@/components/admin/BilingualField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import FileUpload from '@/components/admin/FileUpload'
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface Subcategory {
  id: string
  name: string
  name_ta: string
  icon?: string
  orderNumber: number
  categoryId: string
  _count?: {
    businesses: number
  }
}

interface Category {
  id: string
  name: string
  name_ta: string
  orderNumber: number
  subcategories: Subcategory[]
}

interface Business {
  id: string
  name: string
  name_ta: string
  description: string
  description_ta: string
  category: string
  categoryId?: string
  subcategoryId?: string
  mainCategory?: Category
  subcategory?: Subcategory
  address: string
  address_ta: string
  phone: string
  email?: string
  website?: string
  mainImage?: string
  mainVideoUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  bookingUrl?: string
  orderNumber: number
  hasProfile: boolean
  profileContent?: string
  profileContent_ta?: string
  profileImage?: string
  profileVideo?: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminDirectoryPage() {
  const { isAdmin, isLoading } = useAdmin()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    description: '',
    description_ta: '',
    category: '',
    categoryId: '',
    subcategoryId: '',
    address: '',
    address_ta: '',
    phone: '',
    email: '',
    website: '',
    mainImage: '',
    mainVideoUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    bookingUrl: '',
    orderNumber: 0,
    hasProfile: false,
    profileContent: '',
    profileContent_ta: '',
    profileImage: '',
    profileVideo: '',
    verified: false
  })

  useEffect(() => {
    if (isAdmin) {
      fetchBusinesses()
      fetchCategories()
    }
  }, [isAdmin])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/directory-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

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
          category: '',
          categoryId: '',
          subcategoryId: '',
          address: '',
          address_ta: '',
          phone: '',
          email: '',
          website: '',
          mainImage: '',
          mainVideoUrl: '',
          youtubeUrl: '',
          instagramUrl: '',
          facebookUrl: '',
          bookingUrl: '',
          orderNumber: 0,
          hasProfile: false,
          profileContent: '',
          profileContent_ta: '',
          profileImage: '',
          profileVideo: '',
          verified: false
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
      categoryId: business.categoryId || '',
      subcategoryId: business.subcategoryId || '',
      address: business.address,
      address_ta: business.address_ta,
      phone: business.phone,
      email: business.email || '',
      website: business.website || '',
      mainImage: business.mainImage || '',
      mainVideoUrl: business.mainVideoUrl || '',
      youtubeUrl: business.youtubeUrl || '',
      instagramUrl: business.instagramUrl || '',
      facebookUrl: business.facebookUrl || '',
      bookingUrl: business.bookingUrl || '',
      orderNumber: business.orderNumber || 0,
      hasProfile: business.hasProfile || false,
      profileContent: business.profileContent || '',
      profileContent_ta: business.profileContent_ta || '',
      profileImage: business.profileImage || '',
      profileVideo: business.profileVideo || '',
      verified: business.verified || false
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <TranslatedText>Directory Management</TranslatedText>
            </h1>
            <p className="mt-2 text-gray-600">
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
                category: '',
                categoryId: '',
                subcategoryId: '',
                address: '',
                address_ta: '',
                phone: '',
                email: '',
                website: '',
                mainImage: '',
                mainVideoUrl: '',
                videoUrl: '',
                youtubeUrl: '',
                instagramUrl: '',
                facebookUrl: '',
                bookingUrl: '',
                latitude: '',
                longitude: '',
                orderNumber: 0,
                hasProfile: false,
                verified: false
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
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  <TranslatedText>{editingBusiness ? 'Edit Business' : 'Add Business'}</TranslatedText>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Main Image/Video Section */}
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-medium text-green-900 mb-4">
                      <TranslatedText>Main Business Image/Video</TranslatedText>
                    </h3>

                    {/* Main Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Main Business Image</TranslatedText>
                        <span className="text-xs text-gray-500 ml-2">(Recommended: 1280x720px)</span>
                      </label>
                      <FileUpload
                        label="Main Business Image"
                        fileType="image"
                        currentFile={formData.mainImage}
                        onFileUpload={(url) => setFormData({ ...formData, mainImage: url })}
                        onUrlChange={(url) => setFormData({ ...formData, mainImage: url })}
                        accept="image/*"
                        maxSize={5}
                      />
                    </div>

                    {/* Main Video URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Main Business Video URL</TranslatedText>
                        <span className="text-xs text-gray-500 ml-2">(YouTube, Vimeo, etc.)</span>
                      </label>
                      <input
                        type="url"
                        value={formData.mainVideoUrl}
                        onChange={(e) => setFormData({ ...formData, mainVideoUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  {/* Business Name */}
                  <BilingualField
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
                  <BilingualField
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
                  <BilingualField
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
                    {/* Main Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Main Category</TranslatedText>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Subcategory</TranslatedText>
                      </label>
                      <select
                        value={formData.subcategoryId}
                        onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={!formData.categoryId}
                      >
                        <option value="">Select Subcategory (Optional)</option>
                        {formData.categoryId && categories
                          .find(cat => cat.id === formData.categoryId)
                          ?.subcategories?.filter(Boolean)?.map((subcategory) => {
                            if (!subcategory || !subcategory.id) return null;
                            return (
                              <option key={subcategory.id} value={subcategory.id}>
                                {subcategory.name || 'Unknown Subcategory'}
                              </option>
                            );
                          }).filter(Boolean)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Phone</TranslatedText>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Email</TranslatedText> (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="business@example.com"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText>Website</TranslatedText> (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  {/* Social Media & Additional URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Instagram URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.instagramUrl}
                        onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://instagram.com/..."
                      />
                    </div>

                    {/* Facebook URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.facebookUrl}
                        onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* YouTube URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://youtube.com/..."
                      />
                    </div>

                    {/* Booking URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.bookingUrl}
                        onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="https://booking.com/..."
                      />
                    </div>
                  </div>



                  {/* Order Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText>Display Order</TranslatedText>
                    </label>
                    <input
                      type="number"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first. Use 0 for default order.
                    </p>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    {/* Has Profile */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasProfile"
                        checked={formData.hasProfile}
                        onChange={(e) => {
                          console.log('hasProfile checkbox clicked:', e.target.checked);
                          setFormData({ ...formData, hasProfile: e.target.checked });
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hasProfile" className="ml-2 block text-sm text-gray-700">
                        <TranslatedText>Has Profile Page</TranslatedText>
                        <span className="text-xs text-gray-500 ml-2">(Show "View Profile" button)</span>
                      </label>
                    </div>

                    {/* Verified */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verified"
                        checked={formData.verified}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="verified" className="ml-2 block text-sm text-gray-700">
                        <TranslatedText>Verified Business</TranslatedText>
                      </label>
                    </div>
                  </div>

                  {/* Profile Content - Only show if hasProfile is checked */}
                  {formData.hasProfile && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-medium text-blue-900 mb-4">
                        <TranslatedText>Profile Page Content</TranslatedText>
                      </h3>

                      {/* Profile Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Profile Image</TranslatedText>
                        </label>
                        <FileUpload
                          label="Profile Image"
                          fileType="image"
                          currentFile={formData.profileImage}
                          onFileUpload={(url) => setFormData({ ...formData, profileImage: url })}
                          onUrlChange={(url) => setFormData({ ...formData, profileImage: url })}
                          accept="image/*"
                          maxSize={5}
                        />
                      </div>

                      {/* Profile Video URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TranslatedText>Profile Video URL</TranslatedText>
                          <span className="text-xs text-gray-500 ml-2">(YouTube, Vimeo, etc.)</span>
                        </label>
                        <input
                          type="url"
                          value={formData.profileVideo}
                          onChange={(e) => setFormData({ ...formData, profileVideo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      {/* Profile Content - English */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Content (English) *
                        </label>
                        <RichTextEditor
                          value={formData.profileContent}
                          onChange={(value) => setFormData({ ...formData, profileContent: value })}
                          placeholder="Write detailed profile content in English..."
                        />
                      </div>

                      {/* Profile Content - Tamil */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          விவரக்குறிப்பு உள்ளடக்கம் (Tamil) *
                        </label>
                        <RichTextEditor
                          value={formData.profileContent_ta}
                          onChange={(value) => setFormData({ ...formData, profileContent_ta: value })}
                          placeholder="தமிழில் விரிவான விவரக்குறிப்பு உள்ளடக்கத்தை எழுதுங்கள்..."
                          className="font-tamil"
                        />
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingBusiness(null)
                      }}
                      className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    <TranslatedText>Total Businesses</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businesses.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    <TranslatedText>With Profile</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businesses.filter(b => b.hasProfile).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    <TranslatedText>Verified</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {businesses.filter(b => b.verified).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business List */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              <TranslatedText>Business Directory</TranslatedText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No businesses found. Add your first business!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                  <Card key={business.id} className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {business.name}
                          </h3>
                          {business.name_ta && (
                            <p className="text-sm text-gray-600 mb-2">
                              {business.name_ta}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mb-2">
                            {business.mainCategory && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {business.mainCategory.name}
                              </span>
                            )}
                            {business.subcategory && business.subcategory.name && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {business.subcategory.icon && (
                                  <span className="mr-1">{business.subcategory.icon}</span>
                                )}
                                {business.subcategory.name}
                              </span>
                            )}
                            {business.hasProfile && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Has Profile
                              </span>
                            )}
                            {business.verified && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="space-y-1 text-xs text-gray-600 mb-4">
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
                          className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(business.id)}
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
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