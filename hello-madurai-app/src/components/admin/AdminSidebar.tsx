'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  NewspaperIcon,
  VideoCameraIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DocumentIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon
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
    name: 'Videos',
    name_ta: 'வீடியோக்கள்',
    href: '/admin/videos',
    icon: VideoCameraIcon
  },
  {
    name: 'Events',
    name_ta: 'நிகழ்வுகள்',
    href: '/admin/events',
    icon: CalendarIcon
  },
  {
    name: 'Directory',
    name_ta: 'முகவரி நூல்',
    href: '/admin/directory',
    icon: BuildingOfficeIcon
  },
  {
    name: 'Magazines',
    name_ta: 'பத்திரிகைகள்',
    href: '/admin/magazines',
    icon: DocumentIcon
  },
  {
    name: 'Radio',
    name_ta: 'வானொலி',
    href: '/admin/radio',
    icon: ChartBarIcon
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
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-purple-950">
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-purple-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-primary-600 text-white">
            <div className="flex items-center">
              <h1 className="text-lg font-bold">Hello Madurai</h1>
              <span className="ml-2 text-xs bg-primary-700 px-2 py-1 rounded">CMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
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
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 border-r-2 border-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 transition-colors
                    ${isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }
                  `} />
                  {t(`admin.nav.${item.name.toLowerCase()}`, item.name, item.name_ta)}
                  {item.badge && (
                    <span className="ml-auto bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">A</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
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
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
            <div></div> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-purple-950">
          {children}
        </main>
      </div>
    </div>
  )
}
