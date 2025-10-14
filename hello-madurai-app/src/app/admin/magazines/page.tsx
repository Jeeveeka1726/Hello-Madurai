'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Magazine {
  id: string
  title: string
  description: string
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
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
        toast.error('பத்திரிகைகளை பெறுவதில் பிழை')
      }
    } catch (error) {
      console.error('Error fetching magazines:', error)
      toast.error('பத்திரிகைகளை பெறுவதில் பிழை')
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
          description: '',
          pdfUrl: '',
          coverImage: '',
          issueNumber: '',
          featured: false
        })
        toast.success(editingMagazine ? 'பத்திரிகை வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'பத்திரிகை வெற்றிகரமாக உருவாக்கப்பட்டது!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'பத்திரிகையை சேமிப்பதில் பிழை')
      }
    } catch (error) {
      console.error('Error saving magazine:', error)
      toast.error('பத்திரிகையை சேமிப்பதில் பிழை')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (magazine: Magazine) => {
    setEditingMagazine(magazine)
    setFormData({
      title: magazine.title,
      description: magazine.description,
      pdfUrl: magazine.pdfUrl,
      coverImage: magazine.coverImage || '',
      issueNumber: magazine.issueNumber,
      featured: magazine.featured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('இந்த பத்திரிகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?')) return

    try {
      const response = await fetch(`/api/admin/magazines/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMagazines()
        toast.success('பத்திரிகை வெற்றிகரமாக நீக்கப்பட்டது!')
      } else {
        toast.error('பத்திரிகையை நீக்குவதில் பிழை')
      }
    } catch (error) {
      console.error('Error deleting magazine:', error)
      toast.error('பத்திரிகையை நீக்குவதில் பிழை')
    }
  }

  if (loading && magazines.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">ஏற்றுகிறது...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              பத்திரிகை மேலாண்மை
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              டிஜிட்டல் பத்திரிகைகளை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingMagazine(null)
              setFormData({
                title: '',
                description: '',
                pdfUrl: '',
                coverImage: '',
                issueNumber: '',
                featured: false
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            பத்திரிகை சேர்க்க
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-blue-900 text-gray-900 dark:text-gray-100">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  {editingMagazine ? 'பத்திரிகை திருத்து' : 'பத்திரிகை சேர்க்க'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title - Tamil only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      தலைப்பு *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="பத்திரிகை தலைப்பை உள்ளிடவும்"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-blue-800 dark:text-white"
                    />
                  </div>

                  {/* Description - Tamil only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      விளக்கம் *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="பத்திரிகை விளக்கத்தை உள்ளிடவும்"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-blue-800 dark:text-white"
                    />
                  </div>

                  {/* PDF Upload */}
                  <FileUpload
                    label="பத்திரிகை PDF"
                    fileType="pdf"
                    currentFile={formData.pdfUrl}
                    onFileUpload={(url) => setFormData({ ...formData, pdfUrl: url })}
                    onUrlChange={(url) => setFormData({ ...formData, pdfUrl: url })}
                    className="mb-6"
                  />

                  {/* Cover Image Upload */}
                  <FileUpload
                    label="அட்டைப் படம்"
                    fileType="image"
                    currentFile={formData.coverImage}
                    onFileUpload={(url) => setFormData({ ...formData, coverImage: url })}
                    onUrlChange={(url) => setFormData({ ...formData, coverImage: url })}
                    className="mb-6"
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        இதழ் எண் *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.issueNumber}
                        onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-blue-800 dark:text-white"
                        placeholder="எ.கா., இதழ் 1, தொகுதி 2"
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
                          சிறப்பு பத்திரிகை
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
                      ரத்து செய்
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.title || !formData.description || !formData.pdfUrl || !formData.issueNumber}
                    >
                      {loading ? 'சேமிக்கிறது...' : (editingMagazine ? 'புதுப்பி' : 'உருவாக்கு')}
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
                    {magazine.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {magazine.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{magazine.issueNumber}</span>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {magazine.downloads || 0} பதிவிறக்கங்கள்
                    </div>
                  </div>
                  {magazine.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      சிறப்பு
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
                      PDF பார்க்க
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
              பத்திரிகைகள் இல்லை
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              புதிய பத்திரிகையை உருவாக்குவதன் மூலம் தொடங்குங்கள்.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
