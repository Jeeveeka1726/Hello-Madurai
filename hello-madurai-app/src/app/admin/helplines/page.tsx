'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface HelplineCategory {
  id: string
  name: string
  name_ta: string | null
}

interface Helpline {
  id: string
  name: string
  name_ta: string | null
  phone: string
  categoryId: string
  address: string | null
  address_ta: string | null
  description: string | null
  description_ta: string | null
  featured: boolean
  category?: HelplineCategory
}

export default function AdminHelplinesPage() {
  const { language } = useLanguage()
  const [helplines, setHelplines] = useState<Helpline[]>([])
  const [categories, setCategories] = useState<HelplineCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingHelpline, setEditingHelpline] = useState<Helpline | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    phone: '',
    categoryId: '',
    address: '',
    address_ta: '',
    description: '',
    description_ta: '',
    featured: false
  })

  useEffect(() => {
    fetchHelplines()
    fetchCategories()
  }, [])

  const fetchHelplines = async () => {
    try {
      const response = await fetch('/api/helplines')
      if (response.ok) {
        const data = await response.json()
        setHelplines(data)
      }
    } catch (error) {
      console.error('Error fetching helplines:', error)
      toast.error('Error fetching helplines')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/helpline-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingHelpline
        ? `/api/helplines/${editingHelpline.id}`
        : '/api/helplines'

      const response = await fetch(url, {
        method: editingHelpline ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchHelplines()
        setShowForm(false)
        setEditingHelpline(null)
        resetForm()
        toast.success(editingHelpline ? 'Helpline updated!' : 'Helpline created!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error saving helpline')
      }
    } catch (error) {
      console.error('Error saving helpline:', error)
      toast.error('Error saving helpline')
    }
  }

  const handleEdit = (helpline: Helpline) => {
    setEditingHelpline(helpline)
    setFormData({
      name: helpline.name,
      name_ta: helpline.name_ta || '',
      phone: helpline.phone,
      categoryId: helpline.categoryId,
      address: helpline.address || '',
      address_ta: helpline.address_ta || '',
      description: helpline.description || '',
      description_ta: helpline.description_ta || '',
      featured: helpline.featured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this helpline?')) return

    try {
      const response = await fetch(`/api/helplines/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchHelplines()
        toast.success('Helpline deleted!')
      } else {
        toast.error('Error deleting helpline')
      }
    } catch (error) {
      console.error('Error deleting helpline:', error)
      toast.error('Error deleting helpline')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      name_ta: '',
      phone: '',
      categoryId: '',
      address: '',
      address_ta: '',
      description: '',
      description_ta: '',
      featured: false
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingHelpline(null)
    resetForm()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Helplines</h1>
          <p className="mt-2 text-gray-600">Manage emergency and helpline numbers</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Helpline
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingHelpline ? 'Edit' : 'Add'} Helpline</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Tamil)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ta}
                    onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'ta' && cat.name_ta ? cat.name_ta : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address (English)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address (Tamil)
                  </label>
                  <input
                    type="text"
                    value={formData.address_ta}
                    onChange={(e) => setFormData({ ...formData, address_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Tamil)
                  </label>
                  <textarea
                    value={formData.description_ta}
                    onChange={(e) => setFormData({ ...formData, description_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingHelpline ? 'Update' : 'Create'} Helpline
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {helplines.map((helpline) => (
          <Card key={helpline.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'ta' && helpline.name_ta ? helpline.name_ta : helpline.name}
                    </h3>
                    {helpline.featured && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span className="font-medium">{helpline.phone}</span>
                    </div>
                    {helpline.category && (
                      <div className="text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {language === 'ta' && helpline.category.name_ta
                            ? helpline.category.name_ta
                            : helpline.category.name}
                        </span>
                      </div>
                    )}
                    {helpline.address && (
                      <p className="text-gray-500">
                        📍 {language === 'ta' && helpline.address_ta ? helpline.address_ta : helpline.address}
                      </p>
                    )}
                    {helpline.description && (
                      <p className="text-gray-500">
                        {language === 'ta' && helpline.description_ta
                          ? helpline.description_ta
                          : helpline.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(helpline)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(helpline.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {helplines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No helplines found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

