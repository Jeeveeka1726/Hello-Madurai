'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  EyeIcon, 
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  NewspaperIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  BuildingOfficeIcon,
  BellIcon,
  CreditCardIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSubscriptions: number
  totalDiscountCards: number
  contentStats: {
    news: number
    videos: number
    radio: number
    businesses: number
  }
  recentActivity: ActivityItem[]
  topContent: ContentItem[]
  userEngagement: EngagementData[]
}

interface ActivityItem {
  id: string
  type: 'news' | 'video' | 'radio' | 'business' | 'subscription' | 'comment'
  title: string
  action: string
  timestamp: string
  user?: string
}

interface ContentItem {
  id: string
  title: string
  type: 'news' | 'video' | 'radio'
  views: number
  likes: number
  comments: number
}

interface EngagementData {
  date: string
  views: number
  likes: number
  comments: number
  shares: number
}

interface AdminAnalyticsDashboardProps {
  className?: string
}

export default function AdminAnalyticsDashboard({ className = '' }: AdminAnalyticsDashboardProps) {
  const { t } = useLanguage()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'news': return NewspaperIcon
      case 'video': return VideoCameraIcon
      case 'radio': return MicrophoneIcon
      case 'business': return BuildingOfficeIcon
      case 'subscription': return BellIcon
      case 'comment': return ChatBubbleLeftIcon
      default: return ChartBarIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'text-red-600 bg-red-100'
      case 'video': return 'text-purple-600 bg-purple-100'
      case 'radio': return 'text-green-600 bg-green-100'
      case 'business': return 'text-blue-600 bg-blue-100'
      case 'subscription': return 'text-yellow-600 bg-yellow-100'
      case 'comment': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.analytics.noData', 'No analytics data available', 'பகுப்பாய்வு தரவு எதுவும் கிடைக்கவில்லை')}
        </p>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.analytics.title', 'Analytics Dashboard', 'பகுப்பாய்வு டாஷ்போர்டு')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.analytics.subtitle', 'Track your content performance and user engagement', 'உங்கள் உள்ளடக்க செயல்திறன் மற்றும் பயனர் ஈடுபாட்டைக் கண்காணிக்கவும்')}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range === '7d' && t('admin.analytics.7days', '7 Days', '7 நாட்கள்')}
              {range === '30d' && t('admin.analytics.30days', '30 Days', '30 நாட்கள்')}
              {range === '90d' && t('admin.analytics.90days', '90 Days', '90 நாட்கள்')}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.analytics.totalViews', 'Total Views', 'மொத்த பார்வைகள்')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.totalViews)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5%</span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.analytics.totalLikes', 'Total Likes', 'மொத்த விருப்பங்கள்')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.totalLikes)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8.2%</span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.analytics.totalComments', 'Total Comments', 'மொத்த கருத்துகள்')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.totalComments)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">-2.1%</span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.analytics.totalSubscriptions', 'Subscriptions', 'சந்தாக்கள்')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analytics.totalSubscriptions)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+15.7%</span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Content Statistics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.analytics.contentStats', 'Content Statistics', 'உள்ளடக்க புள்ளிவிவரங்கள்')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <NewspaperIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-gray-900 dark:text-white">
                  {t('admin.analytics.news', 'News Articles', 'செய்தி கட்டுரைகள்')}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.contentStats.news}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <VideoCameraIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-900 dark:text-white">
                  {t('admin.analytics.videos', 'Videos', 'வீடியோக்கள்')}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.contentStats.videos}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MicrophoneIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-white">
                  {t('admin.analytics.radio', 'Radio Shows', 'வானொலி நிகழ்ச்சிகள்')}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.contentStats.radio}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-white">
                  {t('admin.analytics.businesses', 'Businesses', 'வணிகங்கள்')}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {analytics.contentStats.businesses}
              </span>
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.analytics.topContent', 'Top Performing Content', 'சிறந்த செயல்திறன் உள்ளடக்கம்')}
          </h3>
          <div className="space-y-4">
            {analytics.topContent.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-3 w-3" />
                      {formatNumber(item.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartIcon className="h-3 w-3" />
                      {formatNumber(item.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="h-3 w-3" />
                      {formatNumber(item.comments)}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin.analytics.recentActivity', 'Recent Activity', 'சமீபத்திய செயல்பாடு')}
        </h3>
        <div className="space-y-4">
          {analytics.recentActivity.slice(0, 10).map((activity) => {
            const IconComponent = getActivityIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(activity.type)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.action}</span> {activity.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {activity.user && <span>by {activity.user}</span>}
                    <span>•</span>
                    <span>{formatDate(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

