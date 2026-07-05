'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import Card, { CardContent } from '@/components/ui/Card'

interface NewsArticle {
  id: string
  title: string
  title_ta?: string
  excerpt: string
  excerpt_ta?: string
  category: string
  featuredImage?: string
  publishedAt: string
  views: number
}

export default function TodaysNewsCarousel() {
  const { language } = useLanguage()
  const [todaysNews, setTodaysNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  useEffect(() => {
    const fetchTodaysNews = async () => {
      try {
        const response = await fetch('/api/news')
        if (response.ok) {
          const data = await response.json()
          
          // Filter news from today
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const filtered = data.filter((news: NewsArticle) => {
            const newsDate = new Date(news.publishedAt)
            newsDate.setHours(0, 0, 0, 0)
            return newsDate.getTime() === today.getTime()
          })
          
          setTodaysNews(filtered)
        }
      } catch (error) {
        console.error('Error fetching today\'s news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysNews()
  }, [])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      scrollToIndex(newIndex)
    }
  }

  const handleNext = () => {
    if (currentIndex < todaysNews.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      scrollToIndex(newIndex)
    }
  }

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const container = scrollRef.current
      const isMobile = window.innerWidth < 768

      if (isMobile) {
        // Mobile: scroll full width (1 card at a time)
        const cardWidth = container.offsetWidth
        container.scrollTo({
          left: cardWidth * index,
          behavior: 'smooth'
        })
      } else {
        // Desktop: scroll half width (showing 2 cards, scroll by 1)
        const cards = container.querySelectorAll('[data-carousel-card]')
        if (cards[index]) {
          cards[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
          })
        }
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      // Swipe left
      handleNext()
    } else if (touchEndX.current - touchStartX.current > 75) {
      // Swipe right
      handlePrevious()
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (todaysNews.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
            <TranslatedText tamil="இன்றைய செய்திகள்">Today's News</TranslatedText>
          </h2>
        </div>

        {/* Horizontal Scrolling Carousel */}
        <div className="relative -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8">
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {todaysNews.map((news, index) => {
              const getTimeAgo = () => {
                const date = new Date(news.publishedAt)
                const now = new Date()
                const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

                if (diffInHours < 1) return language === 'ta' ? 'இப்போது' : 'Now'
                if (diffInHours < 24) return `${diffInHours}h`
                const diffInDays = Math.floor(diffInHours / 24)
                if (diffInDays < 7) return `${diffInDays}d`
                return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
              }

              return (
                <div key={news.id} data-card className="w-full sm:w-[calc(50%-12px)] md:w-[calc(50%-12px)] flex-shrink-0 snap-start">
                  <Link href={`/news/${news.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 bg-white border-0 overflow-hidden h-full flex flex-col transform hover:-translate-y-1 sm:hover:-translate-y-2">
                                {/* Image */}
                                {news.featuredImage ? (
                                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                              <img
                                src={news.featuredImage}
                                alt={language === 'ta' && news.title_ta ? news.title_ta : news.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                              {/* Category badge */}
                              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg">
                                  {news.category}
                                </span>
                              </div>

                              {/* Time badge */}
                              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                                <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                                  <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="hidden sm:inline">{getTimeAgo()}</span>
                                </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                    <span className="text-blue-400 text-xs sm:text-sm">
                                      <TranslatedText tamil="படம் விரைவில்">Image Coming Soon</TranslatedText>
                                    </span>
                                  </div>
                                )}

                                {/* Content */}
                                <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                                  {/* Title - Full display */}
                                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                    {language === 'ta' && news.title_ta ? news.title_ta : news.title}
                                  </h3>

                                  {/* Excerpt - Full display */}
                                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed flex-grow">
                                    {language === 'ta' && news.excerpt_ta ? news.excerpt_ta : news.excerpt}
                                  </p>

                                  {/* Meta Info */}
                                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="font-medium">{(news.views || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="truncate">
                                  {new Date(news.publishedAt).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                    </div>
                                  </div>

                                  {/* Read More Button */}
                                  <div className="mt-3 sm:mt-4">
                                    <span className="inline-flex items-center text-blue-600 font-semibold text-xs sm:text-sm md:text-base group-hover:gap-2 transition-all">
                                      <TranslatedText tamil="மேலும் படிக்க">Read More</TranslatedText>
                                      <svg className="w-0 group-hover:w-4 sm:group-hover:w-5 h-4 sm:h-5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </span>
                                  </div>
                                </CardContent>
                    </Card>
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Navigation Arrows - Visible on all screen sizes */}
          {todaysNews.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl z-10 transition-all"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl z-10 transition-all"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots - Mobile and Desktop */}
        {todaysNews.length > 2 && (
          <div className="flex justify-center gap-2 mt-6">
            {todaysNews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  if (scrollRef.current) {
                    const cardWidth = scrollRef.current.querySelector('[data-card]')?.clientWidth || 0
                    scrollRef.current.scrollTo({
                      left: cardWidth * index + (index * 24), // 24px for gap
                      behavior: 'smooth'
                    })
                  }
                }}
                className={`h-2.5 sm:h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-blue-600 w-6 sm:w-8'
                    : 'w-2.5 sm:w-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
