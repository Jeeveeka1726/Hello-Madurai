'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { NewspaperIcon, VideoCameraIcon, MicrophoneIcon, DocumentIcon, PhoneIcon } from '@heroicons/react/24/outline'
import NewHeader from '@/components/layout/NewHeader'

export default function RootPage() {
  const { t } = useLanguage()

  const features = [
    {
      name: t('nav.news', 'News', 'செய்திகள்'),
      description: t('home.newsDesc', 'Latest news from Madurai', 'மதுரையின் சமீபத்திய செய்திகள்'),
      href: '/news',
      icon: NewspaperIcon,
      color: 'bg-blue-500'
    },
    {
      name: t('nav.videos', 'Videos', 'வீடியோக்கள்'),
      description: t('home.videosDesc', 'Watch local videos and content', 'உள்ளூர் வீடியோக்கள் மற்றும் உள்ளடக்கத்தைப் பார்க்கவும்'),
      href: '/videos',
      icon: VideoCameraIcon,
      color: 'bg-red-500'
    },
    {
      name: t('nav.radio', 'Radio', 'வானொலி'),
      description: t('home.radioDesc', 'Listen to local radio shows', 'உள்ளூர் வானொலி நிகழ்ச்சிகளைக் கேளுங்கள்'),
      href: '/radio',
      icon: MicrophoneIcon,
      color: 'bg-purple-500'
    },
    {
      name: t('nav.magazine', 'Magazine', 'பத்திரிகை'),
      description: t('home.magazineDesc', 'Read digital magazines', 'டிஜிட்டல் பத்திரிகைகளைப் படியுங்கள்'),
      href: '/magazine',
      icon: DocumentIcon,
      color: 'bg-green-500'
    },
    {
      name: t('nav.contact', 'Contact', 'தொடர்பு'),
      description: t('home.contactDesc', 'Get in touch with us', 'எங்களுடன் தொடர்பு கொள்ளுங்கள்'),
      href: '/contact',
      icon: PhoneIcon,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="min-h-screen bg-purple-950">
      <NewHeader />
      <div className="min-h-screen bg-purple-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-800 dark:to-purple-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {t('home.title', 'Hello Madurai', 'ஹலோ மதுரை')}
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
                {t('home.subtitle', 'Your gateway to Madurai - News, Videos, Radio & More', 'மதுரைக்கான உங்கள் நுழைவாயில் - செய்திகள், வீடியோக்கள், வானொலி மற்றும் பலவும்')}
              </p>
              <Link
                href="/news"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                {t('home.exploreNews', 'Explore Latest News', 'சமீபத்திய செய்திகளை ஆராயுங்கள்')}
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.featuresTitle', 'Discover Madurai', 'மதுரையை கண்டறியுங்கள்')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('home.featuresSubtitle', 'Everything you need to stay connected with your city', 'உங்கள் நகரத்துடன் இணைந்திருக்க தேவையான அனைத்தும்')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.name} href={feature.href}>
                  <div className="bg-purple-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 cursor-pointer group">
                    <div className={`inline-flex items-center justify-center p-3 ${feature.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.name}
                    </h3>
                    <p className="text-purple-200">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-purple-50 dark:bg-purple-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t('home.ctaTitle', 'Stay Updated', 'புதுப்பித்த நிலையில் இருங்கள்')}
              </h2>
              <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto">
                {t('home.ctaSubtitle', 'Get the latest news, videos, and content from Madurai delivered to you', 'மதுரையின் சமீபத்திய செய்திகள், வீடியோக்கள் மற்றும் உள்ளடக்கத்தை உங்களுக்கு வழங்கப்படும்')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/news"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                >
                  {t('home.readNews', 'Read News', 'செய்திகளைப் படியுங்கள்')}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-purple-600 text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 transition-colors duration-200"
                >
                  {t('home.contactUs', 'Contact Us', 'எங்களை தொடர்பு கொள்ளுங்கள்')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

