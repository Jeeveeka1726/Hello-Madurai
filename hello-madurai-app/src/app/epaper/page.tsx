'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Download, Calendar, FileText, Folder } from 'lucide-react'
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
  coverImageUrl?: string
  collection?: {
    id: string
    name: string
    name_ta?: string
  }
}

export default function EpaperPage() {
  const { language, t } = useLanguage()
  const [collections, setCollections] = useState<Collection[]>([])
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
    fetchMagazines()
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
    }
  }

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/magazines')
      if (response.ok) {
        const data = await response.json()
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

  const handleDownload = async (magazine: Magazine) => {
    if (!magazine.pdfUrl) {
      toast.error(t('download_error', 'PDF not available', 'PDF கிடைக்கவில்லை'))
      return
    }

    try {
      // Open PDF in new tab for viewing/downloading
      window.open(magazine.pdfUrl, '_blank')
      toast.success(t('download_started', 'Opening PDF...', 'PDF திறக்கப்படுகிறது...'))
    } catch (error) {
      toast.error(t('download_failed', 'Download failed', 'பதிவிறக்கம் தோல்வியடைந்தது'))
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

      {/* Collections Filter */}
      {collections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            <TranslatedText english="Collections" tamil="தொகுப்புகள்" />
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCollection === null ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedCollection(null)}
              className="mb-2"
            >
              <Folder className="w-4 h-4 mr-2" />
              <TranslatedText english="All" tamil="அனைத்தும்" />
            </Button>
            {collections.map((collection) => (
              <Button
                key={collection.id}
                variant={selectedCollection === collection.id ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedCollection(collection.id)}
                className="mb-2"
              >
                <Folder className="w-4 h-4 mr-2" />
                <TranslatedText
                  english={collection.name}
                  tamil={collection.name_ta || collection.name}
                />
                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                  {collection._count.magazines}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMagazines.map((magazine) => (
            <Card key={magazine.id} hover className="transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <TranslatedText
                    english={magazine.title}
                    tamil={magazine.title_ta || magazine.title}
                  />
                </CardTitle>
                {magazine.collection && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mt-2">
                    <TranslatedText
                      english={magazine.collection.name}
                      tamil={magazine.collection.name_ta || magazine.collection.name}
                    />
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                  <Button
                    onClick={() => handleDownload(magazine)}
                    fullWidth
                    disabled={!magazine.pdfUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <TranslatedText english="Read PDF" tamil="PDF படிக்க" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
