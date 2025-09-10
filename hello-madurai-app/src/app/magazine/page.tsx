'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DocumentArrowDownIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
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
  publishedAt: string
  downloads: number
  featured: boolean
}

export default function MagazinePage() {
  const { t } = useLanguage()
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch magazines from database
  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        console.log('Fetching magazines from API...')
        const response = await fetch('/api/admin/magazines')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched magazines data:', data)
          setMagazines(data)
        } else {
          console.error('Failed to fetch magazines, status:', response.status)
        }
      } catch (error) {
        console.error('Error fetching magazines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMagazines()
  }, [])

  // Hardcoded magazines removed - now using database data
  const fallbackMagazines = [
    {
      id: 1,
      title: 'Hello Madurai February 2019',
      title_ta: 'ஹலோ மதுரை பிப்ரவரி 2019',
      issueNumber: 1,
      publicationDate: '2019-02-01',
      pdfUrl: '/01.02.19-hello-madurai.pdf',
      description: 'February 2019 issue featuring local news, events, and community stories',
      description_ta: 'உள்ளூர் செய்திகள், நிகழ்வுகள் மற்றும் சமூக கதைகளைக் கொண்ட பிப்ரவரி 2019 இதழ்',
      downloadCount: 1250,
      featured: true
    },
    {
      id: 2,
      title: 'Hello Madurai September 2019',
      title_ta: 'ஹலோ மதுரை செப்டம்பர் 2019',
      issueNumber: 2,
      publicationDate: '2019-09-01',
      pdfUrl: '/01.09.19-hello-madurai.pdf',
      description: 'September 2019 issue with festival coverage and business directory',
      description_ta: 'திருவிழா கவரேஜ் மற்றும் வணிக அடைவுடன் செப்டம்பர் 2019 இதழ்',
      downloadCount: 980,
      featured: false
    },
    {
      id: 3,
      title: 'Hello Madurai October 2019',
      title_ta: 'ஹலோ மதுரை அக்டோபர் 2019',
      issueNumber: 3,
      publicationDate: '2019-10-01',
      pdfUrl: '/01.10.19-hello-madurai.pdf',
      description: 'October 2019 issue highlighting Diwali celebrations and local achievements',
      description_ta: 'தீபாவளி கொண்டாட்டங்கள் மற்றும் உள்ளூர் சாதனைகளை முன்னிலைப்படுத்தும் அக்டோபர் 2019 இதழ்',
      downloadCount: 1100,
      featured: true
    }
  ]

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

  const featuredMagazines = magazines.filter(mag => mag.featured)
  const regularMagazines = magazines.filter(mag => !mag.featured)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
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

        {/* Featured Issues */}
        {featuredMagazines.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('magazine.featured', 'Featured Issues', 'சிறப்பு இதழ்கள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredMagazines.map((magazine) => (
                <Card key={magazine.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <DocumentArrowDownIcon className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('magazine.issue', 'Issue', 'இதழ்')} #{magazine.issueNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {t('magazine.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(magazine.publicationDate)}
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
                        {(magazine.downloadCount || 0).toLocaleString()} {t('magazine.downloads', 'downloads', 'பதிவிறக்கங்கள்')}
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
                      {formatDate(magazine.publicationDate)}
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
                      {magazine.downloadCount.toLocaleString()}
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
