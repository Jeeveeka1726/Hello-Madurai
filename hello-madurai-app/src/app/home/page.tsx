'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import TranslatedText from '@/components/TranslatedText'
import {
  NewspaperIcon,
  VideoCameraIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MapIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  BookOpenIcon,
  RadioIcon
} from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { BannerAd, SquareAd, ResponsiveAd } from '@/components/ads/GoogleAdsense'

const featuredSections = [
  {
    name: 'news',
    href: '/news',
    icon: NewspaperIcon,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    description: 'Latest news from Madurai and surrounding areas'
  },
  {
    name: 'videos',
    href: '/videos',
    icon: VideoCameraIcon,
    color: 'bg-gradient-to-r from-purple-600 to-purple-700',
    description: 'Watch videos about local businesses, agriculture, and more'
  },
  {
    name: 'events',
    href: '/events',
    icon: CalendarIcon,
    color: 'bg-gradient-to-r from-purple-400 to-purple-500',
    description: 'Upcoming festivals, exhibitions, and cultural events'
  },
  {
    name: 'directory',
    href: '/directory',
    icon: BuildingOfficeIcon,
    color: 'bg-gradient-to-r from-purple-700 to-purple-800',
    description: 'Find local businesses, services, and contact information'
  },
  {
    name: 'magazine',
    href: '/magazine',
    icon: BookOpenIcon,
    color: 'bg-gradient-to-r from-purple-300 to-purple-400',
    description: 'Read digital magazines and publications'
  },
  {
    name: 'radio',
    href: '/radio',
    icon: RadioIcon,
    color: 'bg-gradient-to-r from-purple-800 to-purple-900',
    description: 'Listen to podcasts and radio shows'
  }
]

function HomePageContent() {
  const { t, language } = useLanguage()
  const [stats, setStats] = useState({
    news: 0,
    videos: 0,
    businesses: 0,
    events: 0
  })

  // Fetch real stats from database
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            news: data.newsCount || 0,
            videos: data.videosCount || 0,
            businesses: data.businessesCount || 0,
            events: data.eventsCount || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {t('hero.title', 'Welcome to Hello Madurai', 'ஹலோ மதுரைக்கு வரவேற்கிறோம்')}
            </h1>
            <p className="mt-6 text-xl leading-8 text-purple-100">
              {t('hero.subtitle', 'Your local news and information hub', 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/news">
                <Button size="lg" variant="secondary">
                  {t('nav.news', 'News', 'செய்திகள்')}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/directory">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                  {t('nav.directory', 'Directory', 'முகவரி நூல்')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <section className="py-8 bg-gray-50 dark:bg-purple-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BannerAd className="mx-auto" />
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-16 bg-white/80 dark:bg-purple-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold gradient-text sm:text-4xl">
              {t('sections.title', 'Main Sections', 'முக்கிய பிரிவுகள்')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('sections.subtitle', 'All of Madurai\'s information in one place', 'மதுரையின் அனைத்து தகவல்களும் ஒரே இடத்தில்')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSections.map((section) => (
              <Link key={section.name} href={section.href}>
                <Card hover className="h-full">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg ${section.color}`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardTitle className="mb-2">
                    {t(`nav.${section.name}`, section.name.charAt(0).toUpperCase() + section.name.slice(1), getNavigationTamil(section.name))}
                  </CardTitle>
                  <CardContent>
                    <p className="text-sm">
                      {t(`sections.description.${section.name}`, section.description, getDescriptionInTamil(section.name))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50 dark:bg-purple-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">{stats.news}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('stats.news', 'News Articles', 'செய்தி கட்டுரைகள்')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">{stats.videos}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('stats.videos', 'Videos', 'வீடியோக்கள்')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">{stats.businesses}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('stats.businesses', 'Business Listings', 'வணிக பட்டியல்')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">{stats.events}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('stats.events', 'Events', 'நிகழ்வুகள்')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 gradient-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t('cta.title', 'Stay Connected with Madurai', 'மதுரையுடன் இணைந்திருங்கள்')}
          </h2>
          <p className="mt-4 text-lg text-purple-100">
            {t('cta.subtitle', 'Get the latest news, events, and local information delivered to you', 'சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் உள்ளூர் தகவல்களை பெறுங்கள்')}
          </p>
          <div className="mt-8">
            <Link href="/news">
              <Button size="lg" variant="secondary">
                {t('cta.button', 'Get Started Now', 'இப்போதே ஆரம்பிக்கவும்')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function getNavigationTamil(sectionName: string): string {
  const navigation: Record<string, string> = {
    news: 'செய்திகள்',
    videos: 'வீடியோ',
    events: 'நிகழ்ச்சிகள்',
    directory: 'முகவரி நூல்',
    magazine: 'பத்திரிகை',
    radio: 'பாட்காஸ்ட்'
  }
  return navigation[sectionName] || sectionName
}

function getDescriptionInTamil(sectionName: string): string {
  const descriptions: Record<string, string> = {
    news: 'மதுரை மற்றும் சுற்றுவட்டார பகுதிகளின் சமீபத்திய செய்திகள்',
    videos: 'உள்ளூர் வணிகம், விவசாயம் மற்றும் பிற தொழில்கள் பற்றிய வீடியோக்கள்',
    events: 'வரவிருக்கும் திருவிழாக்கள், கண்காட்சிகள் மற்றும் கலாசார நிகழ்வுகள்',
    directory: 'உள்ளூர் வணிகங்கள், சேவைகள் மற்றும் தொடர்பு தகவல்களை கண்டறியுங்கள்',
    magazine: 'டிஜிட்டல் பத்திரிகைகள் மற்றும் வெளியீடுகளை படியுங்கள்',
    radio: 'பாட்காஸ்ட்கள் மற்றும் வானொலி நிகழ்ச்சிகளை கேளுங்கள்'
  }
  return descriptions[sectionName] || ''
}


export default function HomePage() {
  return <HomePageContent />
}