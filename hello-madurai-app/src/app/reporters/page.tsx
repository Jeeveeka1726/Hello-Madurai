'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/outline'
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
}

export default function ReportersPage() {
  const { language } = useLanguage()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors')
      if (response.ok) {
        const data = await response.json()
        setAuthors(data)
      }
    } catch (error) {
      console.error('Error fetching authors:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <NewHeader />
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#1e3a8a' }}>
              {language === 'ta' ? 'எங்கள் குழு உறுப்பினர்கள்' : 'Our Team Members'}
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {language === 'ta'
                ? 'நம்பகமான செய்திகள், வானொலி நிகழ்ச்சிகள் மற்றும் டிஜிட்டல் ஊடக உள்ளடக்கங்களை வழங்கும் ஹலோ மதுரை குழுவினரை அறிந்து கொள்ளுங்கள்.'
                : 'Meet the Hello Madurai team delivering trusted news, radio, and digital media content.'
              }
            </p>
          </div>

          {/* Authors Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">
                {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
              </p>
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600">
                {language === 'ta' ? 'குழு உறுப்பினர்கள் இல்லை' : 'No team members found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {authors.map((author) => (
                <Link key={author.id} href={`/reporters/${author.slug}`}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white border-gray-200">
                    <CardContent className="p-6 text-center">
                      {/* Author Image */}
                      <div className="mb-4 flex justify-center">
                        {author.imageUrl ? (
                          <div className="relative w-32 h-32">
                            <img
                              src={author.imageUrl}
                              alt={language === 'ta' && author.name_ta ? author.name_ta : author.name}
                              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-blue-200 aspect-square"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-blue-200 aspect-square">
                            <UserIcon className="h-16 w-16 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Author Name */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {language === 'ta' && author.name_ta ? author.name_ta : author.name}
                      </h3>

                      {/* Featured Badge */}
                      {author.featured && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-2">
                          {language === 'ta' ? 'சிறப்பு செய்தியாளர்' : 'Featured Reporter'}
                        </span>
                      )}

                      {/* Description Preview */}
                      {(author.description || author.description_ta) && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {language === 'ta' && author.description_ta 
                            ? author.description_ta 
                            : author.description
                          }
                        </p>
                      )}

                      {/* View Profile Link */}
                      <div className="mt-4">
                        <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
                          {language === 'ta' ? 'விவரங்களைக் காண்க →' : 'View Profile →'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
