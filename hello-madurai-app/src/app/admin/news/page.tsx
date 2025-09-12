'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import TranslateField from '@/components/admin/TranslateField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { toast } from 'react-hot-toast'

interface NewsItem {
  id: string
  title: string
  title_ta?: string
  content: string
  content_ta?: string
  excerpt: string
  excerpt_ta?: string
  category: string
  author: string
  publishedAt: string
  views: number
  featured: boolean
  featuredImage?: string
  createdAt: string
  updatedAt: string
}

export default function AdminNewsPage() {
  const { language } = useLanguage()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    content: '',
    content_ta: '',
    excerpt: '',
    excerpt_ta: '',
    category: 'general',
    author: 'Admin',
    featured: false,
    featuredImage: '',
    tags: ''
  })

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'corporation', name: 'Corporation' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'business', name: 'Business' },
    { id: 'culture', name: 'Culture' },
    { id: 'sports', name: 'Sports' }
  ]

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/admin/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingNews ? `/api/admin/news/${editingNews.id}` : '/api/admin/news'
      const method = editingNews ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchNews()
        setShowForm(false)
        setEditingNews(null)
        setFormData({
          title: '',
          title_ta: '',
          content: '',
          content_ta: '',
          excerpt: '',
          excerpt_ta: '',
          category: 'general',
          author: 'Admin',
          featured: false,
          featuredImage: '',
          tags: ''
        })
        alert(editingNews ? 'News updated successfully!' : 'News created successfully!')
      } else {
        alert('Error saving news')
      }
    } catch (error) {
      console.error('Error saving news:', error)
      alert('Error saving news')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      title_ta: newsItem.title_ta || '',
      content: newsItem.content,
      content_ta: newsItem.content_ta || '',
      excerpt: newsItem.excerpt,
      excerpt_ta: newsItem.excerpt_ta || '',
      category: newsItem.category,
      author: newsItem.author,
      featured: newsItem.featured,
      featuredImage: newsItem.featuredImage || '',
      tags: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchNews()
        alert('News deleted successfully!')
      } else {
        alert('Error deleting news')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Error deleting news')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
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
              <TranslatedText>News Management</TranslatedText>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              <TranslatedText>Create, edit, and manage news articles</TranslatedText>
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingNews(null)
              setFormData({
                title: '',
                title_ta: '',
                content: '',
                content_ta: '',
                excerpt: '',
                excerpt_ta: '',
                category: 'general',
                author: 'Admin',
                featured: false,
                featuredImage: '',
                tags: ''
              })
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <TranslatedText>Add News</TranslatedText>
          </Button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-purple-900">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  <TranslatedText>{editingNews ? 'Edit News' : 'Add News'}</TranslatedText>
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
                      english: "Enter news title in English",
                      tamil: "செய்தி தலைப்பை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  <TranslateField
                    label="Excerpt"
                    englishValue={formData.excerpt}
                    tamilValue={formData.excerpt_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, excerpt: value })}
                    onTamilChange={(value) => setFormData({ ...formData, excerpt_ta: value })}
                    type="textarea"
                    required={true}
                    placeholder={{
                      english: "Enter a brief excerpt in English",
                      tamil: "சுருக்கமான விளக்கத்தை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  {/* Rich Text Editor for Content */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content (English) *
                      </label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Write your news content in English..."
                        className="mb-4"
                        showTranslate={true}
                        targetLanguage="ta"
                        onTranslate={(translatedText) => setFormData({ ...formData, content_ta: translatedText })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content (Tamil)
                      </label>
                      <RichTextEditor
                        value={formData.content_ta}
                        onChange={(value) => setFormData({ ...formData, content_ta: value })}
                        placeholder="தமிழில் உங்கள் செய்தி உள்ளடக்கத்தை எழுதுங்கள்..."
                        className="font-tamil"
                        showTranslate={true}
                        targetLanguage="en"
                        onTranslate={(translatedText) => setFormData({ ...formData, content: translatedText })}
                      />
                    </div>
                  </div>

                  {/* Featured Image Upload */}
                  <div className="mb-6">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Featured Image
                      </label>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">📐 Recommended Image Sizes:</p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• <strong>Featured Image:</strong> 1200×675 pixels (16:9 ratio)</li>
                          <li>• <strong>File Size:</strong> Under 200KB for fast loading</li>
                          <li>• <strong>Format:</strong> WebP or JPEG preferred</li>
                          <li>• <strong>Note:</strong> Images will be automatically cropped to fit 16:9 aspect ratio</li>
                        </ul>
                      </div>
                    </div>
                    <FileUpload
                      label=""
                      fileType="image"
                      currentFile={formData.featuredImage}
                      onFileUpload={(url) => setFormData({ ...formData, featuredImage: url })}
                      onUrlChange={(url) => setFormData({ ...formData, featuredImage: url })}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Author *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="madurai, news, local"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured Article
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
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : (editingNews ? 'Update' : 'Create')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* News List */}
        <div className="space-y-4">
          {news.map((newsItem) => (
            <Card key={newsItem.id} className="bg-white dark:bg-purple-900 border-gray-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Featured Image */}
                  {newsItem.featuredImage && (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={newsItem.featuredImage}
                        alt={newsItem.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        newsItem.featured 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-purple-800 dark:text-purple-200'
                      }`}>
                        {newsItem.featured ? 'Featured' : 'Regular'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {newsItem.category}
                      </span>
                      {newsItem.featuredImage && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <PhotoIcon className="h-3 w-3 inline mr-1" />
                          Image
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {newsItem.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {newsItem.excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {newsItem.author}</span>
                      <span>{formatDate(newsItem.publishedAt)}</span>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {newsItem.views}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(newsItem)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(newsItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {news.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No news articles found. Create your first article!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
