import Link from 'next/link'
import {
  NewspaperIcon,
  VideoCameraIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MapIcon,
  BriefcaseIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const featuredSections = [
  {
    name: 'news',
    href: '/news',
    icon: NewspaperIcon,
    color: 'bg-blue-500',
    description: 'Latest news from Madurai and surrounding areas'
  },
  {
    name: 'videos',
    href: '/videos',
    icon: VideoCameraIcon,
    color: 'bg-red-500',
    description: 'Watch videos about local businesses, agriculture, and more'
  },
  {
    name: 'events',
    href: '/events',
    icon: CalendarIcon,
    color: 'bg-green-500',
    description: 'Upcoming festivals, exhibitions, and cultural events'
  },
  {
    name: 'directory',
    href: '/directory',
    icon: BuildingOfficeIcon,
    color: 'bg-purple-500',
    description: 'Find local businesses, services, and contact information'
  },
  {
    name: 'tourism',
    href: '/tourism',
    icon: MapIcon,
    color: 'bg-orange-500',
    description: 'Explore temples, historical places, and tourist attractions'
  },
  {
    name: 'jobs',
    href: '/jobs',
    icon: BriefcaseIcon,
    color: 'bg-indigo-500',
    description: 'Local job opportunities and career listings'
  }
]

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {locale === 'ta' ? 'ஹலோ மதுரைக்கு வரவேற்கிறோம்' : 'Welcome to Hello Madurai'}
            </h1>
            <p className="mt-6 text-xl leading-8 text-indigo-100">
              {locale === 'ta' ? 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்' : 'Your local news and information hub'}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href={`/${locale}/news`}>
                <Button size="lg" variant="secondary">
                  {locale === 'ta' ? 'செய்திகள்' : 'News'}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/directory`}>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-indigo-600">
                  {locale === 'ta' ? 'முகவரி நூல்' : 'Directory'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {locale === 'ta' ? 'முக்கிய பிரிவுகள்' : 'Main Sections'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {locale === 'ta' 
                ? 'மதுரையின் அனைத்து தகவல்களும் ஒரே இடத்தில்'
                : 'All of Madurai\'s information in one place'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSections.map((section) => (
              <Link key={section.name} href={`/${locale}${section.href}`}>
                <Card hover className="h-full">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg ${section.color}`}>
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardTitle className="mb-2">
                    {locale === 'ta' ? getNavigationTamil(section.name) : getNavigationEnglish(section.name)}
                  </CardTitle>
                  <CardContent>
                    <p className="text-sm">
                      {locale === 'ta' 
                        ? getDescriptionInTamil(section.name)
                        : section.description
                      }
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">500+</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'ta' ? 'செய்திகள்' : 'News Articles'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">200+</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'ta' ? 'வீடியோக்கள்' : 'Videos'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">1000+</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'ta' ? 'வணிக பட்டியல்' : 'Business Listings'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">50+</div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'ta' ? 'நிகழ்வுகள்' : 'Events'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {locale === 'ta' 
              ? 'மதுரையுடன் இணைந்திருங்கள்'
              : 'Stay Connected with Madurai'
            }
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            {locale === 'ta'
              ? 'சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் உள்ளூர் தகவல்களை பெறுங்கள்'
              : 'Get the latest news, events, and local information delivered to you'
            }
          </p>
          <div className="mt-8">
            <Link href={`/${locale}/news`}>
              <Button size="lg" variant="secondary">
                {locale === 'ta' ? 'இப்போதே ஆரம்பிக்கவும்' : 'Get Started Now'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function getNavigationEnglish(sectionName: string): string {
  const navigation: Record<string, string> = {
    news: 'News',
    videos: 'Videos',
    events: 'Events',
    directory: 'Directory',
    tourism: 'Tourism',
    jobs: 'Jobs'
  }
  return navigation[sectionName] || sectionName
}

function getNavigationTamil(sectionName: string): string {
  const navigation: Record<string, string> = {
    news: 'செய்திகள்',
    videos: 'வீடியோ',
    events: 'நிகழ்ச்சிகள்',
    directory: 'முகவரி நூல்',
    tourism: 'சுற்றுலா வழிகாட்டி',
    jobs: 'வேலைவாய்ப்பு'
  }
  return navigation[sectionName] || sectionName
}

function getDescriptionInTamil(sectionName: string): string {
  const descriptions: Record<string, string> = {
    news: 'மதுரை மற்றும் சுற்றுவட்டார பகுதிகளின் சமீபத்திய செய்திகள்',
    videos: 'உள்ளூர் வணிகம், விவசாயம் மற்றும் பிற தொழில்கள் பற்றிய வீடியோக்கள்',
    events: 'வரவிருக்கும் திருவிழாக்கள், கண்காட்சிகள் மற்றும் கலாசார நிகழ்வுகள்',
    directory: 'உள்ளூர் வணிகங்கள், சேவைகள் மற்றும் தொடர்பு தகவல்களை கண்டறியுங்கள்',
    tourism: 'கோவில்கள், வரலாற்று இடங்கள் மற்றும் சுற்றுலா தலங்களை ஆராயுங்கள்',
    jobs: 'உள்ளூர் வேலை வாய்ப்புகள் மற்றும் தொழில் பட்டியல்கள்'
  }
  return descriptions[sectionName] || ''
}
