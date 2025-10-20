'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bars3Icon,
  XMarkIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

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
      name: t('nav.events', 'Events', 'நிகழ்வுகள்'),
      href: '/events' 
    },
    {
      name: t('nav.radio', 'Radio', 'வானொலி'),
      href: '/radio'
    },
    { 
      name: t('nav.magazine', 'Magazine', 'பத்திரிகை'),
      href: '/magazine' 
    },
    { 
      name: t('nav.videos', 'Videos', 'வீடியோக்கள்'),
      href: '/videos' 
    },
    {
      name: t('nav.directory', 'Directory', 'முகவரி நூல்'),
      href: '/directory'
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
    <header className="bg-white/95 dark:bg-blue-950/95 backdrop-blur-sm border-b border-blue-100 dark:border-blue-900/50 shadow-lg transition-all duration-300 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/logo.jpg" 
                alt="Hello Madurai Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
              />
              <span className="hidden sm:block text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Hello Madurai
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-yellow-400 px-2 xl:px-3 py-2 text-sm font-medium transition-colors duration-200 hover-lift whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-neutral-700 dark:text-white hover:text-primary-600 dark:hover:text-primary-300 hover:bg-white-600 dark:hover:bg-primary-800 transition-colors duration-200"
              title={language === 'en' ? 'தமிழுக்கு மாற்று' : 'Switch to English'}
            >
              <LanguageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:block">
                {language === 'en' ? 'தமிழ்' : 'English'}
              </span>
              <span className="sm:hidden text-xs">
                {language === 'en' ? 'த' : 'En'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-neutral-700 dark:text-white hover:text-primary-600 dark:hover:text-primary-300 hover:bg-white-600 dark:hover:bg-primary-800 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
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
                  className="block px-3 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
