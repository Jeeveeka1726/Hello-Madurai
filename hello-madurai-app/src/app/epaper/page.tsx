'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import NewspaperHeader from '@/components/NewspaperHeader'
import NewHeader from '@/components/layout/NewHeader'
import { Download, Calendar, FileText, Folder, Heart, Share2, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Collection {
  id: string
  name: string
  name_ta?: string
  createdAt: string
  _count: {
    magazines: number
  }
}

interface Magazine {
  id: string
  title: string
  title_ta?: string
  issueNumber?: string
  publishedAt: string
  pdfUrl?: string
  coverImage?: string
  featuredImage?: string
  likes?: number
  downloads?: number
  collection?: {
    id: string
    name: string
    name_ta?: string
  }
}

function EpaperPageContent() {
  const { language, t } = useLanguage()
  const [collections, setCollections] = useState<Collection[]>([])
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [likedMagazines, setLikedMagazines] = useState<Set<string>>(new Set())

  // Load liked magazines from localStorage on mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('hello-madurai-liked-magazines')
    if (savedLikes) {
      try {
        const likedIds = JSON.parse(savedLikes)
        setLikedMagazines(new Set(likedIds))
      } catch (error) {
        console.error('Error loading liked magazines:', error)
      }
    }
  }, [])

  // Save liked magazines to localStorage whenever it changes
  const updateLikedMagazines = (newLikedSet: Set<string>) => {
    setLikedMagazines(newLikedSet)
    localStorage.setItem('hello-madurai-liked-magazines', JSON.stringify(Array.from(newLikedSet)))
  }

  useEffect(() => {
    fetchCollections()
    fetchMagazines()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/magazines/collections')
      if (response.ok) {
        const data = await response.json()
        console.log('📂 Fetched collections:', data)
        console.log('📂 Collections count:', data.length)
        console.log('📂 First collection:', data[0])
        setCollections(data)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/magazines')
      if (response.ok) {
        const data = await response.json()
        console.log('📄 Fetched magazines:', data)
        console.log('📄 First magazine details:', data[0] ? {
          id: data[0].id,
          title: data[0].title,
          pdfUrl: data[0].pdfUrl,
          coverImage: data[0].coverImage,
          featuredImage: data[0].featuredImage,
          collection: data[0].collection
        } : 'No magazines found')

        // Debug all magazines
        data.forEach((mag: Magazine, index: number) => {
          console.log(`📖 Magazine ${index + 1}:`, {
            title: mag.title,
            hasImage: !!(mag.coverImage || mag.featuredImage),
            imageUrl: mag.coverImage || mag.featuredImage,
            hasPdf: !!mag.pdfUrl,
            pdfUrl: mag.pdfUrl
          })
        })
        setMagazines(data)
      }
    } catch (error) {
      console.error('Error fetching magazines:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMagazines = selectedCollection
    ? magazines.filter(mag => mag.collection?.id === selectedCollection)
    : magazines

  const handleView = async (magazine: Magazine) => {
    console.log('🎯 handleView called for:', magazine.title)
    console.log('👁️ Magazine data:', {
      id: magazine.id,
      title: magazine.title,
      pdfUrl: magazine.pdfUrl,
      coverImage: magazine.coverImage,
      featuredImage: magazine.featuredImage
    })

    if (!magazine.pdfUrl) {
      console.log('❌ No PDF URL found for magazine:', magazine.title)
      toast.error(t('view_error', 'PDF not available for this magazine', 'இந்த இதழுக்கு PDF கிடைக்கவில்லை'))
      return
    }

    console.log('🚀 Opening PDF:', magazine.pdfUrl)

    try {
      // Convert Google Drive share link to direct view link if needed
      let pdfUrl = magazine.pdfUrl
      if (pdfUrl.includes('drive.google.com/file/d/')) {
        const fileId = pdfUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          pdfUrl = `https://drive.google.com/file/d/${fileId}/view`
        }
      }

      console.log(`🌐 Final PDF URL to open: ${pdfUrl}`)

      // Open PDF in new tab for viewing - with better error handling
      const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')

      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        console.log('❌ Popup blocked or failed to open')
        // Fallback: try to navigate to PDF directly
        window.location.href = pdfUrl
        toast.warning(t('popup_blocked', 'Opening PDF in current tab...', 'தற்போதைய டேபில் PDF திறக்கப்படுகிறது...'))
      } else {
        toast.success(t('view_started', 'Opening PDF in new tab...', 'புதிய டேபில் PDF திறக்கப்படுகிறது...'))
      }

      // Track view as download in database (since we don't have separate view tracking)
      try {
        const response = await fetch(`/api/magazines/${magazine.id}/download`, {
          method: 'POST'
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ View tracked in DB. New count: ${data.downloads}`)

          // Update the magazine data with new downloads count
          setMagazines(prev => prev.map(m =>
            m.id === magazine.id ? { ...m, downloads: data.downloads } : m
          ))
        } else {
          console.error('Failed to track view in database')
        }
      } catch (apiError) {
        console.error('View tracking API failed:', apiError)
      }

      console.log(`👁️ Viewing: ${magazine.title} - URL: ${pdfUrl}`)
    } catch (error) {
      console.error('PDF view error:', error)
      toast.error(t('view_failed', 'Failed to open PDF', 'PDF திறக்க முடியவில்லை'))
    }
  }

  const handleDownload = async (magazine: Magazine) => {
    console.log('📥 Attempting to download PDF:', magazine.pdfUrl)

    if (!magazine.pdfUrl) {
      toast.error(t('download_error', 'PDF not available', 'PDF கிடைக்கவில்லை'))
      return
    }

    try {
      // Convert Google Drive share link to direct download link
      let downloadUrl = magazine.pdfUrl
      if (downloadUrl.includes('drive.google.com/file/d/')) {
        const fileId = downloadUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
        }
      }

      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${magazine.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(t('download_started', 'Download started...', 'பதிவிறக்கம் தொடங்கியது...'))

      // Track download in database
      try {
        const response = await fetch(`/api/magazines/${magazine.id}/download`, {
          method: 'POST'
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Download tracked in DB. New count: ${data.downloads}`)

          // Update the magazine data with new downloads count
          setMagazines(prev => prev.map(m =>
            m.id === magazine.id ? { ...m, downloads: data.downloads } : m
          ))
        } else {
          console.error('Failed to track download in database')
        }
      } catch (apiError) {
        console.error('Download tracking API failed:', apiError)
      }

      console.log(`📥 Downloaded: ${magazine.title} - URL: ${downloadUrl}`)
    } catch (error) {
      console.error('PDF download error:', error)
      toast.error(t('download_failed', 'Download failed', 'பதிவிறக்கம் தோல்வியடைந்தது'))
    }
  }

  const handleLike = async (magazine: Magazine) => {
    const isLiked = likedMagazines.has(magazine.id)

    try {
      if (isLiked) {
        // Unlike
        const newSet = new Set(likedMagazines)
        newSet.delete(magazine.id)
        updateLikedMagazines(newSet)
        toast.success(t('unliked', 'Removed from favorites', 'பিடித்தவைகளிலிருந்து நீக்கப்பட்டது'))
      } else {
        // Like
        const newSet = new Set(likedMagazines).add(magazine.id)
        updateLikedMagazines(newSet)
        toast.success(t('liked', 'Added to favorites', 'பிடித்தவைகளில் சேர்க்கப்பட்டது'))

        // Call API to increment likes in database
        try {
          const response = await fetch(`/api/magazines/${magazine.id}/like`, {
            method: 'POST'
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Like saved to DB. New count: ${data.likes}`)

            // Update the magazine data with new likes count
            setMagazines(prev => prev.map(m =>
              m.id === magazine.id ? { ...m, likes: data.likes } : m
            ))
          } else {
            console.error('Failed to save like to database')
          }
        } catch (apiError) {
          console.error('API call failed:', apiError)
        }
      }

      console.log(`❤️ ${isLiked ? 'Unliked' : 'Liked'}: ${magazine.title}`)
    } catch (error) {
      toast.error(t('like_failed', 'Action failed', 'செயல் தோல்வியடைந்தது'))
    }
  }

  const handleShare = async (magazine: Magazine) => {
    const shareData = {
      title: magazine.title,
      text: `Check out this magazine: ${magazine.title}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share(shareData)
        toast.success(t('shared', 'Shared successfully', 'வெற்றிகரமாக பகிரப்பட்டது'))
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
        toast.success(t('link_copied', 'Link copied to clipboard', 'இணைப்பு கிளிப்போர்டில் நகலெடுக்கப்பட்டது'))
      }

      console.log(`🔗 Shared: ${magazine.title}`)
    } catch (error) {
      toast.error(t('share_failed', 'Share failed', 'பகிர்வு தோல்வியடைந்தது'))
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            <TranslatedText 
              english="Loading magazines..." 
              tamil="பத்திரிகைகள் ஏற்றப்படுகின்றன..."
            />
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <TranslatedText english="E-Paper" tamil="மின்னிதழ்" />
        </h1>
        <p className="text-gray-600">
          <TranslatedText 
            english="Read and download our digital magazines" 
            tamil="எங்கள் டிஜிட்டல் பத்திரிகைகளைப் படித்து பதிவிறக்கம் செய்யுங்கள்"
          />
        </p>
      </div>

      {/* Category Filters - Matching Videos Section Style */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" suppressHydrationWarning>
          {t('epaper.categories', 'Categories', 'வகைகள்')}
        </h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            variant={selectedCollection === null ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCollection(null)}
            suppressHydrationWarning
          >
            {t('epaper.all_magazines', 'All Magazines', 'அனைத்து பத்திரிகைகள்')}
          </Button>
          {console.log('🎯 Rendering collections in UI:', collections)}
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant={selectedCollection === collection.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCollection(collection.id)}
              suppressHydrationWarning
            >
              {language === 'ta' ? (collection.name_ta || collection.name) : collection.name}
              <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                {collection._count?.magazines || 0}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Magazines Grid */}
      {filteredMagazines.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            <TranslatedText english="No magazines found" tamil="பத்திரிகைகள் எதுவும் கிடைக்கவில்லை" />
          </h3>
          <p className="text-gray-600">
            <TranslatedText 
              english="Check back later for new publications" 
              tamil="புதிய வெளியீடுகளுக்கு பின்னர் சரிபார்க்கவும்"
            />
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredMagazines.map((magazine) => (
            <Card
              key={magazine.id}
              hover
              className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white rounded-lg overflow-hidden"
            >
              {/* Cover Image - Clickable to Open PDF */}
              <div
                className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden group cursor-pointer bg-gradient-to-br from-blue-100 to-blue-200"
                onClick={(e) => {
                  console.log('🎯 Cover clicked for:', magazine.title)
                  console.log('🔗 PDF URL:', magazine.pdfUrl)
                  handleView(magazine)
                }}
              >
                {/* Cover Image */}
                {(magazine.coverImage || magazine.featuredImage) ? (
                  <img
                    src={magazine.coverImage || magazine.featuredImage}
                    alt={`${magazine.title} cover`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onLoad={() => console.log('✅ Image loaded successfully:', magazine.coverImage || magazine.featuredImage)}
                    onError={(e) => {
                      console.log('❌ Image failed to load:', magazine.coverImage || magazine.featuredImage)
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                      // Show fallback
                      const fallback = target.parentElement?.querySelector('.fallback-placeholder') as HTMLElement
                      if (fallback) {
                        fallback.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}

                {/* Fallback placeholder */}
                <div
                  className={`fallback-placeholder absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center transition-transform group-hover:scale-105 ${(magazine.coverImage || magazine.featuredImage) ? 'hidden' : 'flex'}`}
                >
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">
                      <TranslatedText english="PDF Magazine" tamil="PDF இதழ்" />
                    </p>
                    <p className="text-xs text-blue-500 mt-1">
                      <TranslatedText english="Click to open" tamil="திறக்க கிளிக் செய்யவும்" />
                    </p>
                  </div>
                </div>

                {/* PDF Open Indicator - only show on hover when image exists */}
                {(magazine.coverImage || magazine.featuredImage) && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-3">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                )}

                {/* Click to Open PDF Label - only show when image exists */}
                {(magazine.coverImage || magazine.featuredImage) && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                      <TranslatedText english="Click to open PDF" tamil="PDF திறக்க கிளிக் செய்யவும்" />
                    </div>
                  </div>
                )}
              </div>

              {/* Magazine Details */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  <TranslatedText
                    english={magazine.title}
                    tamil={magazine.title_ta || magazine.title}
                  />
                </h3>

                {/* Magazine Info */}
                <div className="space-y-2 mb-4">
                  {magazine.issueNumber && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <TranslatedText english="Issue" tamil="இதழ்" />: {magazine.issueNumber}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(magazine.publishedAt).toLocaleDateString(
                      language === 'ta' ? 'ta-IN' : 'en-IN'
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {magazine.downloads || 0} <TranslatedText english="views" tamil="பார்வைகள்" />
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {magazine.likes || 0} <TranslatedText english="likes" tamil="விருப்பங்கள்" />
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(magazine)
                    }}
                    variant="primary"
                    size="sm"
                    disabled={!magazine.pdfUrl}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <TranslatedText english="Download" tamil="பதிவிறக்கம்" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(magazine)
                    }}
                    variant={likedMagazines.has(magazine.id) ? "primary" : "outline"}
                    size="sm"
                    className="px-3"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedMagazines.has(magazine.id) ? 'fill-current' : ''}`}
                    />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(magazine)
                    }}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EpaperPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <EpaperPageContent />
    </div>
  )
}
