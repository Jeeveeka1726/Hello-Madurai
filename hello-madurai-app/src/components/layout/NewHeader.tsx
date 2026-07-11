'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  LanguageIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface NewHeaderProps {
  showSearch?: boolean
  onSearch?: (query: string) => void
}

export default function NewHeader({ showSearch = false, onSearch }: NewHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOthersOpen, setIsOthersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

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
      name: t('nav.ourteam', 'Our Team', 'எங்கள் குழு'),
      href: '/reporters'
    },
    {
      name: t('nav.contact', 'Contact', 'தொடர்பு'),
      href: '/contact'
    },
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en')
  }

  // Search as user types - for autocomplete dropdown
  const handleSearchInput = async (value: string) => {
    setSearchQuery(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true)

    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const allNews = await response.json()
        const queryLower = value.toLowerCase()

        // Filter and limit to 5 results
        const filtered = allNews.filter((article: any) => {
          const titleMatch = article.title?.toLowerCase().includes(queryLower)
          const titleTaMatch = article.title_ta?.toLowerCase().includes(queryLower)
          const excerptMatch = article.excerpt?.toLowerCase().includes(queryLower)
          const excerptTaMatch = article.excerpt_ta?.toLowerCase().includes(queryLower)

          return titleMatch || titleTaMatch || excerptMatch || excerptTaMatch
        }).slice(0, 5) // Limit to 5 results

        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/news?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
    }
  }

  const handleResultClick = (articleId: string) => {
    router.push(`/news/${articleId}`)
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg transition-all duration-300 sticky top-0 z-50">
      <div className="mx-auto max-w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-16">
          {/* Logo - Far Left */}
          <div className="flex-shrink-0 -ml-2">
            <Link href="/" className="flex items-center">
              <img
                src="/hello-madurai-logo.jpeg"
                alt="Hello Madurai Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-6 flex-1 justify-center ml-8 lg:ml-12 xl:ml-16">
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
            <div className="relative z-[60]">
              <button
                onClick={() => setIsOthersOpen(!isOthersOpen)}
                onBlur={() => setTimeout(() => setIsOthersOpen(false), 200)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 px-2 py-2 text-sm font-medium transition-colors duration-200 hover-lift whitespace-nowrap"
              >
                <span suppressHydrationWarning>{t('nav.others', 'Others', 'மேலும்')}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {isOthersOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 z-[100]">
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

          {/* Right Side - Search Bar and Controls */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Search Bar - Only on home page */}
            {showSearch && (
              <div className="hidden md:flex relative">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      onFocus={() => searchQuery && setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      placeholder={language === 'ta' ? 'செய்திகளை தேடுங்கள்...' : 'Search news...'}
                      className="w-64 lg:w-72 px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </form>

                {/* Search Results Dropdown */}
                {showDropdown && searchQuery && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((article: any) => (
                          <button
                            key={article.id}
                            onClick={() => handleResultClick(article.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="flex gap-3">
                              {article.featuredImage && (
                                <img
                                  src={article.featuredImage}
                                  alt=""
                                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                  {language === 'ta' && article.title_ta ? article.title_ta : article.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {article.category} • {article.views || 0} {language === 'ta' ? 'பார்வைகள்' : 'views'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {language === 'ta' ? 'முடிவுகள் இல்லை' : 'No results found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Language Toggle - Right corner */}
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
