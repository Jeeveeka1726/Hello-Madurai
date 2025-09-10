'use client'

import Link from 'next/link'
import { 
  NewspaperIcon,
  CalendarIcon,
  RadioIcon,
  BookOpenIcon,
  VideoCameraIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  const { t } = useLanguage()

  const features = [
    {
      name: t('features.news.title', 'Local News', 'உள்ளூர் செய்திகள்'),
      description: t('features.news.desc', 'Stay updated with the latest news from Madurai', 'மதுரையின் சமீபத்திய செய்திகளுடன் புதுப்பித்த நிலையில் இருங்கள்'),
      href: '/news',
      icon: NewspaperIcon,
      color: 'bg-blue-500'
    },
    {
      name: t('features.events.title', 'Events', 'நிகழ்வுகள்'),
      description: t('features.events.desc', 'Discover festivals and cultural events', 'திருவிழாக்கள் மற்றும் கலாச்சார நிகழ்வுகளை கண்டறியுங்கள்'),
      href: '/events',
      icon: CalendarIcon,
      color: 'bg-green-500'
    },
    {
      name: t('features.podcast.title', 'Hello Madurai Podcasts', 'ஹலோ மதுரை பாட்காஸ்ட்கள்'),
      description: t('features.podcast.desc', 'Listen to local stories and discussions', 'உள்ளூர் கதைகள் மற்றும் விவாதங்களைக் கேளுங்கள்'),
      href: '/radio',
      icon: RadioIcon,
      color: 'bg-purple-500'
    },
    {
      name: t('features.magazine.title', 'E-Magazine', 'மின்-பத்திரிகை'),
      description: t('features.magazine.desc', 'Read our digital magazine', 'எங்கள் டிஜிட்டல் பத்திரிகையைப் படியுங்கள்'),
      href: '/magazine',
      icon: BookOpenIcon,
      color: 'bg-orange-500'
    },
    {
      name: t('features.videos.title', 'Videos', 'வீடியோக்கள்'),
      description: t('features.videos.desc', 'Watch local business and cultural videos', 'உள்ளூர் வணிகம் மற்றும் கலாச்சார வீடியோக்களைப் பார்க்கவும்'),
      href: '/videos',
      icon: VideoCameraIcon,
      color: 'bg-red-500'
    },
    {
      name: t('features.directory.title', 'Business Directory', 'வணிக முகவரி நூல்'),
      description: t('features.directory.desc', 'Find local businesses and services', 'உள்ளூர் வணிகங்கள் மற்றும் சேவைகளைக் கண்டறியுங்கள்'),
      href: '/directory',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t('hero.title', 'Hello Madurai', 'ஹலோ மதுரை')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              {t('hero.subtitle', 'Your gateway to local news, events, and community information in Madurai', 'மதுரையில் உள்ளூர் செய்திகள், நிகழ்வுகள் மற்றும் சமூக தகவல்களுக்கான உங்கள் நுழைவாயில்')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/news"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors duration-200"
              >
                {t('hero.cta.primary', 'Latest News', 'சமீபத்திய செய்திகள்')}
              </Link>
              <Link
                href="/events"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                {t('hero.cta.secondary', 'Upcoming Events', 'வரவிருக்கும் நிகழ்வுகள்')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('features.title', 'Explore Madurai', 'மதுரையை ஆராயுங்கள்')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('features.subtitle', 'Everything you need to stay connected with your community', 'உங்கள் சமூகத்துடன் இணைந்திருக்க தேவையான அனைத்தும்')}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.name} href={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-gray-900 dark:text-white">
                        {feature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t('stats.title', 'Serving Madurai Community', 'மதுரை சமூகத்திற்கு சேவை செய்தல்')}
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">1000+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {t('stats.news', 'News Articles', 'செய்தி கட்டுரைகள்')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">500+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {t('stats.events', 'Events Covered', 'நிகழ்வுகள் உள்ளடக்கம்')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {t('stats.radio', 'Radio Service', 'வானொலி சேவை')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">50+</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {t('stats.businesses', 'Local Businesses', 'உள்ளூர் வணிகங்கள்')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
