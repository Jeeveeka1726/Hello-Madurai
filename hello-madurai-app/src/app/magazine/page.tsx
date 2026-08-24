'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DocumentArrowDownIcon, EyeIcon, CalendarIcon, FolderIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
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
  featuredImage?: string
  issueNumber: string
  publishedAt?: string
  publicationDate?: string // For fallback data compatibility
  downloads: number
  likes: number
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
  const { t, language } = useLanguage()
  const router = useRouter()
  const [collections, setCollections] = useState<MagazineCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMagazineData, setShareMagazineData] = useState<Magazine | null>(null)
  const [likedMagazines, setLikedMagazines] = useState<Set<string>>(new Set())

  // Fetch magazine collections from database
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log('Fetching magazine collections from API...')
        const response = await fetch('/api/magazines', { cache: 'no-store' }) // Always fresh - fixes Firefox caching
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

  const handleDownload = async (magazine: Magazine) => {
    try {
      // Track download
      await fetch(`/api/magazines/${magazine.id}/download`, {
        method: 'POST'
      })

      // Download the file
      const link = document.createElement('a')
      link.href = magazine.pdfUrl
      link.download = `${magazine.title}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Update local state
      setCollections(prev => prev.map(collection => ({
        ...collection,
        magazines: collection.magazines.map(mag =>
          mag.id === magazine.id ? { ...mag, downloads: mag.downloads + 1 } : mag
        )
      })))
    } catch (error) {
      console.error('Error tracking download:', error)
    }
  }

  const handleLike = async (magazine: Magazine) => {
    if (likedMagazines.has(magazine.id)) return // Already liked

    try {
      const response = await fetch(`/api/magazines/${magazine.id}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        setLikedMagazines(prev => new Set([...prev, magazine.id]))

        // Update local state
        setCollections(prev => prev.map(collection => ({
          ...collection,
          magazines: collection.magazines.map(mag =>
            mag.id === magazine.id ? { ...mag, likes: mag.likes + 1 } : mag
          )
        })))
      }
    } catch (error) {
      console.error('Error liking magazine:', error)
    }
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
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {magazine.downloads}
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {magazine.likes || 0}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleDownload(magazine)}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        {t('magazine.download', 'Download', 'பதிவிறக்கம்')}
                      </Button>

                      <Button
                        onClick={() => handleLike(magazine)}
                        variant="outline"
                        className={`px-3 ${likedMagazines.has(magazine.id) ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-gray-50'}`}
                        disabled={likedMagazines.has(magazine.id)}
                      >
                        <svg className="h-4 w-4" fill={likedMagazines.has(magazine.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </Button>

                      <Button
                        onClick={() => {
                          setShareMagazineData(magazine)
                          setShowShareModal(true)
                        }}
                        variant="outline"
                        className="px-3 hover:bg-gray-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && shareMagazineData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ta' ? 'பத்திரிகையைப் பகிரவும்' : 'Share Magazine'}
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Magazine Preview */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">
                  {language === 'ta' && shareMagazineData.title_ta ? shareMagazineData.title_ta : shareMagazineData.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {language === 'ta' ? 'இதழ்' : 'Issue'} #{shareMagazineData.issueNumber}
                </p>
              </div>

              <div className="space-y-3">
                {/* Native Share (iPhone/Android) */}
                {navigator.share && (
                  <button
                    onClick={async () => {
                      try {
                        const magazineTitle = language === 'ta' && shareMagazineData.title_ta ? shareMagazineData.title_ta : shareMagazineData.title
                        await navigator.share({
                          title: magazineTitle,
                          text: `${magazineTitle}\n${language === 'ta' ? 'இதழ்' : 'Issue'} #${shareMagazineData.issueNumber}`,
                          url: `${window.location.origin}/magazine/${shareMagazineData.collectionId}`
                        })
                        setShowShareModal(false)
                      } catch (error) {
                        console.log('Native sharing cancelled or failed')
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>{language === 'ta' ? 'பகிரவும்' : 'Share'}</span>
                  </button>
                )}

                {/* Copy Link */}
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/magazine/${shareMagazineData.collectionId}`
                    navigator.clipboard.writeText(url)
                    setShowShareModal(false)
                    // You could add a toast notification here
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{language === 'ta' ? 'இணைப்பை நகலெடுக்கவும்' : 'Copy Link'}</span>
                </button>
              </div>
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
      <CategoryNavigation />
      <MagazinePageContent />
    </div>
  )
}
