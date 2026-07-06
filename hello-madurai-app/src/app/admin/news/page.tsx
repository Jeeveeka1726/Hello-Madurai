'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import BilingualField from '@/components/admin/BilingualField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import AdminSearchBox from '@/components/admin/AdminSearchBox'
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
  authorSlug?: string
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
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    content: '',
    content_ta: '',
    excerpt: '',
    excerpt_ta: '',
    category: '',
    author: '',
    authorSlug: '',
    featured: false,
    featuredImage: '',
    tags: ''
  })

  useEffect(() => {
    fetchNews()
    fetchCategories()
    fetchAuthors()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/news-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        // Set first category as default if available
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].slug }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchAuthors = async () => {
    try {
      console.log('📥 Fetching authors from /api/admin/authors...')
      const response = await fetch('/api/admin/authors')
      console.log('📊 Authors response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Authors loaded:', data.length, 'authors')
        console.log('📋 Authors data:', data)
        setAuthors(data)

        // Set first author as default if available
        if (data.length > 0 && !formData.author) {
          console.log('🎯 Setting default author:', data[0].name)
          setFormData(prev => ({ ...prev, author: data[0].name }))
        }
      } else {
        console.error('❌ Failed to fetch authors, status:', response.status)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('❌ Error fetching authors:', error)
    }
  }

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/admin/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data)
        setFilteredNews(data)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredNews(news)
      return
    }

    const filtered = news.filter(item => {
      const searchFields = [
        item.title,
        item.title_ta,
        item.content,
        item.content_ta,
        item.excerpt,
        item.excerpt_ta,
        item.category,
        item.author
      ].filter(Boolean).join(' ').toLowerCase()

      return searchFields.includes(query.toLowerCase())
    })

    setFilteredNews(filtered)
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
          category: categories.length > 0 ? categories[0].slug : '',
          author: authors.length > 0 ? authors[0].name : '',
          authorSlug: authors.length > 0 ? authors[0].slug : '',
          featured: false,
          featuredImage: '',
          tags: ''
        })
        toast.success(editingNews ? (language === 'ta' ? 'செய்தி வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'News updated successfully!') : (language === 'ta' ? 'செய்தி வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'News created successfully!'))
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.details || errorData.error || 'Error saving news'
        console.error('API Error:', errorData)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error saving news:', error)
      toast.error(language === 'ta' ? 'செய்தியை சேமிப்பதில் பிழை!' : 'Error saving news!')
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
      authorSlug: newsItem.authorSlug || '',
      featured: newsItem.featured,
      featuredImage: newsItem.featuredImage || '',
      tags: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த செய்தியை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this news item?')) return

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchNews()
        toast.success(language === 'ta' ? 'செய்தி வெற்றிகரமாக நீக்கப்பட்டது!' : 'News deleted successfully!')
      } else {
        toast.error(language === 'ta' ? 'செய்தியை நீக்குவதில் பிழை' : 'Error deleting news')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error(language === 'ta' ? 'செய்தியை நீக்குவதில் பிழை' : 'Error deleting news')
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

  // Check if a news item is from today
  const isToday = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newsDate = new Date(dateString)
    newsDate.setHours(0, 0, 0, 0)
    return newsDate.getTime() === today.getTime()
  }

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {language === 'ta' ? 'செய்தி மேலாண்மை' : 'News Management'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {language === 'ta' ? 'செய்தி கட்டுரைகளை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்' : 'Create, edit, and manage news articles'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/admin/comments'}
            >
              💬 {language === 'ta' ? 'கருத்துகள்' : 'Comments'}
            </Button>
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
                  category: categories.length > 0 ? categories[0].slug : '',
                  author: authors.length > 0 ? authors[0].name : '',
                  featured: false,
                  featuredImage: '',
                  tags: ''
                })
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {language === 'ta' ? 'செய்தி சேர்க்க' : 'Add News'}
            </Button>
          </div>
        </div>

        {/* Info Banner for Today's News */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {language === 'ta' ? 'இன்றைய செய்தி பிரிவு' : "Today's News Section"}
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                {language === 'ta'
                  ? 'இன்று வெளியிடப்பட்ட செய்திகள் தானாகவே முகப்பு பக்கத்தில் "இன்றைய செய்திகள்" பிரிவில் காட்டப்படும். இந்த செய்திகள் ⭐ குறியீட்டுடன் குறிக்கப்பட்டுள்ளன.'
                  : 'News published today will automatically appear in the "Today\'s News" carousel on the homepage. These news items are marked with a ⭐ badge.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <AdminSearchBox
            placeholder="Search news by title, content, category, or author..."
            placeholderTa="தலைப்பு, உள்ளடக்கம், வகை அல்லது ஆசிரியர் மூலம் செய்திகளைத் தேடுங்கள்..."
            onSearch={handleSearch}
            className="max-w-md"
          />
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              {language === 'ta'
                ? `${filteredNews.length} செய்திகள் கண்டறியப்பட்டன "${searchQuery}" க்கு`
                : `Found ${filteredNews.length} news articles for "${searchQuery}"`
              }
            </p>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <Card className="w-full max-w-2xl sm:max-w-3xl max-h-[95vh] overflow-y-auto bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  {editingNews ? (language === 'ta' ? 'செய்தி திருத்து' : 'Edit News') : (language === 'ta' ? 'செய்தி சேர்க்க' : 'Add News')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title - English & Tamil */}
                  <BilingualField
                    label="Title"
                    labelTamil="தலைப்பு"
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

                  {/* Excerpt - English & Tamil - OPTIONAL */}
                  <BilingualField
                    label="Excerpt (Optional)"
                    labelTamil="சுருக்கம் (விரும்பினால்)"
                    englishValue={formData.excerpt}
                    tamilValue={formData.excerpt_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, excerpt: value })}
                    onTamilChange={(value) => setFormData({ ...formData, excerpt_ta: value })}
                    type="textarea"
                    required={false}
                    placeholder={{
                      english: "Enter a brief excerpt in English (optional)",
                      tamil: "சுருக்கமான விளக்கத்தை தமிழில் உள்ளிடவும் (விரும்பினால்)"
                    }}
                    rows={3}
                  />

                  {/* Content - English & Tamil */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content (English) *
                      </label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        placeholder="Write your news content in English..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        உள்ளடக்கம் (Tamil) *
                      </label>
                      <RichTextEditor
                        value={formData.content_ta}
                        onChange={(value) => setFormData({ ...formData, content_ta: value })}
                        placeholder="தமிழில் உங்கள் செய்தி உள்ளடக்கத்தை எழுதுங்கள்..."
                        className="font-tamil"
                      />
                    </div>
                  </div>

                  {/* Featured Image Upload */}
                  <FileUpload
                    label={language === 'ta' ? 'சிறப்பு படம்' : 'Featured Image'}
                    fileType="image"
                    currentFile={formData.featuredImage}
                    onFileUpload={(url) => setFormData({ ...formData, featuredImage: url })}
                    onUrlChange={(url) => setFormData({ ...formData, featuredImage: url })}
                    className="mb-6"
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ta' ? 'வகை' : 'Category'} *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {categories.length === 0 && (
                          <option value="">
                            {language === 'ta' ? 'வகைகள் ஏற்றுகிறது...' : 'Loading categories...'}
                          </option>
                        )}
                        {categories.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {language === 'ta' && category.name_ta ? category.name_ta : category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ta' ? 'ஆசிரியர்' : 'Author'} *
                      </label>
                      <select
                        required
                        value={formData.author}
                        onChange={(e) => {
                          const selectedAuthor = authors.find(a => a.name === e.target.value)
                          setFormData({
                            ...formData,
                            author: e.target.value,
                            authorSlug: selectedAuthor?.slug || ''
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {authors.length === 0 && (
                          <option value="">
                            {language === 'ta' ? 'ஆசிரியர்கள் ஏற்றுகிறது...' : 'Loading authors...'}
                          </option>
                        )}
                        {authors.map((author) => (
                          <option key={author.id} value={author.name}>
                            {language === 'ta' && author.name_ta ? author.name_ta : author.name}
                          </option>
                        ))}
                      </select>
                      {authors.length === 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {language === 'ta'
                            ? 'ஆசிரியர்களை '
                            : 'No authors found. '
                          }
                          <Link href="/admin/authors" className="text-blue-600 hover:underline">
                            {language === 'ta' ? 'இங்கே சேர்க்கவும்' : 'Add reporters here'}
                          </Link>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'ta' ? 'குறிச்சொற்கள் (காற்புள்ளியால் பிரிக்கப்பட்ட)' : 'Tags (comma separated)'}
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder={language === 'ta' ? 'மதுரை, செய்திகள், உள்ளூர்' : 'madurai, news, local'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (editingNews ? (language === 'ta' ? 'புதுப்பி' : 'Update') : (language === 'ta' ? 'உருவாக்கு' : 'Create'))}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.length === 0 && !loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery
                  ? (language === 'ta' ? 'தேடலுக்கு பொருந்தும் செய்திகள் எதுவும் கிடைக்கவில்லை' : 'No news found matching your search')
                  : (language === 'ta' ? 'செய்திகள் எதுவும் கிடைக்கவில்லை' : 'No news articles found')
                }
              </p>
            </div>
          ) : (
            filteredNews.map((newsItem) => (
            <Card key={newsItem.id} className="bg-white border-gray-200">
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
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {newsItem.category}
                      </span>
                      {newsItem.featuredImage && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <PhotoIcon className="h-3 w-3 inline mr-1" />
                          {language === 'ta' ? 'படம்' : 'Image'}
                        </span>
                      )}
                      {isToday(newsItem.publishedAt) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                          ⭐ {language === 'ta' ? 'இன்றைய செய்தி' : "Today's News"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === 'ta' && newsItem.title_ta ? newsItem.title_ta : newsItem.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {language === 'ta' && newsItem.excerpt_ta ? newsItem.excerpt_ta : newsItem.excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{newsItem.author}</span>
                      <span>{formatDate(newsItem.publishedAt)}</span>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {newsItem.views} {language === 'ta' ? 'பார்வைகள்' : 'views'}
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
