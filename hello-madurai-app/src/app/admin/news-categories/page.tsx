'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import BilingualField from '@/components/admin/BilingualField'
import { toast } from 'react-hot-toast'

interface NewsCategory {
  id: string
  name: string
  name_ta?: string
  slug: string
  orderNumber: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminNewsCategoriesPage() {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<NewsCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    slug: '',
    orderNumber: 0,
    active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/news-categories')
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
    setLoading(true)

    try {
      const url = editingCategory ? `/api/admin/news-categories/${editingCategory.id}` : '/api/admin/news-categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCategories()
        setShowForm(false)
        setEditingCategory(null)
        resetForm()
        toast.success(editingCategory ? 'Category updated!' : 'Category created!')
      } else {
        toast.error('Error saving category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Error saving category')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: NewsCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      name_ta: category.name_ta || '',
      slug: category.slug,
      orderNumber: category.orderNumber,
      active: category.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/news-categories/${id}`, {
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

  const resetForm = () => {
    setFormData({
      name: '',
      name_ta: '',
      slug: '',
      orderNumber: 0,
      active: true
    })
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ta' ? 'செய்தி வகைகள்' : 'News Categories'}
          </h1>
          <Button onClick={() => { setShowForm(true); setEditingCategory(null); resetForm(); }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            {language === 'ta' ? 'புதிய வகை' : 'New Category'}
          </Button>
        </div>


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
              <form onSubmit={handleSubmit} className="space-y-6">
                <BilingualField
                  label="Category Name"
                  labelTamil="வகை பெயர்"
                  englishValue={formData.name}
                  tamilValue={formData.name_ta}
                  onEnglishChange={(value) => {
                    setFormData({ ...formData, name: value, slug: generateSlug(value) })
                  }}
                  onTamilChange={(value) => setFormData({ ...formData, name_ta: value })}
                  required={true}
                  placeholder={{ english: "e.g., General", tamil: "எ.கா., பொதுவானது" }}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'URL Slug (ஆங்கிலத்தில் மட்டும்)' : 'URL Slug (English only)'}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., general"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URLs, lowercase letters and hyphens only</p>
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
                  <Button type="submit" disabled={loading}>
                    {loading ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (language === 'ta' ? 'சேமி' : 'Save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setEditingCategory(null); resetForm(); }}
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
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {language === 'ta' && category.name_ta ? category.name_ta : category.name}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Slug: {category.slug}</span>
                        <span>Order: {category.orderNumber}</span>
                        <span className={`px-2 py-1 rounded ${category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {category.active ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலில் இல்லை' : 'Inactive')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(category.id)}>
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'ta' ? 'வகைகள் இல்லை' : 'No Categories'}
                </h3>
                <p className="text-gray-600">
                  {language === 'ta' ? 'தொடங்க ஒரு புதிய வகையைச் சேர்க்கவும்' : 'Add a new category to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
