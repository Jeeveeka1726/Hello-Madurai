'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function ContactPage() {
  const { t } = useLanguage()

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: t('contact.phone', 'Phone', 'தொலைபேசி'),
      value: '+91 95665 31237',
      description: t('contact.phoneDesc', 'Call us for immediate assistance', 'உடனடி உதவிக்கு எங்களை அழைக்கவும்')
    },
    {
      icon: EnvelopeIcon,
      title: t('contact.email', 'Email', 'மின்னஞ்சல்'),
      value: 'hellomaduraiapp@gmail.com',
      description: t('contact.emailDesc', 'Send us your queries and feedback', 'உங்கள் கேள்விகள் மற்றும் கருத்துகளை எங்களுக்கு அனுப்பவும்')
    },
    {
      icon: MapPinIcon,
      title: t('contact.address', 'Address', 'முகவரி'),
      value: 'Madurai, Tamil Nadu, India',
      description: t('contact.addressDesc', 'Visit us at our office', 'எங்கள் அலுவலகத்தில் எங்களைப் பார்வையிடுங்கள்')
    },
    {
      icon: ClockIcon,
      title: t('contact.hours', 'Business Hours', 'வணிக நேரம்'),
      value: 'Mon - Fri: 9:00 AM - 6:00 PM',
      description: t('contact.hoursDesc', 'We are available during these hours', 'இந்த நேரங்களில் நாங்கள் கிடைக்கிறோம்')
    }
  ]

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/hellomaduraimedia/',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/hello_madurai/',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@hellomadurai',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/hellomadurai?s=21',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <NewHeader />
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#1e3a8a' }}>
              {t('contact.title', 'Contact Us', 'எங்களை தொடர்பு கொள்ளுங்கள்')}
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {t('contact.subtitle', 'Get in touch with us for any queries or feedback', 'எந்தவொரு கேள்விகள் அல்லது கருத்துகளுக்கும் எங்களுடன் தொடர்பு கொள்ளுங்கள்')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Card key={index} className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col">
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    <p className="text-blue-600 font-medium mb-2 break-words">
                      {info.value}
                    </p>
                    <p className="text-gray-600 text-sm flex-grow">
                      {info.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Social Media Links */}
          <div className="text-center bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t('contact.followUs', 'Follow Us', 'எங்களைப் பின்தொடருங்கள்')}
            </h2>
            <div className="flex justify-center items-center space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                  title={`Follow us on ${social.name}`}
                >
                  <div className="text-white group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
            <p className="text-gray-600 mt-6">
              {t('contact.socialDesc', 'Stay updated with our latest content and news', 'எங்கள் சமீபத்திய உள்ளடக்கம் மற்றும் செய்திகளுடன் புதுப்பித்த நிலையில் இருங்கள்')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
