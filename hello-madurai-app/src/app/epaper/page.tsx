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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

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

  // Normalize different kinds of PDF URLs (especially Google Drive)
	  const normalizePdfUrl = (url: string): string => {
	    const finalUrl = url?.trim()

    if (!finalUrl) return url

    try {
      if (finalUrl.includes('drive.google.com')) {
        // Try to extract file id from /file/d/ or from query params (id=)
        const fileIdFromPath = finalUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        let fileId = fileIdFromPath

        if (!fileId) {
          const urlObj = new URL(finalUrl)
          fileId = urlObj.searchParams.get('id') || undefined
        }

        if (fileId) {
          // Use Google Drive's preview viewer so the magazine opens instead of just downloading
          return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
    } catch (e) {
      console.error('Error normalizing PDF URL:', e)
    }

    return finalUrl
  }

  const handleView = async (magazine: Magazine) => {
    console.log('🎯 handleView called for:', magazine.title)

    if (!magazine.pdfUrl) {
      console.log('❌ No PDF URL found for magazine:', magazine.title)
      toast.error(t('view_error', 'PDF not available for this magazine', 'இந்த இதழுக்கு PDF கிடைக்கவில்லை'))
      return
    }

    try {
      // Process URL if needed (Google Drive, etc.)
      const finalUrl = normalizePdfUrl(magazine.pdfUrl)
      console.log(`🌐 Final PDF URL: ${finalUrl}`)

      // Always try to open in a NEW TAB only
      const newWindow = window.open(finalUrl, '_blank', 'noopener,noreferrer')

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log('❌ Popup blocked or failed to open')
        // Do NOT navigate the current tab anymore – just inform the user
        toast.error(
          t(
            'popup_blocked',
            'Popup was blocked. Please allow popups for this site or open the link in a new tab.',
            'பாப்-அப் தடுக்கப்பட்டது. தயவுசெய்து இந்த தளத்திற்கு பாப்-அப் அனுமதிக்கவும் அல்லது இணைப்பை புதிய டேபில் திறக்கவும்.'
          ),
          { icon: '⚠️' }
        )
      } else {
        toast.success(t('view_started', 'Opening PDF in new tab...', 'PDF புதிய டேபில் திறக்கப்படுகிறது...'))
      }

      // Track view as download in database
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
        }
      } catch (apiError) {
        console.error('View tracking API failed:', apiError)
      }

      console.log(`👁️ Viewing: ${magazine.title} - URL: ${finalUrl}`)
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

  const handleImageError = (magazineId: string) => {
    console.error('❌ Image failed to load for magazine:', magazineId)
    setImageErrors(prev => new Set(prev).add(magazineId))
  }

	  const handleLike = async (magazine: Magazine) => {
	    const isLiked = likedMagazines.has(magazine.id)

	    try {
	      const newSet = new Set(likedMagazines)
	      const action = isLiked ? 'unlike' : 'like'

	      if (isLiked) {
	        // Unlike
	        newSet.delete(magazine.id)
	        updateLikedMagazines(newSet)
	        toast.success(t('unliked', 'Removed from favorites', 'பிடித்தவைகளிலிருந்து நீக்கப்பட்டது'))
	      } else {
	        // Like
	        newSet.add(magazine.id)
	        updateLikedMagazines(newSet)
	        toast.success(t('liked', 'Added to favorites', 'பிடித்தவைகளில் சேர்க்கப்பட்டது'))
	      }

	      // Call API to update likes count in database
	      try {
	        const response = await fetch(`/api/magazines/${magazine.id}/like`, {
	          method: 'POST',
	          headers: {
	            'Content-Type': 'application/json'
	          },
	          body: JSON.stringify({ action })
	        })

	        if (response.ok) {
	          const data = await response.json()
	          console.log(`✅ Like updated in DB. New count: ${data.likes}`)

	          // Update the magazine data with new likes count
	          setMagazines(prev => prev.map(m =>
	            m.id === magazine.id ? { ...m, likes: data.likes } : m
	          ))
	        }
	      } catch (apiError) {
	        console.error('API call failed:', apiError)
	      }

	      console.log(`❤️ ${isLiked ? 'Unliked' : 'Liked'}: ${magazine.title}`)
	    } catch (error) {
	      toast.error(t('like_failed', 'Action failed', 'செயல் தோல்வியடைந்தது'))
	    }
	  }

  // Handle WhatsApp share
  const handleWhatsAppShare = async (magazine: Magazine) => {
    const magazineTitle = magazine.title_ta || magazine.title
    const shareUrl = `${window.location.origin}/epaper`
    const shareText = `${magazineTitle} - Hello Madurai\n${shareUrl}`

    // Open WhatsApp directly
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

    // For iOS Safari compatibility
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = whatsappUrl
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Handle Facebook share
  const handleFacebookShare = async (magazine: Magazine) => {
    const shareUrl = `${window.location.origin}/epaper`

    // Open Facebook sharer
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`

    // For iOS Safari compatibility
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = facebookUrl
    } else {
      window.open(facebookUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Handle copy link
  const handleCopyLink = async (magazine: Magazine) => {
    const shareUrl = `${window.location.origin}/epaper`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('link_copied', 'Link copied to clipboard', 'இணைப்பு கிளிப்போர்டில் நகலெடுக்கப்பட்டது'))
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error(t('copy_failed', 'Failed to copy link', 'இணைப்பை நகலெடுக்க முடியவில்லை'))
    }
  }

  const [shareDropdownOpen, setShareDropdownOpen] = useState<string | null>(null)

  const handleShareToggle = (magazineId: string) => {
    setShareDropdownOpen(shareDropdownOpen === magazineId ? null : magazineId)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            <TranslatedText tamil="பத்திரிகைகள் ஏற்றப்படுகின்றன...">
              Loading magazines...
            </TranslatedText>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - Centered */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <TranslatedText tamil="மின்னிதழ்">E-Paper</TranslatedText>
        </h1>
        <p className="text-gray-600">
          <TranslatedText tamil="எங்கள் டிஜிட்டல் பத்திரிகைகளைப் படித்து பதிவிறக்கம் செய்யுங்கள்">
            Read and download our digital magazines
          </TranslatedText>
        </p>
      </div>

      {/* Category Filters - Matching Videos Section Style */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4" suppressHydrationWarning>
          {t('epaper.categories', 'Categories', 'வகைகள்')}
        </h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant={selectedCollection === collection.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCollection(collection.id)}
              suppressHydrationWarning
            >
              {language === 'ta' ? (collection.name_ta || collection.name) : collection.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Magazines Grid */}
      {filteredMagazines.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            <TranslatedText tamil="பத்திரிகைகள் எதுவும் கிடைக்கவில்லை">No magazines found</TranslatedText>
          </h3>
          <p className="text-gray-600">
            <TranslatedText tamil="புதிய வெளியீடுகளுக்கு பின்னர் சரிபார்க்கவும்">
              Check back later for new publications
            </TranslatedText>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredMagazines.map((magazine) => (
            <Card
              key={magazine.id}
              hover
              padding="sm"
              className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white rounded-lg overflow-hidden !p-0"
            >
              {/* Cover Image - Clickable to Open PDF */}
              <div
                className="relative w-full overflow-hidden group cursor-pointer"
                onClick={() => handleView(magazine)}
              >
                {/* Show cover image if available and not errored */}
                {(magazine.coverImage || magazine.featuredImage) && !imageErrors.has(magazine.id) ? (
                  <>
                    {/* Actual Cover Image */}
                    <img
                      src={magazine.coverImage || magazine.featuredImage}
                      alt={`${magazine.title} cover`}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      onLoad={() => console.log('✅ Cover loaded:', magazine.title)}
                      onError={() => {
                        console.error('❌ Cover failed:', magazine.title, magazine.coverImage || magazine.featuredImage)
                        handleImageError(magazine.id)
                      }}
                    />

                    {/* Hover overlay with eye icon - only visible on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-4 shadow-lg">
                        <Eye className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    {/* "Click to open PDF" label on hover */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <p className="text-white text-sm font-medium text-center">
                        <TranslatedText tamil="PDF திறக்க கிளிக் செய்யவும்">Click to open PDF</TranslatedText>
                      </p>
                    </div>
                  </>
                ) : (
                  /* Fallback placeholder when no image or image failed */
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center transition-transform group-hover:scale-105">
                    <div className="text-center p-6">
                      <FileText className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                      <p className="text-base text-blue-600 font-semibold mb-1">
                        <TranslatedText tamil="PDF இதழ்">PDF Magazine</TranslatedText>
                      </p>
                      <p className="text-sm text-blue-500">
                        <TranslatedText tamil="திறக்க கிளிக் செய்யவும்">Click to open</TranslatedText>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Magazine Details */}
              <div className="p-3">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                  <TranslatedText tamil={magazine.title_ta || magazine.title}>
                    {magazine.title}
                  </TranslatedText>
                </h3>

                {/* Magazine Info */}
                <div className="space-y-1.5 mb-3">
                  {magazine.issueNumber && (
                    <div className="flex items-center text-xs text-gray-600">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      <TranslatedText tamil="இதழ்">Issue</TranslatedText>: {magazine.issueNumber}
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(magazine.publishedAt).toLocaleDateString(
                      language === 'ta' ? 'ta-IN' : 'en-IN'
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {magazine.downloads || 0} <TranslatedText tamil="பார்வைகள்">views</TranslatedText>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {magazine.likes || 0} <TranslatedText tamil="விருப்பங்கள்">likes</TranslatedText>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5">
                  {/* Download Button - Full Width */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(magazine)
                    }}
                    variant="primary"
                    size="sm"
                    disabled={!magazine.pdfUrl}
                    className="w-full text-xs py-1.5"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    <TranslatedText tamil="பதிவிறக்கம்">Download</TranslatedText>
                  </Button>

                  {/* Like and Share Buttons - Side by Side */}
                  <div className="flex gap-1.5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(magazine)
                      }}
                      variant={likedMagazines.has(magazine.id) ? "primary" : "outline"}
                      size="sm"
                      className="flex-1 py-1.5"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${likedMagazines.has(magazine.id) ? 'fill-current' : ''}`}
                      />
                    </Button>

                    {/* Share Button with Dropdown */}
                    <div className="flex-1 relative">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShareToggle(magazine.id)
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full py-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Share Dropdown */}
                      {shareDropdownOpen === magazine.id && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShareDropdownOpen(null)}
                          />

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                            {/* WhatsApp */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleWhatsAppShare(magazine)
                                setShareDropdownOpen(null)
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-2 text-sm transition-colors"
                            >
                              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              <span className="text-gray-700">WhatsApp</span>
                            </button>

                            {/* Facebook */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFacebookShare(magazine)
                                setShareDropdownOpen(null)
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-2 text-sm transition-colors"
                            >
                              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                              <span className="text-gray-700">Facebook</span>
                            </button>

                            {/* Copy Link */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyLink(magazine)
                                setShareDropdownOpen(null)
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
                            >
                              <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-700"><TranslatedText tamil="இணைப்பை நகலெடு">Copy Link</TranslatedText></span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
