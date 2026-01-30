'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface OfferCategory {
  id: string
  name: string
  name_ta: string | null
  orderNumber: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminOfferCategoriesPage() {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<OfferCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<OfferCategory | null>(null)
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
      const response = await fetch('/api/offer-categories?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `/api/offer-categories/${editingCategory.id}`
        : '/api/offer-categories'

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

  const handleEdit = (category: OfferCategory) => {
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
    if (!confirm(language === 'ta' ? 'இந்த வகையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/offer-categories/${id}`, {
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

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/offer-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (response.ok) {
        await fetchCategories()
        toast.success(currentActive ? 'Category deactivated!' : 'Category activated!')
      }
    } catch (error) {
      console.error('Error toggling category:', error)
      toast.error('Error updating category')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === 'ta' ? 'சலுகை வகைகள் நிர்வாகம்' : 'Offer Categories Management'}
        </h1>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingCategory(null)
            setFormData({
              name: '',
              name_ta: '',
              orderNumber: 0,
              active: true
            })
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {language === 'ta' ? 'புதிய வகை' : 'New Category'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingCategory
                ? (language === 'ta' ? 'வகையைத் திருத்து' : 'Edit Category')
                : (language === 'ta' ? 'புதிய வகை' : 'New Category')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ta' ? 'பெயர் (ஆங்கிலம்)' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ta' ? 'பெயர் (தமிழ்)' : 'Name (Tamil)'}
                </label>
                <input
                  type="text"
                  value={formData.name_ta}
                  onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ta' ? 'வரிசை எண்' : 'Order Number'}
                </label>
                <input
                  type="number"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  {language === 'ta' ? 'செயலில்' : 'Active'}
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory
                    ? (language === 'ta' ? 'புதுப்பி' : 'Update')
                    : (language === 'ta' ? 'உருவாக்கு' : 'Create')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCategory(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {language === 'ta' ? 'வகைகள் இல்லை' : 'No categories found'}
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.name_ta && (
                      <p className="text-gray-600">{category.name_ta}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {language === 'ta' ? 'வரிசை:' : 'Order:'} {category.orderNumber}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {category.active ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலற்றது' : 'Inactive')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleActive(category.id, category.active)}
                      className={category.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
                    >
                      {category.active ? (language === 'ta' ? 'செயலிழக்கச் செய்' : 'Deactivate') : (language === 'ta' ? 'செயல்படுத்து' : 'Activate')}
                    </Button>
                    <Button onClick={() => handleEdit(category)} className="bg-blue-500 hover:bg-blue-600">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(category.id)} className="bg-red-500 hover:bg-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
