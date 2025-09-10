'use client'

// import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CalendarIcon,
  EyeIcon,
  UserIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Mock data - will be replaced with Supabase data
const mockNewsArticle = {
  id: '1',
  title: 'Madurai Corporation Announces New Development Projects',
  title_ta: 'மதுரை மாநகராட்சி புதிய வளர்ச்சி திட்டங்களை அறிவித்தது',
  content: `The Madurai Corporation has announced several new infrastructure development projects for the upcoming fiscal year. These projects include road improvements, water supply enhancements, and new public facilities.

The corporation's mayor stated that these developments will significantly improve the quality of life for residents. The projects are expected to be completed within the next two years.

Key highlights of the announcement include:
- Road widening and resurfacing in major areas
- Installation of new water pipelines
- Construction of community centers
- Improvement of drainage systems
- Development of new parks and recreational facilities

The total budget allocated for these projects is ₹50 crores, which will be funded through a combination of state government grants and municipal funds.`,
  content_ta: `மதுரை மாநகராட்சி வரவிருக்கும் நிதியாண்டுக்கான பல புதிய உள்கட்டமைப்பு வளர்ச்சி திட்டங்களை அறிவித்துள்ளது. இந்த திட்டங்களில் சாலை மேம்பாடுகள், நீர் வழங்கல் மேம்பாடுகள் மற்றும் புதிய பொது வசதிகள் அடங்கும்.

இந்த வளர்ச்சிகள் குடியிருப்பாளர்களின் வாழ்க்கைத் தரத்தை கணிசமாக மேம்படுத்தும் என மாநகராட்சி மேயர் தெரிவித்தார். இந்த திட்டங்கள் அடுத்த இரண்டு ஆண்டுகளுக்குள் முடிக்கப்படும் என எதிர்பார்க்கப்படுகிறது.

அறிவிப்பின் முக்கிய அம்சங்கள்:
- முக்கிய பகுதிகளில் சாலை விரிவாக்கம் மற்றும் மறு அமைப்பு
- புதிய நீர் குழாய்கள் நிறுவுதல்
- சமுதாய மையங்கள் கட்டுமானம்
- வடிகால் அமைப்புகளின் மேம்பாடு
- புதிய பூங்காக்கள் மற்றும் பொழுதுபோக்கு வசதிகளின் வளர்ச்சி

இந்த திட்டங்களுக்கு ஒதுக்கப்பட்ட மொத்த பட்ஜெட் ₹50 கோடி ஆகும், இது மாநில அரசு மானியங்கள் மற்றும் நகராட்சி நிதிகளின் கலவையால் நிதியளிக்கப்படும்.`,
  excerpt: 'The Madurai Corporation has announced several new infrastructure development projects for the upcoming fiscal year.',
  excerpt_ta: 'மதுரை மாநகராட்சி வரவிருக்கும் நிதியாண்டுக்கான பல புதிய உள்கட்டமைப்பு வளர்ச்சி திட்டங்களை அறிவித்துள்ளது.',
  category: 'corporation',
  featured_image: '/images/news/corporation-news.jpg',
  author: 'Admin',
  views_count: 245,
  created_at: '2024-01-15T10:30:00Z'
}

export default function NewsArticlePage() {
  const params = useParams()
  const [locale, setLocale] = useState('en')
  const [id, setId] = useState('')

  useEffect(() => {
    if (params) {
      setLocale(params.locale as string || 'en')
      setId(params.id as string || '')
    }
  }, [params])

  // const t = await getTranslations()

  // In a real app, fetch the article from Supabase
  const article = mockNewsArticle
  
  if (!article) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: locale === 'ta' ? article.title_ta : article.title,
          text: locale === 'ta' ? article.excerpt_ta : article.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert(locale === 'ta' ? 'लिंक कॉपी किया गया' : 'Link copied to clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/${locale}/news`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {locale === 'ta' ? 'செய்திகளுக்கு திரும்பு' : 'Back to News'}
            </Button>
          </Link>
        </div>

        {/* Article */}
        <Card className="overflow-hidden">
          {/* Featured Image */}
          {article.featured_image && (
            <div className="-mx-6 -mt-6 mb-6">
              <img
                src={article.featured_image || '/images/placeholder-news.jpg'}
                alt={locale === 'ta' ? article.title_ta : article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {locale === 'ta' ? 'மாநகராட்சி' : 'Corporation'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4 mr-2" />
                {locale === 'ta' ? 'பகிர்' : 'Share'}
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'ta' ? article.title_ta : article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {article.author}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(article.created_at)}
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {article.views_count} {locale === 'ta' ? 'பார்வைகள்' : 'views'}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {locale === 'ta' ? article.content_ta : article.content}
            </div>
          </div>

          {/* Article Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {locale === 'ta' 
                  ? 'இந்த கட்டுரை உங்களுக்கு பயனுள்ளதாக இருந்ததா?'
                  : 'Was this article helpful?'
                }
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <ShareIcon className="h-4 w-4 mr-2" />
                {locale === 'ta' ? 'பகிர்' : 'Share'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Related News */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'தொடர்புடைய செய்திகள்' : 'Related News'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mock related articles */}
            <Link href={`/${locale}/news/2`}>
              <Card hover>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'ta' 
                    ? 'விவசாயிகளுக்கு புதிய வேளாண் திட்டம்'
                    : 'New Agricultural Scheme for Farmers'
                  }
                </h3>
                <p className="text-gray-600 text-sm">
                  {locale === 'ta'
                    ? 'உள்ளூர் விவசாயிகளுக்கு உதவும் புதிய திட்டம் அறிவிக்கப்பட்டுள்ளது...'
                    : 'A new scheme to help local farmers has been announced...'
                  }
                </p>
              </Card>
            </Link>
            <Link href={`/${locale}/news/3`}>
              <Card hover>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {locale === 'ta'
                    ? 'போக்குவரத்து பாதுகாப்பு நடவடிக்கைகள்'
                    : 'Traffic Safety Measures'
                  }
                </h3>
                <p className="text-gray-600 text-sm">
                  {locale === 'ta'
                    ? 'நகரத்தில் விபத்துகளை குறைக்க புதிய நடவடிக்கைகள்...'
                    : 'New measures to reduce accidents in the city...'
                  }
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
