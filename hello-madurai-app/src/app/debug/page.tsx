'use client'

import { useState, useEffect } from 'react'

interface NewsItem {
  id: string
  title: string
  title_ta?: string
  content: string
  excerpt: string
  category: string
  author: string
  publishedAt: string
  views: number
  featured: boolean
}

export default function DebugPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching from /api/admin/news...')
        const response = await fetch('/api/admin/news')
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Data received:', data)
          setNews(data)
        } else {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          setError(`HTTP ${response.status}: ${errorText}`)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Database Debug Page
        </h1>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              News Articles ({news.length} found)
            </h2>
            
            {news.length === 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                No news articles found in database. Try running: npm run db:seed
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((article) => (
                  <div key={article.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h3>
                    {article.title_ta && (
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {article.title_ta}
                      </h4>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>ID: {article.id}</span>
                      <span>Category: {article.category}</span>
                      <span>Author: {article.author}</span>
                      <span>Views: {article.views}</span>
                      <span>Featured: {article.featured ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="flex space-x-4">
            <a 
              href="/admin/news" 
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Go to Admin News
            </a>
            <a 
              href="/news" 
              className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
            >
              Go to Public News
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
