'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DocumentArrowDownIcon, EyeIcon, CalendarIcon, ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardContent } from '@/components/ui/Card'
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

function MagazineCollectionPageContent() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const collectionId = params.collectionId as string
  
  const [collection, setCollection] = useState<MagazineCollection | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch specific collection and its magazines
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const response = await fetch(`/api/magazines/collections`)
        if (response.ok) {
          const collections = await response.json()
          const selectedCollection = collections.find((c: MagazineCollection) => c.id === collectionId)
          setCollection(selectedCollection || null)
        } else {
          console.error('Failed to fetch magazine collection data')
        }
      } catch (error) {
        console.error('Error fetching magazine collection data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (collectionId) {
      fetchCollectionData()
    }
  }, [collectionId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('magazine.loading', 'Loading magazine collection...', 'பத்திரிகை தொகுப்பு ஏற்றப்படுகிறது...')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              {t('magazine.collectionNotFound', 'Magazine collection not found', 'பத்திரிகை தொகுப்பு கிடைக்கவில்லை')}
            </p>
            <Button 
              onClick={() => router.push('/magazine')}
              className="mt-4"
            >
              {t('magazine.backToMagazines', 'Back to Magazines', 'பத்திரிகைகளுக்கு திரும்பு')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/magazine')}
            variant="outline"
            className="mb-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('magazine.backToMagazines', 'Back to Magazines', 'பத்திரிகைகளுக்கு திரும்பு')}
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {collection.name}
            </h1>
            {collection.name_ta && (
              <h2 className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                {collection.name_ta}
              </h2>
            )}
            {collection.description && (
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {collection.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{collection.magazines.length} {t('magazine.issues', 'issues', 'இதழ்கள்')}</span>
              {collection.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <StarIcon className="h-3 w-3 mr-1" />
                  {t('magazine.featured', 'Featured', 'சிறப்பு')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Magazine Issues List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('magazine.allIssues', 'All Issues', 'அனைத்து இதழ்கள்')}
          </h2>
          
          {collection.magazines.length === 0 ? (
            <div className="text-center py-12">
              <DocumentArrowDownIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('magazine.noIssues', 'No issues available in this collection', 'இந்த தொகுப்பில் இதழ்கள் எதுவும் இல்லை')}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collection.magazines.map((magazine) => (
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
                        {magazine.downloads.toLocaleString()} {t('magazine.downloads', 'downloads', 'பதிவிறக்கங்கள்')}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleDownload(magazine.pdfUrl, magazine.title)}
                        className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
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
          )}
        </div>
      </div>
    </div>
  )
}

export default function MagazineCollectionPage() {
  return (
    <div>
      <NewHeader />
      <MagazineCollectionPageContent />
    </div>
  )
}
