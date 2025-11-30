'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PlusIcon, PencilIcon, TrashIcon, MusicalNoteIcon, UserIcon } from '@heroicons/react/24/outline'

interface RadioCategory {
  id: string
  name: string
  name_ta: string
  slug: string
  orderNumber: number
  _count?: {
    singers: number
  }
}

interface Singer {
  id: string
  name: string
  name_ta: string | null
  imageUrl: string | null
  categoryId: string
  category?: RadioCategory
  _count?: {
    songs: number
  }
}

interface RadioSong {
  id: string
  title: string
  title_ta: string | null
  audioUrl: string
  duration: string | null
  plays: number
  singerId: string
  singer?: Singer
}

type TabType = 'categories' | 'singers' | 'songs'

export default function RadioNewAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('categories')
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [singers, setSingers] = useState<Singer[]>([])
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchSingers()
    fetchSongs()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/radio-categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSingers = async () => {
    try {
      const res = await fetch('/api/admin/singers')
      const data = await res.json()
      setSingers(data)
    } catch (error) {
      console.error('Error fetching singers:', error)
    }
  }

  const fetchSongs = async () => {
    try {
      const res = await fetch('/api/admin/radio-songs')
      const data = await res.json()
      setSongs(data)
    } catch (error) {
      console.error('Error fetching songs:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Radio Management (New)</h1>
        <p className="text-gray-600 mt-2">Manage radio categories, singers, and songs</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('singers')}
            className={`${
              activeTab === 'singers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Singers ({singers.length})
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`${
              activeTab === 'songs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Songs ({songs.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <Card className="p-6">
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Categories</h2>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Category
              </Button>
            </div>
            <p className="text-gray-500">Categories management coming soon...</p>
          </div>
        )}

        {activeTab === 'singers' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Singers</h2>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Singer
              </Button>
            </div>
            <p className="text-gray-500">Singers management coming soon...</p>
          </div>
        )}

        {activeTab === 'songs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Songs</h2>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Song
              </Button>
            </div>
            <p className="text-gray-500">Songs management coming soon...</p>
          </div>
        )}
      </Card>
    </div>
  )
}

