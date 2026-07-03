'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NewspaperIcon,
  CalendarIcon,
  RadioIcon,
  VideoCameraIcon,
  DocumentIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  CreditCardIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'

interface CategoryItem {
  nameEn: string
  nameTa: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const categories: CategoryItem[] = [
  {
    nameEn: 'Business',
    nameTa: 'வணிகம்',
    href: '/directory',
    icon: BuildingOfficeIcon,
    color: 'bg-indigo-500'
  },
  {
    nameEn: 'News',
    nameTa: 'செய்திகள்',
    href: '/news',
    icon: NewspaperIcon,
    color: 'bg-green-500'
  },
  {
    nameEn: 'Events',
    nameTa: 'நிகழ்வுகள்',
    href: '/events',
    icon: CalendarIcon,
    color: 'bg-orange-500'
  },
  {
    nameEn: 'Radio',
    nameTa: 'வானொலி',
    href: '/radio',
    icon: RadioIcon,
    color: 'bg-red-500'
  },
  {
    nameEn: 'Videos',
    nameTa: 'வீடியோக்கள்',
    href: '/videos',
    icon: VideoCameraIcon,
    color: 'bg-purple-500'
  },
  {
    nameEn: 'Discounts',
    nameTa: 'தள்ளுபடிகள்',
    href: '/offers',
    icon: GiftIcon,
    color: 'bg-pink-500'
  },
  {
    nameEn: 'E-Paper',
    nameTa: 'பத்திரிகை',
    href: '/epaper',
    icon: DocumentIcon,
    color: 'bg-blue-500'
  },
  {
    nameEn: 'Help',
    nameTa: 'உதவி',
    href: '/helpline',
    icon: PhoneIcon,
    color: 'bg-red-600'
  }
]

interface CategoryNavigationProps {
  className?: string
}

export default function CategoryNavigation({ className = '' }: CategoryNavigationProps) {
  const pathname = usePathname()
  const { language } = useLanguage()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Continuous auto-scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame - adjust for speed
    let animationFrameId: number

    const scroll = () => {
      scrollPosition += scrollSpeed

      // Get the actual scrollable width
      const maxScroll = container.scrollWidth - container.clientWidth

      // Reset to beginning when reaching the end
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0
      }

      container.scrollLeft = scrollPosition
      animationFrameId = requestAnimationFrame(scroll)
    }

    // Start the animation
    animationFrameId = requestAnimationFrame(scroll)

    // Pause scrolling on hover/touch
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationFrameId)
    }

    const handleMouseLeave = () => {
      animationFrameId = requestAnimationFrame(scroll)
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('touchstart', handleMouseEnter)
    container.addEventListener('touchend', handleMouseLeave)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('touchstart', handleMouseEnter)
      container.removeEventListener('touchend', handleMouseLeave)
    }
  }, [])

  return (
    <div className={`bg-white border-b border-gray-200 md:hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide py-4"
          style={{ scrollBehavior: 'auto' }}
        >
          {/* Render categories twice for seamless loop */}
          {[...categories, ...categories].map((category, index) => {
            const Icon = category.icon
            const isActive = pathname === category.href

            return (
              <Link key={`${category.nameEn}-${index}`} href={category.href} className="no-underline">
                <div
                  className={`flex-shrink-0 rounded-full px-4 py-2 transition-colors duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center justify-center w-6 h-6 ${category.color} rounded-full`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      isActive ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      <TranslatedText tamil={category.nameTa}>{category.nameEn}</TranslatedText>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
