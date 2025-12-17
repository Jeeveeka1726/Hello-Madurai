'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Subcategory {
  id: string
  name: string
  name_ta: string
  slug: string
  icon?: string
  categoryId: string
  _count?: {
    businesses: number
  }
}

interface Category {
  id: string
  name: string
  name_ta: string
  slug: string
  orderNumber: number
  subcategories: Subcategory[]
  _count?: {
    businesses: number
    subcategories: number
  }
}

export default function DirectoryCategoriesPage() {
  const { language } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    name_ta: '',
    slug: '',
    orderNumber: 0
  })

  // Subcategory form state
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    name_ta: '',
    slug: '',
    icon: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/directory-categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error(language === 'ta' ? 'வகைகளை பெற முடியவில்லை' : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/directory-categories/${editingCategory.id}`
        : '/api/admin/directory-categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        await fetchCategories()
        setShowCategoryForm(false)
        setEditingCategory(null)
        setCategoryForm({ name: '', name_ta: '', slug: '', orderNumber: 0 })
        toast.success(language === 'ta'
          ? (editingCategory ? 'வகை புதுப்பிக்கப்பட்டது!' : 'வகை சேர்க்கப்பட்டது!')
          : (editingCategory ? 'Category updated!' : 'Category added!')
        )
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSubcategory 
        ? `/api/admin/directory-subcategories/${editingSubcategory.id}`
        : '/api/admin/directory-subcategories'
      
      const method = editingSubcategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategoryForm)
      })

      if (response.ok) {
        await fetchCategories()
        setShowSubcategoryForm(false)
        setEditingSubcategory(null)
        setSubcategoryForm({ name: '', name_ta: '', slug: '', icon: '', categoryId: '' })
        toast.success(language === 'ta'
          ? (editingSubcategory ? 'துணை வகை புதுப்பிக்கப்பட்டது!' : 'துணை வகை சேர்க்கப்பட்டது!')
          : (editingSubcategory ? 'Subcategory updated!' : 'Subcategory added!')
        )
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save subcategory')
      }
    } catch (error) {
      console.error('Error saving subcategory:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த வகையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this category?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/directory-categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCategories()
        toast.success(language === 'ta' ? 'வகை நீக்கப்பட்டது!' : 'Category deleted!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த துணை வகையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this subcategory?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/directory-subcategories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCategories()
        toast.success(language === 'ta' ? 'துணை வகை நீக்கப்பட்டது!' : 'Subcategory deleted!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete subcategory')
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'An error occurred')
    }
  }

  const openCategoryForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        name_ta: category.name_ta,
        slug: category.slug,
        orderNumber: category.orderNumber
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', name_ta: '', slug: '', orderNumber: 0 })
    }
    setShowCategoryForm(true)
  }

  const openSubcategoryForm = (categoryId: string, subcategory?: Subcategory) => {
    setSelectedCategoryId(categoryId)
    if (subcategory) {
      setEditingSubcategory(subcategory)
      setSubcategoryForm({
        name: subcategory.name,
        name_ta: subcategory.name_ta,
        slug: subcategory.slug,
        icon: subcategory.icon || '',
        categoryId: subcategory.categoryId
      })
    } else {
      setEditingSubcategory(null)
      setSubcategoryForm({ name: '', name_ta: '', slug: '', icon: '', categoryId })
    }
    setShowSubcategoryForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {language === 'ta' ? 'அடைவு வகைகள்' : 'Directory Categories'}
        </h1>
        <button
          onClick={() => openCategoryForm()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          {language === 'ta' ? 'புதிய வகை' : 'New Category'}
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            {language === 'ta' ? 'வகைகள் இல்லை' : 'No categories yet'}
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow">
              {/* Category Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <FolderIcon className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === 'ta' ? category.name_ta : category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category._count?.subcategories || 0} {language === 'ta' ? 'துணை வகைகள்' : 'subcategories'} • {' '}
                        {category._count?.businesses || 0} {language === 'ta' ? 'வணிகங்கள்' : 'businesses'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openSubcategoryForm(category.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <PlusIcon className="h-4 w-4 inline mr-1" />
                      {language === 'ta' ? 'துணை வகை' : 'Subcategory'}
                    </button>
                    <button
                      onClick={() => openCategoryForm(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title={language === 'ta' ? 'திருத்து' : 'Edit'}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category.id) && (
                <div className="p-4 bg-gray-50">
                  {category.subcategories.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {language === 'ta' ? 'துணை வகைகள் இல்லை' : 'No subcategories yet'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            {subcategory.icon && (
                              <span className="text-2xl">{subcategory.icon}</span>
                            )}
                            <div>
                              <h4 className="font-medium">
                                {language === 'ta' ? subcategory.name_ta : subcategory.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {subcategory._count?.businesses || 0} {language === 'ta' ? 'வணிகங்கள்' : 'businesses'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openSubcategoryForm(category.id, subcategory)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title={language === 'ta' ? 'திருத்து' : 'Edit'}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingCategory
                  ? (language === 'ta' ? 'வகையை திருத்து' : 'Edit Category')
                  : (language === 'ta' ? 'புதிய வகை' : 'New Category')
                }
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'பெயர் (ஆங்கிலம்)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'பெயர் (தமிழ்)' : 'Name (Tamil)'}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name_ta}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'ஸ்லக்' : 'Slug'}
                  </label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="healthcare, education, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'வரிசை எண்' : 'Order Number'}
                  </label>
                  <input
                    type="number"
                    value={categoryForm.orderNumber}
                    onChange={(e) => setCategoryForm({ ...categoryForm, orderNumber: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ta' ? 'குறைந்த எண்கள் முதலில் காட்டப்படும்' : 'Lower numbers appear first'}
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {language === 'ta' ? 'சேமி' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false)
                      setEditingCategory(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Form Modal */}
      {showSubcategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingSubcategory
                  ? (language === 'ta' ? 'துணை வகையை திருத்து' : 'Edit Subcategory')
                  : (language === 'ta' ? 'புதிய துணை வகை' : 'New Subcategory')
                }
              </h2>
              <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'பெயர் (ஆங்கிலம்)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'பெயர் (தமிழ்)' : 'Name (Tamil)'}
                  </label>
                  <input
                    type="text"
                    value={subcategoryForm.name_ta}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'ஸ்லக்' : 'Slug'}
                  </label>
                  <input
                    type="text"
                    value={subcategoryForm.slug}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="hospitals, clinics, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'ஐகான் (விருப்பம்)' : 'Icon (Optional)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subcategoryForm.icon}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, icon: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="🏥 🎓 🍽️"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const emoji = prompt(language === 'ta' ? 'எமோஜியை உள்ளிடவும்:' : 'Enter emoji:')
                        if (emoji) setSubcategoryForm({ ...subcategoryForm, icon: emoji })
                      }}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      😀
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ta' ? 'எமோஜி ஐகானை உள்ளிடவும்' : 'Enter an emoji icon'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'வகை' : 'Category'}
                  </label>
                  <select
                    value={subcategoryForm.categoryId}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">{language === 'ta' ? 'தேர்ந்தெடுக்கவும்' : 'Select category'}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'ta' ? cat.name_ta : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {language === 'ta' ? 'சேமி' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubcategoryForm(false)
                      setEditingSubcategory(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

