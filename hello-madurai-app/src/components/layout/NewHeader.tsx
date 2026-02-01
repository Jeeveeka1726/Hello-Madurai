'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  LanguageIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOthersOpen, setIsOthersOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  const navigation = [
    {
      name: t('nav.home', 'Home', 'முகப்பு'),
      href: '/'
    },
    { 
      name: t('nav.news', 'News', 'செய்திகள்'),
      href: '/news' 
    },
    { 
      name: t('nav.events', 'Events', 'நிகழ்ச்சி'),
      href: '/events' 
    },
    {
      name: t('nav.radio', 'Digital FM', 'டிஜிட்டல் எஃப்.எம்'),
      href: '/radio'
    },
    {
      name: t('nav.videos', 'Videos', 'வீடியோ'),
      href: '/videos'
    },
    {
      name: t('nav.magazine', 'E-Paper', 'மின்னிதழ்'),
      href: '/epaper'
    },
    {
      name: t('nav.directory', 'Directory', 'வணிக முகவரி'),
      href: '/directory'
    },
  ]

  const othersDropdown = [
    {
      name: t('nav.discount', 'Discount', 'தள்ளுபடி'),
      href: '/offers'
    },
    {
      name: t('nav.helpline', 'Help Line', 'உதவி எண்'),
      href: '/helpline'
    },
    {
      name: t('nav.contact', 'Contact', 'தொடர்பு'),
      href: '/contact'
    },
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en')
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Only logo, no text */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.jpg"
                alt="Hello Madurai Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-blue-600 hover:text-blue-700 px-2 py-2 text-sm font-medium transition-colors duration-200 hover-lift whitespace-nowrap"
              >
                <span suppressHydrationWarning>{item.name}</span>
              </Link>
            ))}

            {/* Others Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOthersOpen(!isOthersOpen)}
                onBlur={() => setTimeout(() => setIsOthersOpen(false), 200)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 px-2 py-2 text-sm font-medium transition-colors duration-200 hover-lift whitespace-nowrap"
              >
                <span suppressHydrationWarning>{t('nav.others', 'Others', 'மேலும்')}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {isOthersOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  {othersDropdown.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 first:rounded-t-md last:rounded-b-md transition-colors"
                      onClick={() => setIsOthersOpen(false)}
                    >
                      <span suppressHydrationWarning>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
              title={language === 'en' ? 'தமிழுக்கு மாற்று' : 'Switch to English'}
              suppressHydrationWarning
            >
              <LanguageIcon className="h-5 w-5" />
              <span className="hidden sm:block" suppressHydrationWarning>
                {language === 'en' ? 'தமிழ்' : 'English'}
              </span>
              <span className="sm:hidden" suppressHydrationWarning>
                {language === 'en' ? 'த' : 'En'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span suppressHydrationWarning>{item.name}</span>
                </Link>
              ))}

              {/* Others Section in Mobile */}
              <div className="pt-2 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  <span suppressHydrationWarning>{t('nav.others', 'Others', 'மேலும்')}</span>
                </div>
                {othersDropdown.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 pl-6 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span suppressHydrationWarning>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
