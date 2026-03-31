'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface HelplineCategory {
  id: string
  name: string
  name_ta: string | null
  orderNumber: number
  active: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    helplines: number
  }
}

export default function AdminHelplineCategoriesPage() {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<HelplineCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<HelplineCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    orderNumber: 0,
    active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/helpline-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Error fetching categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/admin/helpline-categories/${editingCategory.id}`
        : '/api/admin/helpline-categories'

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCategories()
        setShowForm(false)
        setEditingCategory(null)
        setFormData({
          name: '',
          name_ta: '',
          orderNumber: 0,
          active: true
        })
        toast.success(editingCategory ? 'Category updated!' : 'Category created!')
      } else {
        toast.error('Error saving category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Error saving category')
    }
  }

  const handleEdit = (category: HelplineCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      name_ta: category.name_ta || '',
      orderNumber: category.orderNumber,
      active: category.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/helpline-categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCategories()
        toast.success('Category deleted!')
      } else {
        toast.error('Error deleting category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error deleting category')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      name_ta: '',
      orderNumber: 0,
      active: true
    })
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
          <h1 className="text-3xl font-bold text-gray-900">Helpline Categories</h1>
          <p className="mt-2 text-gray-600">Manage helpline categories and their order</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingCategory ? 'Edit' : 'Add'} Category</CardTitle>
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
                    Order Number
                  </label>
                  <input
                    type="number"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 mt-8">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
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
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'ta' && category.name_ta ? category.name_ta : category.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Order: {category.orderNumber}
                    </span>
                    {!category.active && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Inactive
                      </span>
                    )}
                    {category._count && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {category._count.helplines} helplines
                      </span>
                    )}
                  </div>
                  {category.name_ta && (
                    <p className="text-sm text-gray-500 mt-1">
                      EN: {category.name} | TA: {category.name_ta}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

