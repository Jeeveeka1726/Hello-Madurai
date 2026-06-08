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
  MicrophoneIcon,
  BuildingOfficeIcon,
  BellIcon,
  VideoCameraIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface ContentStats {
  news: number
  videos: number
  radio: number
  radioSongs?: number
  businesses: number
  events?: number
  magazines?: number
  reels?: number
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

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalDislikes: number
  totalComments: number
  totalSubscriptions: number
  totalDiscountCards: number
  totalShares: number
  periodMetrics?: {
    views: number
    likes: number
    comments: number
    subscriptions: number
    shares: number
    range: string
  }
  contentStats: ContentStats
  recentActivity: ActivityItem[]
  topContent: ContentItem[]
  userEngagement: EngagementData[]
  summary: {
    totalContent: number
    totalEngagement: number
    averageViewsPerContent: number
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Inline Bar Chart (pure SVG – no external lib required)
// ──────────────────────────────────────────────────────────────────────────────

interface BarChartProps {
  data: EngagementData[]
  metric: 'views' | 'likes' | 'comments'
  color: string
}

function BarChart({ data, metric, color }: BarChartProps) {
  const values = data.map((d) => d[metric])
  const maxVal = Math.max(...values, 1)
  const chartH = 120
  const barW = Math.max(4, Math.floor(560 / Math.max(data.length, 1)) - 2)

  return (
    <svg
      viewBox={`0 0 560 ${chartH + 24}`}
      className="w-full"
      aria-label={`${metric} bar chart`}
    >
      {/* Y-axis gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1={0}
          y1={chartH - frac * chartH}
          x2={560}
          y2={chartH - frac * chartH}
          stroke="#f0f0f0"
          strokeWidth={1}
        />
      ))}
      {values.map((v, i) => {
        const barH = Math.max(2, (v / maxVal) * chartH)
        const x = i * (barW + 2)
        return (
          <g key={i}>
            <rect
              x={x}
              y={chartH - barH}
              width={barW}
              height={barH}
              rx={2}
              fill={color}
              opacity={0.85}
            >
              <title>{`${data[i].date}: ${v.toLocaleString()}`}</title>
            </rect>
          </g>
        )
      })}
      {/* X-axis labels – show only first, middle, last */}
      {data.length > 0 && (
        <>
          <text x={0} y={chartH + 16} fontSize={9} fill="#9ca3af">
            {data[0].date.slice(5)}
          </text>
          {data.length > 2 && (
            <text
              x={Math.floor(data.length / 2) * (barW + 2)}
              y={chartH + 16}
              fontSize={9}
              fill="#9ca3af"
            >
              {data[Math.floor(data.length / 2)].date.slice(5)}
            </text>
          )}
          <text
            x={(data.length - 1) * (barW + 2)}
            y={chartH + 16}
            fontSize={9}
            fill="#9ca3af"
            textAnchor="end"
          >
            {data[data.length - 1].date.slice(5)}
          </text>
        </>
      )}
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Metric Card
// ──────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trendUp?: boolean
  trendPct?: string
  periodCount?: number // NEW: period-specific count
  periodLabel?: string // NEW: e.g., "Last 7 Days"
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trendUp,
  trendPct,
  periodCount,
  periodLabel,
}: MetricCardProps) {
  const formatted =
    value >= 1_000_000
      ? (value / 1_000_000).toFixed(1) + 'M'
      : value >= 1_000
      ? (value / 1_000).toFixed(1) + 'K'
      : value.toString()

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{formatted}</p>
      {periodCount !== undefined && periodLabel && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{periodLabel}:</span>
              <span className="font-semibold text-blue-600">+{periodCount.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-gray-400 italic">
              new {
                label.toLowerCase().includes('view') ? 'views' :
                label.toLowerCase().includes('like') ? 'likes' :
                label.toLowerCase().includes('comment') ? 'comments' :
                'subscribers'
              }
            </span>
          </div>
        </div>
      )}
      {trendPct !== undefined && (
        <div className="flex items-center mt-2 gap-1">
          {trendUp ? (
            <ArrowUpIcon className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <ArrowDownIcon className="h-3.5 w-3.5 text-red-400" />
          )}
          <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendPct}
          </span>
          <span className="text-xs text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────

interface AdminAnalyticsDashboardProps {
  className?: string
}

export default function AdminAnalyticsDashboard({ className = '' }: AdminAnalyticsDashboardProps) {
  const { t } = useLanguage()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [chartMetric, setChartMetric] = useState<'views' | 'likes' | 'comments'>('views')

  useEffect(() => {
    fetchAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'news':         return NewspaperIcon
      case 'video':        return VideoCameraIcon
      case 'radio':        return MicrophoneIcon
      case 'business':     return BuildingOfficeIcon
      case 'subscription': return BellIcon
      case 'comment':      return ChatBubbleLeftIcon
      default:             return ChartBarIcon
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'news':         return 'bg-red-100 text-red-700'
      case 'video':        return 'bg-blue-100 text-blue-700'
      case 'radio':        return 'bg-green-100 text-green-700'
      case 'business':     return 'bg-indigo-100 text-indigo-700'
      case 'subscription': return 'bg-yellow-100 text-yellow-700'
      case 'comment':      return 'bg-gray-100 text-gray-700'
      default:             return 'bg-gray-100 text-gray-600'
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`p-2 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-100 h-56 rounded-xl" />
            <div className="bg-gray-100 h-56 rounded-xl" />
          </div>
          <div className="bg-gray-100 h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────────

  if (!analytics) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          {t('admin.analytics.noData', 'No analytics data available', 'பகுப்பாய்வு தரவு எதுவும் கிடைக்கவில்லை')}
        </p>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const chartColors = {
    views:    '#3b82f6',
    likes:    '#ef4444',
    comments: '#22c55e',
  }

  return (
    <div className={`space-y-6 ${className}`}>

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t('admin.analytics.title', 'Analytics Dashboard', 'பகுப்பாய்வு டாஷ்போர்டு')}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {t(
              'admin.analytics.subtitle',
              'Track content performance and user engagement',
              'உள்ளடக்க செயல்திறன் மற்றும் பயனர் ஈடுபாட்டைக் கண்காணிக்கவும்'
            )}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-4 w-4 text-gray-500" />
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === r
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Metric Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label={t('admin.analytics.totalViews', 'Total Views (All Time)', 'மொத்த பார்வைகள் (அனைத்தும்)')}
          value={analytics.totalViews}
          icon={EyeIcon}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          periodCount={analytics.periodMetrics?.views}
          periodLabel={
            timeRange === '7d'
              ? 'Last 7 Days'
              : timeRange === '30d'
              ? 'Last 30 Days'
              : 'Last 90 Days'
          }
        />
        <MetricCard
          label={t('admin.analytics.totalLikes', 'Total Likes (All Time)', 'மொத்த விருப்பங்கள் (அனைத்தும்)')}
          value={analytics.totalLikes}
          icon={HeartIcon}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          periodCount={analytics.periodMetrics?.likes}
          periodLabel={
            timeRange === '7d'
              ? 'Last 7 Days'
              : timeRange === '30d'
              ? 'Last 30 Days'
              : 'Last 90 Days'
          }
        />
        <MetricCard
          label={t('admin.analytics.totalComments', 'Total Comments (All Time)', 'மொத்த கருத்துகள் (அனைத்தும்)')}
          value={analytics.totalComments}
          icon={ChatBubbleLeftIcon}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          periodCount={analytics.periodMetrics?.comments}
          periodLabel={
            timeRange === '7d'
              ? 'Last 7 Days'
              : timeRange === '30d'
              ? 'Last 30 Days'
              : 'Last 90 Days'
          }
        />
        <MetricCard
          label={t('admin.analytics.subscriptions', 'Newsletter Subscribers (All Time)', 'செய்திமடல் சந்தாதாரர்கள் (அனைத்தும்)')}
          value={analytics.totalSubscriptions}
          icon={UserGroupIcon}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          periodCount={analytics.periodMetrics?.subscriptions}
          periodLabel={
            timeRange === '7d'
              ? 'Last 7 Days'
              : timeRange === '30d'
              ? 'Last 30 Days'
              : 'Last 90 Days'
          }
        />
      </div>

      {/* ── Engagement Chart + Content Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {t('admin.analytics.engagementOverTime', 'Engagement Over Time', 'நேர கடந்த ஈடுபாடு')}
            </h3>
            <div className="flex gap-1">
              {(['views', 'likes', 'comments'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize ${
                    chartMetric === m
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-800 bg-gray-50'
                  }`}
                  style={chartMetric === m ? { backgroundColor: chartColors[m] } : {}}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {analytics.userEngagement && analytics.userEngagement.length > 0 ? (
            <BarChart
              data={analytics.userEngagement}
              metric={chartMetric}
              color={chartColors[chartMetric]}
            />
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
              No engagement data for this period
            </div>
          )}
        </div>

        {/* Content Statistics */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t('admin.analytics.contentStats', 'Content Statistics', 'உள்ளடக்க புள்ளிவிவரங்கள்')}
          </h3>
          <div className="space-y-3">
            {[
              { label: t('admin.analytics.news', 'News Articles', 'செய்தி கட்டுரைகள்'), count: analytics.contentStats?.news || 0, icon: NewspaperIcon, bg: 'bg-red-50', color: 'text-red-600', bar: '#ef4444' },
              { label: t('admin.analytics.videos', 'Videos', 'வீடியோக்கள்'), count: analytics.contentStats?.videos || 0, icon: VideoCameraIcon, bg: 'bg-blue-50', color: 'text-blue-600', bar: '#3b82f6' },
              { label: t('admin.analytics.radioSongs', 'Radio Songs', 'வானொலி பாடல்கள்'), count: analytics.contentStats?.radioSongs || 0, icon: MicrophoneIcon, bg: 'bg-green-50', color: 'text-green-600', bar: '#22c55e' },
              { label: t('admin.analytics.magazines', 'Magazines (ePaper)', 'பத்திரிகைகள்'), count: analytics.contentStats?.magazines || 0, icon: NewspaperIcon, bg: 'bg-purple-50', color: 'text-purple-600', bar: '#a855f7' },
              { label: t('admin.analytics.reels', 'Reels', 'ரீல்ஸ்'), count: analytics.contentStats?.reels || 0, icon: VideoCameraIcon, bg: 'bg-pink-50', color: 'text-pink-600', bar: '#ec4899' },
              { label: t('admin.analytics.businesses', 'Businesses', 'வணிகங்கள்'), count: analytics.contentStats?.businesses || 0, icon: BuildingOfficeIcon, bg: 'bg-indigo-50', color: 'text-indigo-600', bar: '#6366f1' },
              { label: t('admin.analytics.events', 'Events', 'நிகழ்வுகள்'), count: analytics.contentStats?.events || 0, icon: CalendarIcon, bg: 'bg-orange-50', color: 'text-orange-600', bar: '#f97316' },
            ].map(({ label, count, icon: Icon, bg, color, bar }) => {
              const total = Math.max(
                analytics.contentStats?.news || 0,
                analytics.contentStats?.videos || 0,
                analytics.contentStats?.radioSongs || 0,
                analytics.contentStats?.magazines || 0,
                analytics.contentStats?.reels || 0,
                analytics.contentStats?.businesses || 0,
                analytics.contentStats?.events || 0,
                1
              )
              const pct = Math.round((count / total) * 100)
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 truncate">{label}</span>
                      <span className="text-sm font-bold text-gray-900 ml-2">{count.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: bar }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Top Content + Recent Activity ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Performing Content */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t('admin.analytics.topContent', 'Top Performing Content', 'சிறந்த செயல்திறன் உள்ளடக்கம்')}
          </h3>
          {analytics.topContent && analytics.topContent.length > 0 ? (
            <div className="space-y-3">
              {analytics.topContent.slice(0, 6).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : index === 1
                        ? 'bg-gray-200 text-gray-700'
                        : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <EyeIcon className="h-3 w-3" />
                        {(item.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <HeartIcon className="h-3 w-3" />
                        {(item.likes || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getTypeBadge(item.type)}`}
                  >
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No content data for this period
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t('admin.analytics.recentActivity', 'Recent Activity', 'சமீபத்திய செயல்பாடு')}
          </h3>
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {analytics.recentActivity.slice(0, 12).map((activity) => {
                const IconComponent = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${getTypeBadge(activity.type)}`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium capitalize">{activity.action}</span>
                        {' — '}
                        <span className="text-gray-600 line-clamp-1">{activity.title}</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        {activity.user && <span>{activity.user}</span>}
                        {activity.user && <span>·</span>}
                        <span>{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Row ───────────────────────────────────────────────────────── */}
      {analytics.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              label: 'Total Content Items',
              value: analytics.summary.totalContent.toLocaleString(),
              icon: NewspaperIcon,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Total Engagement',
              value: analytics.summary.totalEngagement.toLocaleString(),
              icon: ChartBarIcon,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Avg Views / Content',
              value: analytics.summary.averageViewsPerContent.toFixed(1),
              icon: EyeIcon,
              color: 'text-teal-600',
              bg: 'bg-teal-50',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
