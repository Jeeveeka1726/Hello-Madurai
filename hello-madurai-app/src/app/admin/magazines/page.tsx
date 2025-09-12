'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import TranslateField from '@/components/admin/TranslateField'
import TranslatedText from '@/components/TranslatedText'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Magazine {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  pdfUrl: string
  coverImage?: string
  issueNumber: string
  publishedAt: string
  downloads: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminMagazinesPage() {
  const { language } = useLanguage()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    pdfUrl: '',
    coverImage: '',
    issueNumber: '',
    featured: false
  })

  useEffect(() => {
    fetchMagazines()
  }, [])

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/admin/magazines')
      if (response.ok) {
        const data = await response.json()
        setMagazines(data)
      } else {
        toast.error('Failed to fetch magazines')
      }
    } catch (error) {
      console.error('Error fetching magazines:', error)
      toast.error('Error fetching magazines')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/magazines', {
        method: editingMagazine ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(editingMagazine && { id: editingMagazine.id })
        }),
      })

      if (response.ok) {
        await fetchMagazines()
        setShowForm(false)
        setEditingMagazine(null)
        setFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          pdfUrl: '',
          coverImage: '',
          issueNumber: '',
          featured: false
        })
        toast.success(editingMagazine ? 'Magazine updated successfully!' : 'Magazine created successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error saving magazine')
      }
    } catch (error) {
      console.error('Error saving magazine:', error)
      toast.error('Error saving magazine')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (magazine: Magazine) => {
    setEditingMagazine(magazine)
    setFormData({
      title: magazine.title,
      title_ta: magazine.title_ta || '',
      description: magazine.description,
      description_ta: magazine.description_ta || '',
      pdfUrl: magazine.pdfUrl,
      coverImage: magazine.coverImage || '',
      issueNumber: magazine.issueNumber,
      featured: magazine.featured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this magazine?')) return

    try {
      const response = await fetch(`/api/admin/magazines/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMagazines()
        toast.success('Magazine deleted successfully!')
      } else {
        toast.error('Error deleting magazine')
      }
    } catch (error) {
      console.error('Error deleting magazine:', error)
      toast.error('Error deleting magazine')
    }
  }

  if (loading && magazines.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading magazines...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              <TranslatedText>Magazine Management</TranslatedText>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              <TranslatedText>Create, edit, and manage digital magazines</TranslatedText>
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingMagazine(null)
              setFormData({
                title: '',
                title_ta: '',
                description: '',
                description_ta: '',
                pdfUrl: '',
                coverImage: '',
                issueNumber: '',
                featured: false
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <TranslatedText>Add Magazine</TranslatedText>
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  <TranslatedText>{editingMagazine ? 'Edit Magazine' : 'Add Magazine'}</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <TranslateField
                    label="Title"
                    englishValue={formData.title}
                    tamilValue={formData.title_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, title: value })}
                    onTamilChange={(value) => setFormData({ ...formData, title_ta: value })}
                    required={true}
                    placeholder={{
                      english: "Enter magazine title in English",
                      tamil: "பத்திரிகை தலைப்பை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  <TranslateField
                    label="Description"
                    englishValue={formData.description}
                    tamilValue={formData.description_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, description: value })}
                    onTamilChange={(value) => setFormData({ ...formData, description_ta: value })}
                    type="textarea"
                    required={true}
                    placeholder={{
                      english: "Enter magazine description in English",
                      tamil: "பத்திரிகை விளக்கத்தை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  {/* PDF Upload */}
                  <FileUpload
                    label="Magazine PDF"
                    fileType="pdf"
                    currentFile={formData.pdfUrl}
                    onFileUpload={(url) => setFormData({ ...formData, pdfUrl: url })}
                    onUrlChange={(url) => setFormData({ ...formData, pdfUrl: url })}
                    className="mb-6"
                  />

                  {/* Cover Image Upload */}
                  <FileUpload
                    label="Cover Image"
                    fileType="image"
                    currentFile={formData.coverImage}
                    onFileUpload={(url) => setFormData({ ...formData, coverImage: url })}
                    onUrlChange={(url) => setFormData({ ...formData, coverImage: url })}
                    className="mb-6"
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Issue Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.issueNumber}
                        onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="e.g., Issue 1, Vol 2"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          <TranslatedText>Featured Magazine</TranslatedText>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      <TranslatedText>Cancel</TranslatedText>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.title || !formData.description || !formData.pdfUrl || !formData.issueNumber}
                    >
                      {loading ? 'Saving...' : <TranslatedText>{editingMagazine ? 'Update Magazine' : 'Create Magazine'}</TranslatedText>}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Magazines List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {magazines.map((magazine) => (
            <Card key={magazine.id} hover className="h-full">
              <CardContent>
                {magazine.coverImage && (
                  <img
                    src={magazine.coverImage}
                    alt={magazine.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'ta' && magazine.title_ta ? magazine.title_ta : magazine.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {language === 'ta' && magazine.description_ta ? magazine.description_ta : magazine.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{magazine.issueNumber}</span>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {magazine.downloads || 0}
                    </div>
                  </div>
                  {magazine.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <TranslatedText>Featured</TranslatedText>
                    </span>
                  )}
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(magazine)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(magazine.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {magazine.pdfUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(magazine.pdfUrl, '_blank')}
                    >
                      <DocumentIcon className="h-4 w-4 mr-1" />
                      <TranslatedText>View PDF</TranslatedText>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {magazines.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              <TranslatedText>No magazines</TranslatedText>
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <TranslatedText>Get started by creating a new magazine.</TranslatedText>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}