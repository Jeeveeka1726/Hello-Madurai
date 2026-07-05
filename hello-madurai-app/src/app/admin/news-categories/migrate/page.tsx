'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface MigrationStats {
  categories: Array<{
    id: string
    name: string
    slug: string
    newsCount: number
  }>
  orphanedCategories: Array<{
    slug: string
    newsCount: number
  }>
  unusedCategories: Array<{
    id: string
    name: string
    slug: string
  }>
  totalNews: number
}

export default function NewsCategoryMigrationPage() {
  const { language } = useLanguage()
  const [stats, setStats] = useState<MigrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [selectedOrphan, setSelectedOrphan] = useState<string>('')
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/news-categories/migrate-news')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Error loading migration stats')
    } finally {
      setLoading(false)
    }
  }

  const handleMigrate = async () => {
    if (!selectedOrphan || !selectedTarget) {
      toast.error('Please select both old and new categories')
      return
    }

    if (!confirm(`Migrate all news from "${selectedOrphan}" to "${selectedTarget}"?`)) {
      return
    }

    setMigrating(true)
    try {
      const response = await fetch('/api/admin/news-categories/migrate-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldCategorySlug: selectedOrphan,
          newCategorySlug: selectedTarget
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully migrated ${result.count} articles to "${result.categoryName}"`)
        setSelectedOrphan('')
        setSelectedTarget('')
        await fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error migrating articles')
      }
    } catch (error) {
      console.error('Error migrating:', error)
      toast.error('Error migrating articles')
    } finally {
      setMigrating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {language === 'ta' ? 'செய்தி வகை இடம்பெயர்வு' : 'News Category Migration'}
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total Categories</div>
              <div className="text-3xl font-bold text-blue-600">{stats?.categories.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total News Articles</div>
              <div className="text-3xl font-bold text-green-600">{stats?.totalNews || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Orphaned Categories</div>
              <div className="text-3xl font-bold text-red-600">{stats?.orphanedCategories.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orphaned Categories Warning */}
        {stats && stats.orphanedCategories.length > 0 && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardHeader>
              <CardTitle className="text-red-900">
                ⚠️ {language === 'ta' ? 'அனாதை வகைகள் கண்டறியப்பட்டன' : 'Orphaned Categories Found'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 mb-4">
                {language === 'ta'
                  ? 'இந்த வகைகள் செய்திகளில் பயன்படுத்தப்படுகின்றன, ஆனால் வகை மேலாண்மையில் இல்லை. அவற்றை இடம்பெயர்க்க வேண்டும்.'
                  : 'These categories are used in news articles but don\'t exist in category management. They need to be migrated.'}
              </p>
              <div className="space-y-2">
                {stats.orphanedCategories.map((orphan) => (
                  <div key={orphan.slug} className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="font-medium text-gray-900">{orphan.slug}</span>
                    <span className="text-sm text-gray-600">{orphan.newsCount} articles</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Migration Tool */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle>
              {language === 'ta' ? 'செய்திகளை இடம்பெயர்க்கவும்' : 'Migrate News Articles'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {language === 'ta'
                ? 'பழைய வகையிலிருந்து புதிய வகைக்கு அனைத்து செய்திகளையும் நகர்த்தவும்.'
                : 'Move all news articles from an old category to a new category.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'பழைய வகை' : 'From Category (Old Slug)'}
                </label>
                <select
                  value={selectedOrphan}
                  onChange={(e) => setSelectedOrphan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select old category...</option>
                  {stats?.orphanedCategories.map((orphan) => (
                    <option key={orphan.slug} value={orphan.slug}>
                      {orphan.slug} ({orphan.newsCount} articles)
                    </option>
                  ))}
                  {stats?.categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name} - {cat.slug} ({cat.newsCount} articles)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRightIcon className="h-6 w-6 text-gray-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ta' ? 'புதிய வகை' : 'To Category (New Slug)'}
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select target category...</option>
                  {stats?.categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleMigrate}
                disabled={!selectedOrphan || !selectedTarget || migrating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {migrating ? 'Migrating...' : (language === 'ta' ? 'இடம்பெயர்க்கவும்' : 'Migrate Articles')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Overview */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              {language === 'ta' ? 'வகை கண்ணோட்டம்' : 'Category Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{cat.name}</div>
                    <div className="text-sm text-gray-500">{cat.slug}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{cat.newsCount}</div>
                    <div className="text-xs text-gray-500">articles</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
