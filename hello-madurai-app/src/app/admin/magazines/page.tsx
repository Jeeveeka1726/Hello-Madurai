'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import TranslatedText from '@/components/TranslatedText'
import BilingualField from '@/components/admin/BilingualField'
import { useLanguage } from '@/contexts/LanguageContext'
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
  featuredImage?: string
  issueNumber: string
  publishedAt: string
  downloads: number
  likes: number
  featured: boolean
  createdAt: string
  updatedAt: string
  collectionId: string
  collection?: {
    id: string
    name: string
    name_ta?: string
  }
}

interface MagazineCollection {
  id: string
  name: string
  name_ta?: string
  description?: string
  description_ta?: string
  coverImage?: string
  featured: boolean
  magazines?: Magazine[]
}

export default function AdminMagazinesPage() {
  const { t } = useLanguage()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null)
  const [editingCollection, setEditingCollection] = useState<MagazineCollection | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    pdfUrl: '',
    coverImage: '',
    featuredImage: '',
    issueNumber: '',
    collectionId: '',
    featured: false
  })
  const [collectionFormData, setCollectionFormData] = useState({
    name: '',
    name_ta: '',
    description: '',
    description_ta: '',
    coverImage: '',
    featured: false
  })
  const [collections, setCollections] = useState<MagazineCollection[]>([])

  useEffect(() => {
    fetchMagazines()
    fetchCollections()
  }, [])

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/admin/magazines')
      if (response.ok) {
        const data = await response.json()
        // Sort by publishedAt date (newest first)
        const sortedData = data.sort((a: Magazine, b: Magazine) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        setMagazines(sortedData)
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

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/magazines')
      if (response.ok) {
        const data = await response.json()
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
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
          featuredImage: '',
          issueNumber: '',
          collectionId: '',
          featured: false
        })
        toast.success(editingMagazine
          ? t('admin.magazineUpdated', 'Magazine updated successfully!', 'பத்திரிகை வெற்றிகரமாக புதுப்பிக்கப்பட்டது!')
          : t('admin.magazineCreated', 'Magazine created successfully!', 'பத்திரிகை வெற்றிகரமாக உருவாக்கப்பட்டது!')
        )
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || t('admin.errorSavingMagazine', 'Error saving magazine', 'பத்திரிகையை சேமிப்பதில் பிழை'))
      }
    } catch (error) {
      console.error('Error saving magazine:', error)
      toast.error(t('admin.errorSavingMagazine', 'Error saving magazine', 'பத்திரிகையை சேமிப்பதில் பிழை'))
    } finally {
      setLoading(false)
    }
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/magazines/collections', {
        method: editingCollection ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...collectionFormData,
          ...(editingCollection && { id: editingCollection.id })
        }),
      })

      if (response.ok) {
        await fetchCollections()
        setShowCollectionForm(false)
        setEditingCollection(null)
        setCollectionFormData({
          name: '',
          name_ta: '',
          description: '',
          description_ta: '',
          coverImage: '',
          featured: false
        })
        toast.success(editingCollection
          ? t('admin.collectionUpdated', 'Collection updated successfully!', 'தொகுப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!')
          : t('admin.collectionCreated', 'Collection created successfully!', 'தொகுப்பு வெற்றிகரமாக உருவாக்கப்பட்டது!')
        )
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || t('admin.errorSavingCollection', 'Error saving collection', 'தொகுப்பை சேமிப்பதில் பிழை'))
      }
    } catch (error) {
      console.error('Error saving collection:', error)
      toast.error(t('admin.errorSavingCollection', 'Error saving collection', 'தொகுப்பை சேமிப்பதில் பிழை'))
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
      featuredImage: magazine.featuredImage || '',
      issueNumber: magazine.issueNumber,
      collectionId: magazine.collectionId,
      featured: magazine.featured
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteMagazine', 'Are you sure you want to delete this magazine?', 'இந்த பத்திரிகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?'))) return

    try {
      const response = await fetch(`/api/admin/magazines/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMagazines()
        toast.success(t('admin.magazineDeleted', 'Magazine deleted successfully!', 'பத்திரிகை வெற்றிகரமாக நீக்கப்பட்டது!'))
      } else {
        toast.error(t('admin.errorDeletingMagazine', 'Error deleting magazine', 'பத்திரிகையை நீக்குவதில் பிழை'))
      }
    } catch (error) {
      console.error('Error deleting magazine:', error)
      toast.error(t('admin.errorDeletingMagazine', 'Error deleting magazine', 'பத்திரிகையை நீக்குவதில் பிழை'))
    }
  }

  const handleEditCollection = (collection: MagazineCollection) => {
    setEditingCollection(collection)
    setCollectionFormData({
      name: collection.name,
      name_ta: collection.name_ta || '',
      description: collection.description || '',
      description_ta: collection.description_ta || '',
      coverImage: collection.coverImage || '',
      featured: collection.featured
    })
    setShowCollectionForm(true)
  }

  const handleDeleteCollection = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteCollection', 'Are you sure you want to delete this collection?', 'இந்த தொகுப்பை நிச்சயமாக நீக்க விரும்புகிறீர்களா?'))) return

    try {
      const response = await fetch(`/api/magazines/collections/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCollections()
        toast.success(t('admin.collectionDeleted', 'Collection deleted successfully!', 'தொகுப்பு வெற்றிகரமாக நீக்கப்பட்டது!'))
      } else {
        toast.error(t('admin.errorDeletingCollection', 'Error deleting collection', 'தொகுப்பை நீக்குவதில் பிழை'))
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
      toast.error(t('admin.errorDeletingCollection', 'Error deleting collection', 'தொகுப்பை நீக்குவதில் பிழை'))
    }
  }

  if (loading && magazines.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              <TranslatedText tamil="ஏற்றுகிறது...">Loading...</TranslatedText>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <TranslatedText tamil="பத்திரிகை மேலாண்மை">Magazine Management</TranslatedText>
            </h1>
            <p className="mt-2 text-gray-600">
              <TranslatedText tamil="டிஜிட்டல் பத்திரிகைகளை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்">
                Create, edit, and manage digital magazines
              </TranslatedText>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowCollectionForm(true)
                setEditingCollection(null)
                setCollectionFormData({
                  name: '',
                  name_ta: '',
                  description: '',
                  description_ta: '',
                  coverImage: '',
                  featured: false
                })
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <TranslatedText tamil="தொகுப்பு சேர்க்க">Add Collection</TranslatedText>
            </Button>
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
                  featuredImage: '',
                  issueNumber: '',
                  collectionId: '',
                  featured: false
                })
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              <TranslatedText tamil="பத்திரிகை சேர்க்க">Add Magazine</TranslatedText>
            </Button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  <TranslatedText tamil={editingMagazine ? 'பத்திரிகை திருத்து' : 'பத்திரிகை சேர்க்க'}>
                    {editingMagazine ? 'Edit Magazine' : 'Add Magazine'}
                  </TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Collection Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText tamil="தொகுப்பு *">Collection *</TranslatedText>
                    </label>
                    <select
                      required
                      value={formData.collectionId}
                      onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">
                        {t('admin.selectCollection', 'Select a collection', 'தொகுப்பைத் தேர்ந்தெடுக்கவும்')}
                      </option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name} {collection.name_ta && `(${collection.name_ta})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title - Bilingual */}
                  <BilingualField
                    label="Title"
                    labelTamil="தலைப்பு"
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

                  {/* Description - Bilingual */}
                  <BilingualField
                    label="Description"
                    labelTamil="விளக்கம்"
                    englishValue={formData.description}
                    tamilValue={formData.description_ta}
                    onEnglishChange={(value) => setFormData({ ...formData, description: value })}
                    onTamilChange={(value) => setFormData({ ...formData, description_ta: value })}
                    type="textarea"
                    rows={3}
                    required={true}
                    placeholder={{
                      english: "Enter magazine description in English",
                      tamil: "பத்திரிகை விளக்கத்தை தமிழில் உள்ளிடவும்"
                    }}
                  />

                  {/* PDF Upload */}
                  <FileUpload
                    label={t('admin.magazinePdf', 'Magazine PDF', 'பத்திரிகை PDF')}
                    fileType="pdf"
                    currentFile={formData.pdfUrl}
                    onFileUpload={(url) => setFormData({ ...formData, pdfUrl: url })}
                    onUrlChange={(url) => setFormData({ ...formData, pdfUrl: url })}
                    className="mb-6"
                  />

                  {/* Cover Image Upload */}
                  <FileUpload
                    label={t('admin.coverImage', 'Cover Image', 'அட்டைப் படம்')}
                    fileType="image"
                    currentFile={formData.coverImage}
                    onFileUpload={(url) => setFormData({ ...formData, coverImage: url })}
                    onUrlChange={(url) => setFormData({ ...formData, coverImage: url })}
                    className="mb-6"
                  />

                  {/* Featured Image Upload */}
                  <FileUpload
                    label={t('admin.featuredImage', 'Featured Image', 'சிறப்பு படம்')}
                    fileType="image"
                    currentFile={formData.featuredImage}
                    onFileUpload={(url) => setFormData({ ...formData, featuredImage: url })}
                    onUrlChange={(url) => setFormData({ ...formData, featuredImage: url })}
                    className="mb-6"
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TranslatedText tamil="இதழ் எண் *">Issue Number *</TranslatedText>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.issueNumber}
                        onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={t('admin.issueNumberPlaceholder', 'e.g., Issue 1, Volume 2', 'எ.கா., இதழ் 1, தொகுதி 2')}
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
                        <span className="text-sm font-medium text-gray-700">
                          <TranslatedText tamil="சிறப்பு பத்திரிகை">Featured Magazine</TranslatedText>
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
                      <TranslatedText tamil="ரத்து செய்">Cancel</TranslatedText>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.title || !formData.description || !formData.pdfUrl || !formData.issueNumber}
                    >
                      {loading
                        ? t('admin.saving', 'Saving...', 'சேமிக்கிறது...')
                        : editingMagazine
                          ? t('admin.update', 'Update', 'புதுப்பி')
                          : t('admin.create', 'Create', 'உருவாக்கு')
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collection Form Modal */}
        {showCollectionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  {editingCollection
                    ? <TranslatedText tamil="தொகுப்பை திருத்து">Edit Collection</TranslatedText>
                    : <TranslatedText tamil="புதிய தொகுப்பு சேர்க்க">Add New Collection</TranslatedText>
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCollectionSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BilingualField
                      label="Name"
                      labelTamil="பெயர்"
                      englishValue={collectionFormData.name}
                      tamilValue={collectionFormData.name_ta}
                      onEnglishChange={(value) => setCollectionFormData({ ...collectionFormData, name: value })}
                      onTamilChange={(value) => setCollectionFormData({ ...collectionFormData, name_ta: value })}
                      required={true}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BilingualField
                      label="Description"
                      labelTamil="விளக்கம்"
                      englishValue={collectionFormData.description}
                      tamilValue={collectionFormData.description_ta}
                      onEnglishChange={(value) => setCollectionFormData({ ...collectionFormData, description: value })}
                      onTamilChange={(value) => setCollectionFormData({ ...collectionFormData, description_ta: value })}
                      type="textarea"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TranslatedText tamil="அட்டைப்படம் URL">Cover Image URL</TranslatedText>
                    </label>
                    <input
                      type="url"
                      value={collectionFormData.coverImage}
                      onChange={(e) => setCollectionFormData({ ...collectionFormData, coverImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={collectionFormData.featured}
                        onChange={(e) => setCollectionFormData({ ...collectionFormData, featured: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        <TranslatedText tamil="சிறப்பு தொகுப்பு">Featured Collection</TranslatedText>
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCollectionForm(false)}
                    >
                      <TranslatedText tamil="ரத்து செய்">Cancel</TranslatedText>
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !collectionFormData.name}
                    >
                      {loading
                        ? t('admin.saving', 'Saving...', 'சேமிக்கிறது...')
                        : editingCollection
                          ? t('admin.update', 'Update', 'புதுப்பி')
                          : t('admin.create', 'Create', 'உருவாக்கு')
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collections List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <TranslatedText tamil="தொகுப்புகள்">Collections</TranslatedText>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {collection.name}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCollection(collection)}
                      >
                        <TranslatedText tamil="திருத்து">Edit</TranslatedText>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCollection(collection.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TranslatedText tamil="நீக்கு">Delete</TranslatedText>
                      </Button>
                    </div>
                  </div>
                  {collection.name_ta && (
                    <p className="text-sm text-gray-600 mb-2">{collection.name_ta}</p>
                  )}
                  {collection.description && (
                    <p className="text-sm text-gray-700">{collection.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {magazine.title}
                    </h3>
                    {magazine.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <TranslatedText tamil="சிறப்பு">Featured</TranslatedText>
                      </span>
                    )}
                  </div>
                  {magazine.title_ta && (
                    <h4 className="text-md text-gray-600">
                      {magazine.title_ta}
                    </h4>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {magazine.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>
                      <TranslatedText tamil="தொகுப்பு:">Collection:</TranslatedText> {magazine.collection?.name}
                    </p>
                    <p>
                      <TranslatedText tamil="வெளியீட்டு தேதி:">Published Date:</TranslatedText> {new Date(magazine.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      <TranslatedText tamil="இதழ்:">Issue:</TranslatedText> {magazine.issueNumber}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {magazine.downloads || 0}
                      </div>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {magazine.likes || 0}
                      </div>
                    </div>
                  </div>
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
                      <TranslatedText tamil="PDF பார்க்க">View PDF</TranslatedText>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              <TranslatedText tamil="பத்திரிகைகள் இல்லை">No magazines found</TranslatedText>
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              <TranslatedText tamil="புதிய பத்திரிகையை உருவாக்குவதன் மூலம் தொடங்குங்கள்.">
                Get started by creating your first magazine.
              </TranslatedText>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
