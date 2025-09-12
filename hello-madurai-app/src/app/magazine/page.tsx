'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocumentArrowDownIcon, EyeIcon, CalendarIcon, FolderIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Magazine {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  pdfUrl: string
  coverImage?: string
  issueNumber: string
  publishedAt?: string
  publicationDate?: string // For fallback data compatibility
  downloads: number
  featured: boolean
  collectionId: string
}

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

function MagazinePageContent() {
  const { t } = useLanguage()
  const [collections, setCollections] = useState<MagazineCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch magazine collections from database
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log('Fetching magazine collections from API...')
        const response = await fetch('/api/magazines/collections')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched collections data:', data)
          setCollections(data)
        } else {
          console.error('Failed to fetch collections, status:', response.status)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  // Get all magazines from all collections
  const allMagazines = collections.flatMap(collection => collection.magazines)
  const featuredMagazines = allMagazines.filter(magazine => magazine.featured)
  const selectedCollectionData = selectedCollection ? collections.find(c => c.id === selectedCollection) : null

  // No hardcoded magazines - all data comes from database
  const fallbackMagazines = []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownload = (pdfUrl: string, title: string) => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('magazine.title', 'Hello Madurai E-Magazine', 'ஹலோ மதுரை மின்-பத்திரிகை')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('magazine.subtitle', 'Download and read our digital magazine issues', 'எங்கள் டிஜிட்டல் பத்திரிகை இதழ்களை பதிவிறக்கம் செய்து படியுங்கள்')}
          </p>
        </div>

        {/* Magazine Collections */}
        {!loading && collections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('magazine.collections', 'Magazine Collections', 'பத்திரிகை தொகுப்புகள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <FolderIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {collection.name}
                        </h3>
                        {collection.name_ta && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {collection.name_ta}
                          </p>
                        )}
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {collection.magazines.length} {t('magazine.issues', 'issues', 'இதழ்கள்')}
                      </span>
                      {collection.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {t('magazine.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                      {selectedCollection === collection.id ? (
                        t('magazine.hide', 'Hide Issues', 'இதழ்களை மறைக்கவும்')
                      ) : (
                        t('magazine.viewIssues', 'View Issues', 'இதழ்களைப் பார்க்கவும்')
                      )}
                      <ChevronRightIcon className={`h-4 w-4 ml-2 transition-transform ${selectedCollection === collection.id ? 'rotate-90' : ''}`} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Featured Issues from All Collections */}
        {!loading && featuredMagazines.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('magazine.featured', 'Featured Issues', 'சிறப்பு இதழ்கள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredMagazines.map((magazine) => (
                <Card key={magazine.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 border-gray-200 dark:border-purple-800">
                  <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <DocumentArrowDownIcon className="h-16 w-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('magazine.issue', 'Issue', 'இதழ்')} #{magazine.issueNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        <StarIcon className="h-3 w-3 mr-1" />
                        {t('magazine.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(magazine.publishedAt || magazine.publicationDate)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {magazine.title}
                    </h3>
                    {magazine.title_ta && (
                      <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                        {magazine.title_ta}
                      </h4>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {magazine.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {magazine.downloads} {t('magazine.downloads', 'downloads', 'பதிவிறக்கங்கள்')}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(magazine.pdfUrl, magazine.title)}
                      className="w-full bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      {t('magazine.download', 'Download PDF', 'PDF பதிவிறக்கம்')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Selected Collection Issues */}
        {!loading && selectedCollectionData && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedCollectionData.name} - {t('magazine.issues', 'Issues', 'இதழ்கள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {selectedCollectionData.magazines.map((magazine) => (
                <Card key={magazine.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 border-gray-200 dark:border-purple-800">
                  <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <DocumentArrowDownIcon className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('magazine.issue', 'Issue', 'இதழ்')} #{magazine.issueNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      {magazine.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {t('magazine.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(magazine.publishedAt || magazine.publicationDate)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t(`magazine.${magazine.id}.title`, magazine.title, magazine.title_ta)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t(`magazine.${magazine.id}.description`, magazine.description, magazine.description_ta)}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {(magazine.downloads || 0).toLocaleString()} {t('magazine.downloads', 'downloads', 'பதிவிறக்கங்கள்')}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleDownload(magazine.pdfUrl, magazine.title)}
                        className="flex-1"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        {t('magazine.download', 'Download PDF', 'PDF பதிவிறக்கம்')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(magazine.pdfUrl, '_blank')}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('magazine.preview', 'Preview', 'முன்னோட்டம்')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Issues */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('magazine.allIssues', 'All Issues', 'அனைத்து இதழ்கள்')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {magazines.map((magazine) => (
              <Card key={magazine.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('magazine.issue', 'Issue', 'இதழ்')} #{magazine.issueNumber}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(magazine.publishedAt || magazine.publicationDate)}
                    </span>
                    {magazine.featured && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                        {t('magazine.featured', 'Featured', 'சிறப்பு')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {t(`magazine.${magazine.id}.title`, magazine.title, magazine.title_ta)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {t(`magazine.${magazine.id}.description`, magazine.description, magazine.description_ta)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {(magazine.downloads || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(magazine.pdfUrl, magazine.title)}
                      className="flex-1 text-xs"
                    >
                      <DocumentArrowDownIcon className="h-3 w-3 mr-1" />
                      {t('magazine.download', 'Download', 'பதிவிறக்கம்')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(magazine.pdfUrl, '_blank')}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                    >
                      {t('magazine.preview', 'Preview', 'முன்னோட்டம்')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900 dark:to-secondary-900 border-primary-200 dark:border-primary-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('magazine.subscribe', 'Subscribe to Hello Madurai Magazine', 'ஹலோ மதுரை பத்திரிகையை சந்தா செய்யுங்கள்')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('magazine.subscribeDesc', 'Get notified when new issues are published', 'புதிய இதழ்கள் வெளியிடப்படும்போது அறிவிப்பு பெறுங்கள்')}
              </p>
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                {t('magazine.subscribeBtn', 'Subscribe Now', 'இப்போது சந்தா செய்யுங்கள்')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MagazinePage() {
  return (
    <div>
      <NewHeader />
      <MagazinePageContent />
    </div>
  )
}
