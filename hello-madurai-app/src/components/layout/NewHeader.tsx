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
  
  // Check if we're on a news page
  const isNewsPage = pathname?.startsWith('/news')

  const navigation = [
    ...(isNewsPage ? [] : [{ 
      name: t('nav.home', 'Home', 'முகப்பு'),
      href: '/' 
    }]),
    { 
      name: t('nav.news', 'News', 'செய்திகள்'),
      href: '/news' 
    },
    { 
      name: t('nav.events', 'Events', 'நிகழ்ச்சி'),
      href: '/events' 
    },
    {
      name: t('nav.radio', 'Radio', 'வானொலி'),
      href: '/radio'
    },
    {
      name: t('nav.videos', 'Videos', 'வீடியோ'),
      href: '/videos'
    },
    { 
      name: t('nav.magazine', 'E-Paper', 'பத்திரிகை'),
      href: '/magazine' 
    },
    {
      name: t('nav.directory', 'Directory', 'முகவரி'),
      href: '/directory'
    },
  ]

  const othersDropdown = [
    {
      name: t('nav.discount', 'Discount Card', 'தள்ளுபடி அட்டை'),
      href: '/discount'
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
    <header className="bg-white/95 dark:bg-blue-950/95 backdrop-blur-sm border-b border-blue-100 dark:border-blue-900/50 shadow-lg transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/logo.jpg" 
                alt="Hello Madurai Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              {!isNewsPage && (
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    Hello Madurai
                  </h1>
                </div>
              )}
            </Link>
            {isNewsPage && (
              <Link 
                href="/" 
                className="ml-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-colors duration-200 hover-lift"
              >
                {t('nav.home', 'Home', 'முகப்பு')}
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-yellow-400 px-2 py-2 text-sm font-medium transition-colors duration-200 hover-lift whitespace-nowrap"
              >
                <span suppressHydrationWarning>{item.name}</span>
              </Link>
            ))}
            
            {/* Others Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOthersOpen(!isOthersOpen)}
                onBlur={() => setTimeout(() => setIsOthersOpen(false), 200)}
                className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-yellow-400 px-2 py-2 text-sm font-medium transition-colors duration-200 hover-lift whitespace-nowrap"
              >
                <span suppressHydrationWarning>{t('nav.others', 'Others', 'மேலும்')}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {isOthersOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {othersDropdown.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 first:rounded-t-md last:rounded-b-md transition-colors"
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
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-700 dark:text-white hover:text-primary-600 dark:hover:text-primary-300 hover:bg-white-600 dark:hover:bg-primary-800 transition-colors duration-200"
              title={language === 'en' ? 'தமிழுக்கு மாற்று' : 'Switch to English'}
            >
              <LanguageIcon className="h-5 w-5" />
              <span className="hidden sm:block">
                {language === 'en' ? 'தமிழ்' : 'English'}
              </span>
              <span className="sm:hidden">
                {language === 'en' ? 'த' : 'En'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-700 dark:text-white hover:text-primary-600 dark:hover:text-primary-300 hover:bg-white-600 dark:hover:bg-primary-800 transition-colors duration-200"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-50 dark:bg-blue-900 border-t border-blue-200 dark:border-blue-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span suppressHydrationWarning>{item.name}</span>
                </Link>
              ))}

              {/* Others Section in Mobile */}
              <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span suppressHydrationWarning>{t('nav.others', 'Others', 'மேலும்')}</span>
                </div>
                {othersDropdown.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 pl-6 text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors duration-200"
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
