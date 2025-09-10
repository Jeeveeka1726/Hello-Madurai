'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  NewspaperIcon,
  VideoCameraIcon,
  CalendarIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  MapIcon,
  BriefcaseIcon,
  CloudIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import LanguageToggle from './LanguageToggle'

const navigation = [
  { name: 'home', href: '/', icon: HomeIcon },
  { name: 'news', href: '/news', icon: NewspaperIcon },
  { name: 'videos', href: '/videos', icon: VideoCameraIcon },
  { name: 'radio', href: '/radio', icon: VideoCameraIcon },
  { name: 'events', href: '/events', icon: CalendarIcon },
  { name: 'magazine', href: '/magazine', icon: BookOpenIcon },
  { name: 'directory', href: '/directory', icon: BuildingOfficeIcon },
  { name: 'tourism', href: '/tourism', icon: MapIcon },
  { name: 'jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'weather', href: '/weather', icon: CloudIcon },
  { name: 'helpline', href: '/helpline', icon: PhoneIcon },
]

interface HeaderProps {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <img
                src="/logo.jpg"
                alt="Hello Madurai Logo"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-indigo-600">Hello Madurai</span>
                <span className="text-sm text-gray-600">ஹலோ மதுரை</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="ml-10 hidden space-x-8 lg:block">
            {navigation.map((item) => {
              const href = `/${locale}${item.href}`
              const isActive = pathname === href || (item.href !== '/' && pathname.startsWith(href))
              
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {getNavigationText(item.name, locale)}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const href = `/${locale}${item.href}`
                const isActive = pathname === href || (item.href !== '/' && pathname.startsWith(href))
                
                return (
                  <Link
                    key={item.name}
                    href={href}
                    className={`block py-2 pl-3 pr-4 text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {getNavigationText(item.name, locale)}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

function getNavigationText(key: string, locale: string): string {
  const translations: Record<string, Record<string, string>> = {
    en: {
      home: 'Home',
      news: 'News',
      videos: 'Videos',
      radio: 'Radio',
      events: 'Events',
      magazine: 'E-Magazine',
      directory: 'Directory',
      tourism: 'Tourism',
      jobs: 'Jobs',
      weather: 'Weather & Transport',
      helpline: 'Helpline'
    },
    ta: {
      home: 'முகப்பு',
      news: 'செய்திகள்',
      videos: 'வீடியோ',
      radio: 'வானொலி',
      events: 'நிகழ்ச்சிகள்',
      magazine: 'மாத இதழ்',
      directory: 'முகவரி நூல்',
      tourism: 'சுற்றுலா வழிகாட்டி',
      jobs: 'வேலைவாய்ப்பு',
      weather: 'வானிலை & போக்குவரத்து',
      helpline: 'அவசர உதவி எண்'
    }
  }

  return translations[locale]?.[key] || key
}
