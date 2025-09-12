'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FolderIcon, DocumentIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface MagazineCollection {
  id: string
  name: string
  name_ta?: string
  description?: string
  description_ta?: string
  coverImage?: string
  featured: boolean
  magazines: Magazine[]
}

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
  collectionId: string
}

export default function AdminMagazinesNewPage() {
  const { t } = useLanguage()
  const [collections, setCollections] = useState<MagazineCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [showMagazineForm, setShowMagazineForm] = useState(false)
  
  const [collectionFormData, setCollectionFormData] = useState({
    name: '',
    name_ta: '',
    description: '',
    description_ta: '',
    coverImage: '',
    featured: false
  })
  
  const [magazineFormData, setMagazineFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    pdfUrl: '',
    coverImage: '',
    issueNumber: '',
    collectionId: '',
    featured: false
  })

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/magazines/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/magazines/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionFormData),
      })

      if (response.ok) {
        alert('Magazine collection created successfully!')
        setCollectionFormData({
          name: '',
          name_ta: '',
          description: '',
          description_ta: '',
          coverImage: '',
          featured: false
        })
        setShowCollectionForm(false)
        fetchCollections()
      } else {
        alert('Failed to create collection')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      alert('Error creating collection')
    }
  }

  const handleMagazineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/magazines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(magazineFormData),
      })

      if (response.ok) {
        alert('Magazine added successfully!')
        setMagazineFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          pdfUrl: '',
          coverImage: '',
          issueNumber: '',
          collectionId: '',
          featured: false
        })
        setShowMagazineForm(false)
        fetchCollections()
      } else {
        alert('Failed to add magazine')
      }
    } catch (error) {
      console.error('Error adding magazine:', error)
      alert('Error adding magazine')
    }
  }

  const handleDeleteMagazine = async (magazineId: string) => {
    if (!confirm('Are you sure you want to delete this magazine?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/magazines/${magazineId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Magazine deleted successfully!')
        fetchCollections()
      } else {
        const errorData = await response.json()
        alert(`Failed to delete magazine: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting magazine:', error)
      alert('Error deleting magazine')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('admin.magazines.title', 'Magazine Management', 'பத்திரிகை மேலாண்மை')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('admin.magazines.subtitle', 'Manage magazine collections and issues', 'பத்திரிகை தொகுப்புகள் மற்றும் இதழ்களை நிர்வகிக்கவும்')}
          </p>
        </div>

        <div className="mb-6 flex space-x-4">
          <Button
            onClick={() => setShowCollectionForm(!showCollectionForm)}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            <FolderIcon className="h-4 w-4 mr-2" />
            {showCollectionForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.magazines.addCollection', 'Add Collection', 'தொகுப்பு சேர்க்கவும்')}
          </Button>
          
          <Button
            onClick={() => setShowMagazineForm(!showMagazineForm)}
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={collections.length === 0}
          >
            <DocumentIcon className="h-4 w-4 mr-2" />
            {showMagazineForm ? t('admin.cancel', 'Cancel', 'ரத்து') : t('admin.magazines.addMagazine', 'Add Magazine', 'பத்திரிகை சேர்க்கவும்')}
          </Button>
        </div>

        {/* Collection Form */}
        {showCollectionForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.magazines.addNewCollection', 'Add New Magazine Collection', 'புதிய பத்திரிகை தொகுப்பு சேர்க்கவும்')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCollectionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.name', 'Name (English)', 'பெயர் (ஆங்கிலம்)')} *
                    </label>
                    <input
                      type="text"
                      value={collectionFormData.name}
                      onChange={(e) => setCollectionFormData({...collectionFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.nameTa', 'Name (Tamil)', 'பெயர் (தமிழ்)')}
                    </label>
                    <input
                      type="text"
                      value={collectionFormData.name_ta}
                      onChange={(e) => setCollectionFormData({...collectionFormData, name_ta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.magazines.coverImage', 'Cover Image URL', 'அட்டைப்படம் URL')}
                  </label>
                  <input
                    type="url"
                    value={collectionFormData.coverImage}
                    onChange={(e) => setCollectionFormData({...collectionFormData, coverImage: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.description', 'Description (English)', 'விளக்கம் (ஆங்கிலம்)')}
                    </label>
                    <textarea
                      value={collectionFormData.description}
                      onChange={(e) => setCollectionFormData({...collectionFormData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.descriptionTa', 'Description (Tamil)', 'விளக்கம் (தமிழ்)')}
                    </label>
                    <textarea
                      value={collectionFormData.description_ta}
                      onChange={(e) => setCollectionFormData({...collectionFormData, description_ta: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={collectionFormData.featured}
                      onChange={(e) => setCollectionFormData({...collectionFormData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.featured', 'Featured Collection', 'சிறப்பு தொகுப்பு')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-purple-600 text-white hover:bg-purple-700">
                    {t('admin.save', 'Save Collection', 'தொகுப்பை சேமிக்கவும்')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCollectionForm(false)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {t('admin.cancel', 'Cancel', 'ரத்து')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Magazine Form */}
        {showMagazineForm && (
          <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('admin.magazines.addNewMagazine', 'Add New Magazine', 'புதிய பத்திரிகை சேர்க்கவும்')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMagazineSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.magazines.selectCollection', 'Select Collection', 'தொகுப்பை தேர்ந்தெடுக்கவும்')} *
                  </label>
                  <select
                    value={magazineFormData.collectionId}
                    onChange={(e) => setMagazineFormData({...magazineFormData, collectionId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a collection...</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} {collection.name_ta && `(${collection.name_ta})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.title', 'Title (English)', 'தலைப்பு (ஆங்கிலம்)')} *
                    </label>
                    <input
                      type="text"
                      value={magazineFormData.title}
                      onChange={(e) => setMagazineFormData({...magazineFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.titleTa', 'Title (Tamil)', 'தலைப்பு (தமிழ்)')}
                    </label>
                    <input
                      type="text"
                      value={magazineFormData.title_ta}
                      onChange={(e) => setMagazineFormData({...magazineFormData, title_ta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.magazines.issueNumber', 'Issue Number', 'இதழ் எண்')} *
                    </label>
                    <input
                      type="text"
                      value={magazineFormData.issueNumber}
                      onChange={(e) => setMagazineFormData({...magazineFormData, issueNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.magazines.coverImage', 'Cover Image URL', 'அட்டைப்படம் URL')}
                    </label>
                    <input
                      type="url"
                      value={magazineFormData.coverImage}
                      onChange={(e) => setMagazineFormData({...magazineFormData, coverImage: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.magazines.pdfUrl', 'PDF URL', 'PDF URL')} *
                  </label>
                  <input
                    type="url"
                    value={magazineFormData.pdfUrl}
                    onChange={(e) => setMagazineFormData({...magazineFormData, pdfUrl: e.target.value})}
                    placeholder="https://example.com/magazine.pdf"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.description', 'Description (English)', 'விளக்கம் (ஆங்கிலம்)')} *
                    </label>
                    <textarea
                      value={magazineFormData.description}
                      onChange={(e) => setMagazineFormData({...magazineFormData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.descriptionTa', 'Description (Tamil)', 'விளக்கம் (தமிழ்)')}
                    </label>
                    <textarea
                      value={magazineFormData.description_ta}
                      onChange={(e) => setMagazineFormData({...magazineFormData, description_ta: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={magazineFormData.featured}
                      onChange={(e) => setMagazineFormData({...magazineFormData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.featured', 'Featured Magazine', 'சிறப்பு பத்திரிகை')}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                    {t('admin.save', 'Save Magazine', 'பத்திரிகையை சேமிக்கவும்')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowMagazineForm(false)}
                    className="bg-gray-600 text-white hover:bg-gray-700"
                  >
                    {t('admin.cancel', 'Cancel', 'ரத்து')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Collections Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading magazine collections...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {collections.map((collection) => (
              <Card key={collection.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center">
                    <FolderIcon className="h-5 w-5 mr-2 text-purple-600" />
                    {collection.name}
                    {collection.name_ta && <span className="ml-2 text-gray-600 dark:text-gray-400">({collection.name_ta})</span>}
                    {collection.featured && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collection.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{collection.description}</p>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {collection.magazines.map((magazine) => (
                      <div key={magazine.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{magazine.title}</h4>
                        {magazine.title_ta && (
                          <h5 className="text-sm text-gray-600 dark:text-gray-400 mb-2">{magazine.title_ta}</h5>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Issue: {magazine.issueNumber}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Downloads: {magazine.downloads}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">{magazine.description}</p>
                        {magazine.featured && (
                          <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Featured
                          </span>
                        )}
                        <div className="mt-2 flex space-x-2">
                          <a
                            href={magazine.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                          >
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            View PDF
                          </a>
                          <button
                            onClick={() => handleDeleteMagazine(magazine.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {collection.magazines.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No magazines in this collection yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && collections.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No magazine collections found. Create your first collection to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
