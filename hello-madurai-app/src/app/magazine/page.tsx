'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DocumentArrowDownIcon, EyeIcon, CalendarIcon, FolderIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
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
  const router = useRouter()
  const [collections, setCollections] = useState<MagazineCollection[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch magazine collections from database
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log('Fetching magazine collections from API...')
        const response = await fetch('/api/magazines')
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('magazine.title', 'Hello Madurai E-Paper', 'ஹலோ மதுரை பத்திரிகை')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('magazine.subtitle', 'Download and read our digital magazine issues', 'எங்கள் டிஜிட்டல் பத்திரிகை இதழ்களை பதிவிறக்கம் செய்து படியுங்கள்')}
          </p>
        </div>

        {/* Magazine Collections */}
        {!loading && collections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('magazine.collections', 'E-Paper Collections', 'பத்திரிகை தொகுப்புகள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow bg-white text-gray-900 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <FolderIcon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {collection.name}
                        </h3>
                        {collection.name_ta && (
                          <p className="text-sm text-gray-600">
                            {collection.name_ta}
                          </p>
                        )}
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {collection.magazines.length} {t('magazine.issues', 'issues', 'இதழ்கள்')}
                      </span>
                      {collection.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-blue-800">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {t('magazine.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => router.push(`/magazine/${collection.id}`)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {t('magazine.viewIssues', 'View Issues', 'இதழ்களைப் பார்க்கவும்')}
                      <ChevronRightIcon className="h-4 w-4 ml-2" />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('magazine.featured', 'Featured Issues', 'சிறப்பு இதழ்கள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredMagazines.map((magazine) => (
                <Card key={magazine.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-gray-200">
                  <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-yellow-100 to-yellow-200">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <DocumentArrowDownIcon className="h-16 w-16 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {t('magazine.issue', 'Issue', 'இதழ்')} #{magazine.issueNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-blue-800">
                        <StarIcon className="h-3 w-3 mr-1" />
                        {t('magazine.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(magazine.publishedAt || magazine.publicationDate)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {magazine.title}
                    </h3>
                    {magazine.title_ta && (
                      <h4 className="text-lg text-gray-600 mb-3">
                        {magazine.title_ta}
                      </h4>
                    )}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {magazine.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {magazine.downloads} {t('magazine.downloads', 'downloads', 'பதிவிறக்கங்கள்')}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(magazine.pdfUrl, magazine.title)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
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



      </div>
    </div>
  )
}

export default function MagazinePage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <MagazinePageContent />
    </div>
  )
}
