'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  NewspaperIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DocumentIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  MegaphoneIcon,
  VideoCameraIcon,
  GiftIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAdmin } from '@/contexts/AdminContext'
import Button from '@/components/ui/Button'

const navigation = [
  {
    name: 'Dashboard',
    name_ta: 'டாஷ்போர்டு',
    href: '/admin',
    icon: HomeIcon,
    exact: true
  },
  {
    name: 'News',
    name_ta: 'செய்திகள்',
    href: '/admin/news',
    icon: NewspaperIcon,
    badge: 'new'
  },
  {
    name: 'Events',
    name_ta: 'நிகழ்வுகள்',
    href: '/admin/events',
    icon: CalendarIcon
  },
  {
    name: 'Directory',
    name_ta: 'வணிக முகவரி',
    href: '/admin/directory',
    icon: BuildingOfficeIcon
  },
  {
    name: 'Categories',
    name_ta: 'வகைகள்',
    href: '/admin/directory-categories',
    icon: BuildingOfficeIcon
  },
  {
    name: 'E-Papers',
    name_ta: 'பத்திரிகைகள்',
    href: '/admin/magazines',
    icon: DocumentIcon
  },
  {
    name: 'Digital FM',
    name_ta: 'டிஜிட்டல் எஃப்.எம்',
    href: '/admin/radio-music',
    icon: ChartBarIcon
  },
  {
    name: 'Videos',
    name_ta: 'வீடியோக்கள்',
    href: '/admin/videos',
    icon: VideoCameraIcon,
    badge: 'new'
  },
  {
    name: 'Reels',
    name_ta: 'ரீல்கள்',
    href: '/admin/reels',
    icon: VideoCameraIcon,
    badge: 'new'
  },
  {
    name: 'Ads',
    name_ta: 'விளம்பரங்கள்',
    href: '/admin/ads',
    icon: MegaphoneIcon,
    badge: 'new'
  },
  {
    name: 'Offers',
    name_ta: 'சலுகைகள்',
    href: '/admin/offers',
    icon: GiftIcon,
    badge: 'new'
  },
  {
    name: 'Offer Categories',
    name_ta: 'சலுகை வகைகள்',
    href: '/admin/offer-categories',
    icon: TagIcon,
    badge: 'new'
  }
]

interface AdminSidebarProps {
  children: React.ReactNode
}

export default function AdminSidebar({ children }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { logout } = useAdmin()

  const handleLogout = () => {
    logout()
    window.location.href = '/admin-login'
  }

  const isActiveLink = (item: typeof navigation[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href) && item.href !== '/admin'
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-blue-600" style={{ backgroundColor: '#2563eb' }}>
            <div className="flex items-center">
              <h1 className="text-lg font-bold" style={{ color: '#ffffff' }}>Hello Madurai</h1>
              <span className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded" style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }}>CMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:opacity-80"
              style={{ color: '#ffffff' }}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActiveLink(item)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                      ? 'bg-blue-100 border-r-2 border-blue-500'
                      : 'hover:bg-gray-100'
                    }
                  `}
                  style={{
                    color: isActive ? '#1d4ed8' : '#374151',
                    fontWeight: '500'
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className="mr-3 h-5 w-5 transition-colors"
                    style={{
                      color: isActive ? '#2563eb' : '#9ca3af'
                    }}
                  />
                  <span style={{ color: isActive ? '#1d4ed8' : '#374151' }}>
                    {t(`admin.nav.${item.name.toLowerCase()}`, item.name, item.name_ta)}
                  </span>
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              {t('admin.logout', 'Logout', 'வெளியேறு')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 touch-target p-2"
            >
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Admin Panel</h1>
            <div className="w-9 sm:w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mobile-padding">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
