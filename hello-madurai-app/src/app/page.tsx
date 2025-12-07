'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import {
  NewspaperIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  DocumentIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import NewHeader from '@/components/layout/NewHeader'
import SubscriptionButton from '@/components/SubscriptionButton'
import TranslatedText from '@/components/TranslatedText'

export default function RootPage() {
  const { t } = useLanguage()

  const features = [
    {
      nameEn: 'News',
      nameTa: 'செய்திகள்',
      descEn: 'Latest news from Madurai',
      descTa: 'மதுரையின் சமீபத்திய செய்திகள்',
      href: '/news',
      icon: NewspaperIcon,
      color: 'bg-red-500'
    },
    {
      nameEn: 'Digital FM',
      nameTa: 'டிஜிட்டல் எஃப்.எம்',
      descEn: 'Listen to Digital FM',
      descTa: 'டிஜிட்டல் எஃப்.எம் கேளுங்கள்',
      href: '/radio',
      icon: MicrophoneIcon,
      color: 'bg-green-500'
    },
    {
      nameEn: 'Videos',
      nameTa: 'வீடியோக்கள்',
      descEn: 'Watch videos from Madurai',
      descTa: 'மதுரையின் வீடியோக்களைப் பார்க்கவும்',
      href: '/videos',
      icon: VideoCameraIcon,
      color: 'bg-purple-500'
    },
    {
      nameEn: 'Directory',
      nameTa: 'முகவரி நூல்',
      descEn: 'Business listings and contacts',
      descTa: 'வணிக பட்டியல்கள் மற்றும் தொடர்புகள்',
      href: '/directory',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-500'
    },
    {
      nameEn: 'Events',
      nameTa: 'நிகழ்வுகள்',
      descEn: 'Discover local events',
      descTa: 'உள்ளூர் நிகழ்வுகளைக் கண்டறியுங்கள்',
      href: '/events',
      icon: CalendarIcon,
      color: 'bg-orange-500'
    },
    {
      nameEn: 'E-Paper',
      nameTa: 'பத்திரிகை',
      descEn: 'Read digital newspapers',
      descTa: 'டிஜிட்டல் பத்திரிகைகளைப் படியுங்கள்',
      href: '/magazine',
      icon: DocumentIcon,
      color: 'bg-blue-500'
    },
    {
      nameEn: 'Help Line',
      nameTa: 'உதவி எண்',
      descEn: 'Emergency and helpline numbers',
      descTa: 'அவசர மற்றும் உதவி எண்கள்',
      href: '/helpline',
      icon: PhoneIcon,
      color: 'bg-red-600'
    },
    {
      nameEn: 'Discount Card',
      nameTa: 'தள்ளுபடி அட்டை',
      descEn: 'Get discounts across Madurai',
      descTa: 'மதுரை முழுவதும் தள்ளுபடி பெறுங்கள்',
      href: '/discount',
      icon: CreditCardIcon,
      color: 'bg-yellow-500'
    },
    {
      nameEn: 'Contact',
      nameTa: 'தொடர்பு',
      descEn: 'Get in touch with us',
      descTa: 'எங்களுடன் தொடர்பு கொள்ளுங்கள்',
      href: '/contact',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <NewHeader />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#ffffff' }}>
                <TranslatedText tamil="ஹலோ மதுரை">Hello Madurai</TranslatedText>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: '#ffffff' }}>
                <TranslatedText tamil="மதுரைக்கான உங்கள் நுழைவாயில் - செய்திகள், வானொலி மற்றும் பலவும்">Your gateway to Madurai - News, Radio & More</TranslatedText>
              </p>
              <Link
                href="/news"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <TranslatedText tamil="சமீபத்திய செய்திகளை ஆராயுங்கள்">Explore Latest News</TranslatedText>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <TranslatedText as="h2" className="text-3xl font-bold text-gray-900 mb-4" tamil="மதுரையை கண்டறியுங்கள்">
              Discover Madurai
            </TranslatedText>
            <TranslatedText as="p" className="text-lg text-gray-600 max-w-2xl mx-auto" tamil="உங்கள் நகரத்துடன் இணைந்திருக்க தேவையான அனைத்தும்">
              Everything you need to stay connected with your city
            </TranslatedText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.nameEn} href={feature.href} className="no-underline">
                  <div className="bg-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 cursor-pointer group h-full flex flex-col border-2 border-blue-700 hover:border-blue-800">
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      <TranslatedText tamil={feature.nameTa}>{feature.nameEn}</TranslatedText>
                    </h3>
                    <p className="flex-grow">
                      <TranslatedText tamil={feature.descTa}>{feature.descEn}</TranslatedText>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 border-t-2 border-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <TranslatedText as="h2" className="text-3xl font-bold text-gray-900 mb-4" tamil="புதுப்பித்த நிலையில் இருங்கள்">
                Stay Updated
              </TranslatedText>
              <TranslatedText as="p" className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto" tamil="மதுரையின் சமீபத்திய செய்திகள் மற்றும் உள்ளடக்கத்தை உங்களுக்கு வழங்கப்படும்">
                Get the latest news and content from Madurai delivered to you
              </TranslatedText>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SubscriptionButton className="text-lg px-8 py-3" />
                <Link
                  href="/news"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  <span style={{ color: '#ffffff' }}>
                    <TranslatedText tamil="செய்திகளைப் படியுங்கள்">Read News</TranslatedText>
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md bg-white hover:bg-blue-50 transition-colors duration-200"
                >
                  <span style={{ color: '#2563eb' }}>
                    <TranslatedText tamil="எங்களை தொடர்பு கொள்ளுங்கள்">Contact Us</TranslatedText>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        <SubscriptionButton variant="banner" />
        
        {/* Floating Subscription Button */}
        <SubscriptionButton variant="floating" />
      </div>
    </div>
  )
}

