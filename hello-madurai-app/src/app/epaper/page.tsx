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
import {
  WhatsappShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  FacebookIcon,
  TelegramIcon,
  TwitterIcon
} from 'react-share'

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
  month?: string
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
          month: data[0].month,
          pdfUrl: data[0].pdfUrl,
          coverImage: data[0].coverImage,
          featuredImage: data[0].featuredImage,
          collection: data[0].collection
        } : 'No magazines found')

        // Debug all magazines
        data.forEach((mag: Magazine, index: number) => {
          console.log(`📖 Magazine ${index + 1}:`, {
            title: mag.title,
            month: mag.month || '❌ NO MONTH SET',
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

  // Get share URL for a specific magazine
  const getShareUrl = (magazine: Magazine) => {
    return `${window.location.origin}/epaper/share/${magazine.id}`
  }

  // Handle copy link
  const handleCopyLink = async (magazine: Magazine) => {
    const shareUrl = getShareUrl(magazine)

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('link_copied', 'Link copied to clipboard', 'இணைப்பு கிளிப்போர்டில் நகலெடுக்கப்பட்டது'))
      setShareDropdownOpen(null)
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
    <div className="min-h-screen bg-white">
      {/* Header Section - No padding on mobile */}
      <div className="py-4 bg-white">
        <div className="text-center px-4 md:px-0">
          <div className="flex items-center justify-center mb-1">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <TranslatedText tamil="மின்னிதழ்">E-Paper</TranslatedText>
            </h1>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-3">
            <TranslatedText tamil="எங்கள் டிஜிட்டல் பத்திரிகைகளைப் படித்து பதிவிறக்கம் செய்யுங்கள்">
              Read and download our digital magazines
            </TranslatedText>
          </p>

          {/* Category Filter */}
          {collections.length > 0 && (
            <div className="mb-2">
              <p className="text-gray-700 font-semibold mb-2 text-center text-sm">
                <TranslatedText tamil="வகையைத் தேர்ந்தெடுக்கவும்">Select Category</TranslatedText>
              </p>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max justify-center px-4 md:px-0">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setSelectedCollection(collection.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm ${
                        selectedCollection === collection.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {language === 'ta' ? (collection.name_ta || collection.name) : collection.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Magazines Grid - 3x3 Portrait Grid on Desktop, Full width on Mobile */}
      {filteredMagazines.length === 0 ? (
        <div className="text-center py-12 px-4">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            <TranslatedText tamil="தற்போது பத்திரிகைகள் இல்லை">No magazines available at the moment</TranslatedText>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-4 lg:gap-6 sm:px-4">
          {filteredMagazines.map((magazine) => (
            <div key={magazine.id} className="mb-6 sm:mb-0 bg-white sm:rounded-lg sm:shadow-md sm:hover:shadow-xl sm:transition-all sm:duration-300 overflow-hidden flex flex-col">
              {/* Magazine Cover Image - Full width on mobile, portrait on desktop */}
              <div
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => handleView(magazine)}
              >
                {/* Show cover image if available and not errored */}
                {(magazine.coverImage || magazine.featuredImage) && !imageErrors.has(magazine.id) ? (
                  <>
                    <img
                      src={magazine.coverImage || magazine.featuredImage}
                      alt={language === 'ta' && magazine.title_ta ? magazine.title_ta : magazine.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 aspect-[3/4]"
                      onLoad={() => console.log('✅ Cover loaded:', magazine.title)}
                      onError={() => {
                        console.error('❌ Cover failed:', magazine.title, magazine.coverImage || magazine.featuredImage)
                        handleImageError(magazine.id)
                      }}
                    />
                    {/* Hover overlay with eye icon */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Fallback placeholder when no image or image failed */
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center p-6">
                      <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-blue-600 font-semibold mb-1">
                        <TranslatedText tamil="PDF இதழ்">PDF Magazine</TranslatedText>
                      </p>
                      <p className="text-xs text-blue-500">
                        <TranslatedText tamil="திறக்க கிளிக் செய்யவும்">Click to open</TranslatedText>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Magazine Info & Actions - Compact and close to image */}
              <div className="flex flex-col gap-2 py-3 px-2 bg-white sm:px-3">
                {/* Month - Centered (show month if available, otherwise show title) */}
                {magazine.month && (
                  <div className="w-full text-center mb-1">
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {magazine.month}
                    </p>
                  </div>
                )}

                {/* Action Buttons - Compact */}
                <div className="flex gap-2 items-center justify-center">
                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(magazine)
                    }}
                    disabled={!magazine.pdfUrl}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-3 rounded-lg text-center transition-all shadow-md hover:shadow-lg text-xs transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <TranslatedText tamil="பதிவிறக்கம்">Download</TranslatedText>
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(magazine)
                    }}
                    className={`p-2 rounded-lg transition-all shadow-sm hover:shadow-md border ${
                      likedMagazines.has(magazine.id)
                        ? 'bg-red-50 border-red-300 hover:bg-red-100'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                    }`}
                    aria-label="Like"
                    title={language === 'ta' ? 'விருப்பம்' : 'Like'}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        likedMagazines.has(magazine.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'
                      }`}
                    />
                  </button>

                  {/* Share Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShareToggle(magazine.id)
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all shadow-sm hover:shadow-md border border-gray-300"
                      aria-label="Share"
                      title={language === 'ta' ? 'பகிர்' : 'Share'}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>

                    {/* Share Dropdown */}
                    {shareDropdownOpen === magazine.id && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShareDropdownOpen(null)}
                        />

                        {/* Share Menu with react-share */}
                        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-20 min-w-[280px]">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            {language === 'ta' ? 'இதில் பகிரவும்:' : 'Share to:'}
                          </p>
                          <div className="flex gap-3 justify-center mb-4">
                            {/* WhatsApp */}
                            <WhatsappShareButton
                              url={getShareUrl(magazine)}
                              title={`${magazine.title_ta || magazine.title} - Hello Madurai`}
                              onClick={() => setShareDropdownOpen(null)}
                            >
                              <div className="flex flex-col items-center gap-1 transform hover:scale-110 transition-transform">
                                <WhatsappIcon size={48} round />
                                <span className="text-xs text-gray-600">WhatsApp</span>
                              </div>
                            </WhatsappShareButton>

                            {/* Facebook - Use direct URL for better Open Graph support */}
                            <button
                              onClick={() => {
                                const shareUrl = getShareUrl(magazine)
                                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                                window.open(facebookUrl, '_blank', 'width=600,height=400')
                                setShareDropdownOpen(null)
                              }}
                              className="transform hover:scale-110 transition-transform cursor-pointer"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <FacebookIcon size={48} round />
                                <span className="text-xs text-gray-600">Facebook</span>
                              </div>
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 mb-2 px-1">
                            {language === 'ta' ? 'மேலும் விருப்பங்கள்:' : 'More options:'}
                          </p>
                          <div className="flex gap-2 justify-center mb-3">
                            <TwitterShareButton
                              url={getShareUrl(magazine)}
                              title={`${magazine.title_ta || magazine.title} - Hello Madurai`}
                              onClick={() => setShareDropdownOpen(null)}
                            >
                              <TwitterIcon size={32} round />
                            </TwitterShareButton>

                            <TelegramShareButton
                              url={getShareUrl(magazine)}
                              title={`${magazine.title_ta || magazine.title} - Hello Madurai`}
                              onClick={() => setShareDropdownOpen(null)}
                            >
                              <TelegramIcon size={32} round />
                            </TelegramShareButton>
                          </div>

                          {/* Copy Link Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyLink(magazine)
                            }}
                            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <TranslatedText tamil="இணைப்பை நகலெடு">Copy Link</TranslatedText>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
