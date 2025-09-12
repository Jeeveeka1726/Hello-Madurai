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
      value: '+91 452 123 4567',
      description: t('contact.phoneDesc', 'Call us for immediate assistance', 'உடனடி உதவிக்கு எங்களை அழைக்கவும்')
    },
    {
      icon: EnvelopeIcon,
      title: t('contact.email', 'Email', 'மின்னஞ்சல்'),
      value: 'podcasts@hellomadurai.com',
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
      url: 'https://facebook.com/hellomadurai',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/hellomadurai',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
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
    }
  ]

  return (
    <div className="min-h-screen bg-purple-950">
      <NewHeader />
      <div className="min-h-screen bg-purple-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('contact.title', 'Contact Hello Madurai', 'ஹலோ மதுரையை தொடர்பு கொள்ளுங்கள்')}
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              {t('contact.subtitle', 'Get in touch with us for any queries or feedback', 'எந்தவொரு கேள்விகள் அல்லது கருத்துகளுக்கும் எங்களுடன் தொடர்பு கொள்ளுங்கள்')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Card key={index} className="bg-purple-900 border-purple-800 hover:bg-purple-800 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {info.title}
                    </h3>
                    <p className="text-purple-200 font-medium mb-2">
                      {info.value}
                    </p>
                    <p className="text-purple-300 text-sm">
                      {info.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Social Media Links */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-8">
              {t('contact.followUs', 'Follow Us', 'எங்களைப் பின்தொடருங்கள்')}
            </h2>
            <div className="flex justify-center space-x-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors group"
                  title={`Follow us on ${social.name}`}
                >
                  <div className="text-white group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
            <p className="text-purple-300 mt-4">
              {t('contact.socialDesc', 'Stay updated with our latest content and news', 'எங்கள் சமீபத்திய உள்ளடக்கம் மற்றும் செய்திகளுடன் புதுப்பித்த நிலையில் இருங்கள்')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
