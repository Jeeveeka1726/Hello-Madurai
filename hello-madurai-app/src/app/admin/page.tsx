'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  NewspaperIcon,
  CalendarIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAdmin } from '@/contexts/AdminContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { logout } = useAdmin()
  const [stats, setStats] = useState({
    totalNews: 0,
    totalEvents: 0,
    totalVideos: 0,
    totalBusinesses: 0,
    totalUsers: 0,
    monthlyViews: 0
  })
  const [recentContent, setRecentContent] = useState<{
    news: any[]
    events: any[]
    videos: any[]
  }>({
    news: [],
    events: [],
    videos: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch real stats from APIs
      const [newsRes, eventsRes, videosRes] = await Promise.all([
        fetch('/api/admin/news').then(r => r.json()).catch(() => []),
        fetch('/api/admin/events').then(r => r.json()).catch(() => []),
        fetch('/api/admin/videos').then(r => r.json()).catch(() => [])
      ])

      setStats({
        totalNews: Array.isArray(newsRes) ? newsRes.length : 0,
        totalEvents: Array.isArray(eventsRes) ? eventsRes.length : 0,
        totalVideos: Array.isArray(videosRes) ? videosRes.length : 0,
        totalBusinesses: 0, // Will be fetched from database when businesses feature is implemented
        totalUsers: 0, // Will be fetched from database when user management is implemented
        monthlyViews: 0 // Will be fetched from analytics when implemented
      })

      setRecentContent({
        news: Array.isArray(newsRes) ? newsRes.slice(0, 5) : [],
        events: Array.isArray(eventsRes) ? eventsRes.slice(0, 5) : [],
        videos: Array.isArray(videosRes) ? videosRes.slice(0, 5) : []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      name: t('admin.stats.totalNews', 'Total News', 'மொத்த செய்திகள்'),
      value: stats.totalNews.toString(),
      icon: NewspaperIcon,
      change: '',
      changeType: 'neutral',
      href: '/admin/news'
    },
    {
      name: t('admin.stats.totalEvents', 'Total Events', 'மொத்த நிகழ்வுகள்'),
      value: stats.totalEvents.toString(),
      icon: CalendarIcon,
      change: '',
      changeType: 'neutral',
      href: '/admin/events'
    },
    {
      name: t('admin.stats.totalVideos', 'Total Videos', 'மொத்த வீடியோக்கள்'),
      value: stats.totalVideos.toString(),
      icon: VideoCameraIcon,
      change: '',
      changeType: 'neutral',
      href: '/admin/videos'
    },
    {
      name: t('admin.stats.totalBusinesses', 'Total Businesses', 'மொத்த வணிகங்கள்'),
      value: stats.totalBusinesses.toString(),
      icon: BuildingOfficeIcon,
      change: '',
      changeType: 'neutral',
      href: '/admin/directory'
    },
    {
      name: t('admin.stats.totalUsers', 'Total Users', 'மொத்த பயனர்கள்'),
      value: stats.totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      change: '',
      changeType: 'neutral',
      href: '/admin/users'
    },
    {
      name: t('admin.stats.monthlyViews', 'Monthly Views', 'மாதாந்திர பார்வைகள்'),
      value: stats.monthlyViews.toLocaleString(),
      icon: ChartBarIcon,
      change: '',
      changeType: 'neutral',
      href: '/admin'
    }
  ]

  const recentNews = [
    {
      id: 1,
      title: 'Madurai Corporation announces new development projects',
      title_ta: 'மதுரை மாநகராட்சி புதிய வளர்ச்சி திட்டங்களை அறிவித்தது',
      status: 'published',
      views: 1250,
      publishedAt: '2024-03-15'
    },
    {
      id: 2,
      title: 'Local farmers adopt modern irrigation techniques',
      title_ta: 'உள்ளூர் விவசாயிகள் நவீன நீர்ப்பாசன நுட்பங்களை பின்பற்றுகின்றனர்',
      status: 'published',
      views: 890,
      publishedAt: '2024-03-14'
    },
    {
      id: 3,
      title: 'Meenakshi Temple festival preparations begin',
      title_ta: 'மீனாக்ஷி கோவில் திருவிழா ஏற்பாடுகள் தொடங்கின',
      status: 'draft',
      views: 0,
      publishedAt: null
    }
  ]

  const recentEvents = [
    {
      id: 1,
      title: 'Meenakshi Temple Annual Festival',
      title_ta: 'மீனாக்ஷி கோவில் வருடாந்திர திருவிழா',
      status: 'published',
      startDate: '2024-04-15',
      endDate: '2024-04-25'
    },
    {
      id: 2,
      title: 'Madurai Trade Fair 2024',
      title_ta: 'மதுரை வர்த்தக கண்காட்சி 2024',
      status: 'published',
      startDate: '2024-03-20',
      endDate: '2024-03-30'
    },
    {
      id: 3,
      title: 'Classical Music Concert',
      title_ta: 'கர்நாடக இசை நிகழ்ச்சி',
      status: 'draft',
      startDate: '2024-03-25',
      endDate: '2024-03-25'
    }
  ]

  const tabs = [
    { id: 'overview', name: t('admin.tabs.overview', 'Overview', 'கண்ணோட்டம்'), icon: ChartBarIcon },
    { id: 'news', name: t('admin.tabs.news', 'News', 'செய்திகள்'), icon: NewspaperIcon },
    { id: 'events', name: t('admin.tabs.events', 'Events', 'நிகழ்வுகள்'), icon: CalendarIcon },
    { id: 'videos', name: t('admin.tabs.videos', 'Videos', 'வீடியோக்கள்'), icon: VideoCameraIcon },
    { id: 'directory', name: t('admin.tabs.directory', 'Directory', 'முகவரி நூல்'), icon: BuildingOfficeIcon },
    { id: 'users', name: t('admin.tabs.users', 'Users', 'பயனர்கள்'), icon: UserGroupIcon }
  ]

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('admin.notPublished', 'Not Published', 'வெளியிடப்படவில்லை')
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = (type: string, id: number) => {
    if (type === 'news') {
      window.open('/admin/news', '_blank')
    } else if (type === 'videos') {
      window.open('/admin/videos', '_blank')
    } else if (type === 'magazines') {
      window.open('/admin/magazines', '_blank')
    } else {
      alert(t('admin.editFeature', 'Edit feature coming soon!', 'திருத்தும் அம்சம் விரைவில் வரும்!'))
    }
  }

  const handleDelete = (type: string, id: number) => {
    if (confirm(t('admin.confirmDelete', 'Are you sure you want to delete this item?', 'இந்த உருப்படியை நீக்க விரும்புகிறீர்களா?'))) {
      if (type === 'news') {
        window.open('/admin/news', '_blank')
      } else if (type === 'videos') {
        window.open('/admin/videos', '_blank')
      } else if (type === 'magazines') {
        window.open('/admin/magazines', '_blank')
      } else {
        alert(t('admin.deleteFeature', 'Delete feature coming soon!', 'நீக்கும் அம்சம் விரைவில் வரும்!'))
      }
    }
  }

  const handleAdd = (type: string) => {
    if (type === 'news') {
      window.open('/admin/news', '_blank')
    } else if (type === 'videos') {
      window.open('/admin/videos', '_blank')
    } else if (type === 'magazines') {
      window.open('/admin/magazines', '_blank')
    } else {
      alert(t('admin.addFeature', 'Add new feature coming soon!', 'புதிய அம்சம் சேர்க்கும் வசதி விரைவில் வரும்!'))
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-purple-800 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-purple-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard', 'Dashboard', 'டாஷ்போர்டு')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {t('admin.welcome', 'Welcome to Hello Madurai CMS', 'ஹலோ மதுரை CMS க்கு வரவேற்கிறோம்')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.name} href={stat.href}>
              <Card className="bg-white dark:bg-purple-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className={`ml-2 text-sm font-medium ${
                          stat.changeType === 'positive'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin.quickActions', 'Quick Actions', 'விரைவு நடவடிக்கைகள்')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/news">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <NewspaperIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {t('admin.addNews', 'Add News', 'செய்தி சேர்க்க')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/videos">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-red-200 dark:border-red-700 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <VideoCameraIcon className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="font-medium text-red-900 dark:text-red-100">
                  {t('admin.addVideo', 'Add Video', 'வீடியோ சேர்க்க')}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/events">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="font-medium text-green-900 dark:text-green-100">
                  {t('admin.addEvent', 'Add Event', 'நிகழ்வு சேர்க்க')}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Content */}
      {recentContent.news.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.recentContent', 'Recent Content', 'சமீபத்திய உள்ளடக்கம்')}
          </h2>
          <Card className="bg-white dark:bg-purple-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentContent.news.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-purple-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.category} • {formatDate(item.publishedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        {item.views || 0}
                      </span>
                      <Link href="/admin/news">
                        <Button size="sm" variant="outline">
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
