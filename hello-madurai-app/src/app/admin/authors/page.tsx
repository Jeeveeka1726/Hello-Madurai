'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import { slugify } from '@/utils/slugify'
import { toast } from 'react-hot-toast'

interface Author {
  id: string
  name: string
  name_ta: string | null
  slug: string
  imageUrl: string | null
  description: string | null
  description_ta: string | null
  active: boolean
  featured: boolean
  orderNumber: number
  createdAt: string
  updatedAt: string
}

export default function AdminAuthorsPage() {
  const { language } = useLanguage()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    name_ta: '',
    slug: '',
    imageUrl: '',
    description: '',
    description_ta: '',
    active: true,
    featured: false,
    orderNumber: 0
  })

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/authors')
      if (response.ok) {
        const data = await response.json()
        setAuthors(data)
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAuthor ? `/api/admin/authors/${editingAuthor.id}` : '/api/admin/authors'
      const method = editingAuthor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAuthors()
        setShowForm(false)
        setEditingAuthor(null)
        setFormData({
          name: '',
          name_ta: '',
          slug: '',
          imageUrl: '',
          description: '',
          description_ta: '',
          active: true,
          featured: false,
          orderNumber: 0
        })
        toast.success(editingAuthor ? (language === 'ta' ? 'ஆசிரியர் புதுப்பிக்கப்பட்டது!' : 'Author updated!') : (language === 'ta' ? 'ஆசிரியர் சேர்க்கப்பட்டது!' : 'Author created!'))
      } else {
        toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது!' : 'Error occurred!')
      }
    } catch (error) {
      console.error('Error saving author:', error)
      toast.error(language === 'ta' ? 'ஆசிரியரை சேமிப்பதில் பிழை!' : 'Error saving author!')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (author: Author) => {
    setEditingAuthor(author)
    setFormData({
      name: author.name,
      name_ta: author.name_ta || '',
      slug: author.slug,
      imageUrl: author.imageUrl || '',
      description: author.description || '',
      description_ta: author.description_ta || '',
      active: author.active,
      featured: author.featured,
      orderNumber: author.orderNumber
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த ஆசிரியரை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this author?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/authors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAuthors()
        toast.success(language === 'ta' ? 'ஆசிரியர் நீக்கப்பட்டது!' : 'Author deleted!')
      } else {
        toast.error(language === 'ta' ? 'நீக்குவதில் பிழை!' : 'Error deleting!')
      }
    } catch (error) {
      console.error('Error deleting author:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது!' : 'Error occurred!')
    }
  }

  return (
    <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'ta' ? 'எங்கள் குழு' : 'Our Team'}
          </h1>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingAuthor(null)
              setFormData({
                name: '',
                name_ta: '',
                slug: '',
                imageUrl: '',
                description: '',
                description_ta: '',
                active: true,
                featured: false,
                orderNumber: 0
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {language === 'ta' ? 'குழு உறுப்பினர் சேர்க்க' : 'Add Team Member'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingAuthor
                  ? (language === 'ta' ? 'குழு உறுப்பினரை திருத்து' : 'Edit Team Member')
                  : (language === 'ta' ? 'புதிய குழு உறுப்பினர்' : 'New Team Member')
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'பெயர் (English)' : 'Name (English)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const newName = e.target.value
                        setFormData({
                          ...formData,
                          name: newName,
                          // Auto-generate slug from name if not editing
                          slug: editingAuthor ? formData.slug : slugify(newName)
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'பெயர் (Tamil)' : 'Name (Tamil)'}
                    </label>
                    <input
                      type="text"
                      value={formData.name_ta}
                      onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'Slug' : 'Slug'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    placeholder="hello-madurai"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated from name. URL: /reporters/{formData.slug || 'author-name'}
                  </p>
                </div>

                {/* Profile Image Upload */}
                <FileUpload
                  label={language === 'ta' ? 'படம்' : 'Profile Image'}
                  fileType="image"
                  currentFile={formData.imageUrl}
                  onFileUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                  onUrlChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  className="mb-6"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'விளக்கம் (English)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ta' ? 'விளக்கம் (Tamil)' : 'Description (Tamil)'}
                  </label>
                  <textarea
                    value={formData.description_ta}
                    onChange={(e) => setFormData({ ...formData, description_ta: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ta' ? 'வரிசை எண்' : 'Order Number'}
                    </label>
                    <input
                      type="number"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'ta' ? 'செயலில்' : 'Active'}
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'ta' ? 'சிறப்பு' : 'Featured'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (language === 'ta' ? 'சேமி' : 'Save')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false)
                      setEditingAuthor(null)
                    }}
                  >
                    {language === 'ta' ? 'ரத்து' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</div>
            ) : authors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'ta' ? 'ஆசிரியர்கள் இல்லை' : 'No authors found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === 'ta' ? 'படம்' : 'Image'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === 'ta' ? 'பெயர்' : 'Name'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === 'ta' ? 'நிலை' : 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === 'ta' ? 'செயல்கள்' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {authors.map((author) => (
                      <tr key={author.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {author.imageUrl ? (
                            <img
                              src={author.imageUrl}
                              alt={author.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{author.name}</div>
                          {author.name_ta && (
                            <div className="text-sm text-gray-500">{author.name_ta}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {author.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            author.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {author.active ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலில் இல்லை' : 'Inactive')}
                          </span>
                          {author.featured && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {language === 'ta' ? 'சிறப்பு' : 'Featured'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(author)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(author.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
