'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Link from 'next/link'
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Card, { CardContent } from '@/components/ui/Card'

interface Author {
  id: string
  name: string
  name_ta: string | null
  slug: string
  imageUrl: string | null
  description: string | null
  description_ta: string | null
  featured: boolean
  createdAt: string
}

export default function ReporterDetailPage() {
  const params = useParams()
  const { language } = useLanguage()
  const [author, setAuthor] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchAuthor(params.slug as string)
    }
  }, [params.slug])

  const fetchAuthor = async (slug: string) => {
    try {
      const response = await fetch(`/api/authors/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setAuthor(data)
      }
    } catch (error) {
      console.error('Error fetching author:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <NewHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <NewHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">
              {language === 'ta' ? 'குழு உறுப்பினர் கிடைக்கவில்லை' : 'Team member not found'}
            </p>
            <Link href="/reporters" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              {language === 'ta' ? 'எங்கள் குழுவிற்குத் திரும்பு' : 'Back to Our Team'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <NewHeader />
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/reporters"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {language === 'ta' ? 'எங்கள் குழுவிற்குத் திரும்பு' : 'Back to Our Team'}
          </Link>

          <Card className="bg-white border-gray-200 shadow-xl">
            <CardContent className="p-8">
              {/* Author Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
                {/* Author Image */}
                <div className="flex-shrink-0">
                  {author.imageUrl ? (
                    <div className="relative w-40 h-40">
                      <img
                        src={author.imageUrl}
                        alt={language === 'ta' && author.name_ta ? author.name_ta : author.name}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-200 aspect-square"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200 aspect-square">
                      <UserIcon className="h-20 w-20 text-white" />
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {language === 'ta' && author.name_ta ? author.name_ta : author.name}
                  </h1>
                  
                  {/* Show both names if available */}
                  {author.name_ta && language === 'en' && (
                    <p className="text-lg text-gray-600 mb-3">{author.name_ta}</p>
                  )}
                  {author.name_ta && language === 'ta' && (
                    <p className="text-lg text-gray-600 mb-3">{author.name}</p>
                  )}

                  {author.featured && (
                    <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {language === 'ta' ? 'சிறப்பு செய்தியாளர்' : 'Featured Reporter'}
                    </span>
                  )}
                </div>
              </div>

              {/* Author Description */}
              {(author.description || author.description_ta) && (
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {language === 'ta' ? 'இவரைப் பற்றி' : 'About'}
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                    {language === 'ta' && author.description_ta
                      ? author.description_ta
                      : author.description
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
