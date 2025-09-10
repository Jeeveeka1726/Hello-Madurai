'use client'

import { useState } from 'react'
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
  EyeIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAdmin } from '@/contexts/AdminContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { logout } = useAdmin()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const stats = [
    {
      name: t('admin.stats.totalNews', 'Total News', 'மொத்த செய்திகள்'),
      value: '156',
      icon: NewspaperIcon,
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: t('admin.stats.totalEvents', 'Total Events', 'மொத்த நிகழ்வுகள்'),
      value: '43',
      icon: CalendarIcon,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: t('admin.stats.totalVideos', 'Total Videos', 'மொத்த வீடியோக்கள்'),
      value: '89',
      icon: VideoCameraIcon,
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: t('admin.stats.totalBusinesses', 'Total Businesses', 'மொத்த வணிகங்கள்'),
      value: '234',
      icon: BuildingOfficeIcon,
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: t('admin.stats.totalUsers', 'Total Users', 'மொத்த பயனர்கள்'),
      value: '1,247',
      icon: UserGroupIcon,
      change: '+23%',
      changeType: 'positive'
    },
    {
      name: t('admin.stats.monthlyViews', 'Monthly Views', 'மாதாந்திர பார்வைகள்'),
      value: '45,678',
      icon: ChartBarIcon,
      change: '+18%',
      changeType: 'positive'
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('admin.title', 'Admin Dashboard', 'நிர்வாக டாஷ்போர்டு')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {t('admin.subtitle', 'Manage your Hello Madurai content and settings', 'உங்கள் ஹலோ மதுரை உள்ளடக்கம் மற்றும் அமைப்புகளை நிர்வகிக்கவும்')}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('admin.logout', 'Logout', 'வெளியேறு')}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.name} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                          <div className="flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
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
                )
              })}
            </div>
            {/* Recent Activity */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent News */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    {t('admin.recentNews', 'Recent News', 'சமீபத்திய செய்திகள்')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentNews.map((news) => (
                      <div key={news.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {t(`news.${news.id}.title`, news.title, news.title_ta)}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`px-2 py-1 rounded-full ${
                              news.status === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {news.status}
                            </span>
                            <span className="ml-2">{formatDate(news.publishedAt)}</span>
                            {news.status === 'published' && (
                              <span className="ml-2 flex items-center">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                {news.views}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit('news', news.id)} className="p-1">
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete('news', news.id)} className="p-1 text-red-600 hover:text-red-700">
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    {t('admin.recentEvents', 'Recent Events', 'சமீபத்திய நிகழ்வுகள்')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {t(`events.${event.id}.title`, event.title, event.title_ta)}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`px-2 py-1 rounded-full ${
                              event.status === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {event.status}
                            </span>
                            <span className="ml-2">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit('events', event.id)} className="p-1">
                            <PencilIcon className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete('events', event.id)} className="p-1 text-red-600 hover:text-red-700">
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab !== 'overview' && (
          <div className="text-center py-12">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-12">
                <div className="mx-auto max-w-md">
                  {tabs.find(tab => tab.id === activeTab) && (() => {
                    const Icon = tabs.find(tab => tab.id === activeTab)!.icon
                    return <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  })()}
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {tabs.find(tab => tab.id === activeTab)?.name} {t('admin.management', 'Management', 'மேலாண்மை')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {activeTab === 'news'
                      ? t('admin.newsReady', 'News management is ready! Click below to manage your news articles.', 'செய்தி மேலாண்மை தயார்! உங்கள் செய்தி கட்டுரைகளை நிர்வகிக்க கீழே கிளிக் செய்யவும்.')
                      : t('admin.comingSoon', 'This feature is coming soon! You will be able to manage all your content from here.', 'இந்த அம்சம் விரைவில் வரும்! நீங்கள் இங்கிருந்து உங்கள் அனைத்து உள்ளடக்கத்தையும் நிர்வகிக்க முடியும்.')
                    }
                  </p>
                  <Button onClick={() => handleAdd(activeTab)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {activeTab === 'news'
                      ? t('admin.manageNews', 'Manage News', 'செய்திகளை நிர்வகிக்க')
                      : `${t('admin.addNew', 'Add New', 'புதிதாக சேர்க்க')} ${tabs.find(tab => tab.id === activeTab)?.name}`
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
