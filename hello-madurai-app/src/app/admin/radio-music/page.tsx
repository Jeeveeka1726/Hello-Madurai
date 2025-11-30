'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MusicalNoteIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

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
  singer?: Singer & { category?: RadioCategory }
}

type TabType = 'singers' | 'songs'

export default function RadioMusicAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('singers')
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [singers, setSingers] = useState<Singer[]>([])
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [loading, setLoading] = useState(true)
  const [showSingerForm, setShowSingerForm] = useState(false)
  const [showSongForm, setShowSongForm] = useState(false)
  const [editingSinger, setEditingSinger] = useState<Singer | null>(null)
  const [editingSong, setEditingSong] = useState<RadioSong | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSinger, setSelectedSinger] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const [singerFormData, setSingerFormData] = useState({
    name: '',
    name_ta: '',
    imageUrl: '',
    categoryId: ''
  })

  const [songFormData, setSongFormData] = useState({
    title: '',
    title_ta: '',
    audioUrl: '',
    duration: '',
    singerId: ''
  })

  useEffect(() => {
    initializeCategories()
    fetchSingers()
    fetchSongs()
  }, [])

  const initializeCategories = async () => {
    try {
      // Check if categories exist
      const res = await fetch('/api/admin/radio-categories')
      let data = await res.json()
      
      // If no categories, create default ones
      if (data.length === 0) {
        const defaultCategories = [
          { name: 'Songs', name_ta: 'பாடல்கள்', slug: 'songs', orderNumber: 1 },
          { name: 'God Songs', name_ta: 'பக்தி பாடல்கள்', slug: 'god-songs', orderNumber: 2 },
          { name: 'Speech', name_ta: 'சொற்பொழிவு', slug: 'speech', orderNumber: 3 },
          { name: 'Comedy', name_ta: 'நகைச்சுவை', slug: 'comedy', orderNumber: 4 }
        ]

        for (const cat of defaultCategories) {
          await fetch('/api/admin/radio-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cat)
          })
        }

        // Fetch again
        const newRes = await fetch('/api/admin/radio-categories')
        data = await newRes.json()
      }

      setCategories(data)
      if (data.length > 0) {
        setSelectedCategory(data[0].id)
        setSingerFormData(prev => ({ ...prev, categoryId: data[0].id }))
      }
    } catch (error) {
      console.error('Error initializing categories:', error)
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

  const handleSaveSinger = async () => {
    try {
      const url = editingSinger
        ? `/api/admin/singers/${editingSinger.id}`
        : '/api/admin/singers'

      const res = await fetch(url, {
        method: editingSinger ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singerFormData)
      })

      if (res.ok) {
        await fetchSingers()
        setShowSingerForm(false)
        setEditingSinger(null)
        setSingerFormData({ name: '', name_ta: '', imageUrl: '', categoryId: categories[0]?.id || '' })
      }
    } catch (error) {
      console.error('Error saving singer:', error)
    }
  }

  const handleDeleteSinger = async (id: string) => {
    if (!confirm('Are you sure you want to delete this singer? All their songs will also be deleted.')) return

    try {
      const res = await fetch(`/api/admin/singers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchSingers()
        await fetchSongs()
      }
    } catch (error) {
      console.error('Error deleting singer:', error)
    }
  }

  const handleEditSinger = (singer: Singer) => {
    setEditingSinger(singer)
    setSingerFormData({
      name: singer.name,
      name_ta: singer.name_ta || '',
      imageUrl: singer.imageUrl || '',
      categoryId: singer.categoryId
    })
    setShowSingerForm(true)
  }

  const handleSaveSong = async () => {
    try {
      const url = editingSong
        ? `/api/admin/radio-songs/${editingSong.id}`
        : '/api/admin/radio-songs'

      const res = await fetch(url, {
        method: editingSong ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songFormData)
      })

      if (res.ok) {
        await fetchSongs()
        setShowSongForm(false)
        setEditingSong(null)
        setSongFormData({ title: '', title_ta: '', audioUrl: '', duration: '', singerId: '' })
      }
    } catch (error) {
      console.error('Error saving song:', error)
    }
  }

  const handleDeleteSong = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return

    try {
      const res = await fetch(`/api/admin/radio-songs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchSongs()
      }
    } catch (error) {
      console.error('Error deleting song:', error)
    }
  }

  const handleEditSong = (song: RadioSong) => {
    setEditingSong(song)
    setSongFormData({
      title: song.title,
      title_ta: song.title_ta || '',
      audioUrl: song.audioUrl,
      duration: song.duration || '',
      singerId: song.singerId
    })
    setShowSongForm(true)
  }

  const filteredSingers = singers.filter(singer => {
    const matchesCategory = !selectedCategory || singer.categoryId === selectedCategory
    const matchesSearch = !searchQuery ||
      singer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      singer.name_ta?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredSongs = songs.filter(song => {
    const matchesSinger = !selectedSinger || song.singerId === selectedSinger
    const matchesSearch = !searchQuery ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.title_ta?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSinger && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Radio Music Management</h1>
        <p className="text-gray-600 mt-2">Manage singers and their songs by category</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('singers')}
            className={`${
              activeTab === 'singers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <UserIcon className="h-5 w-5 mr-2" />
            Singers ({singers.length})
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`${
              activeTab === 'songs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <MusicalNoteIcon className="h-5 w-5 mr-2" />
            Songs ({songs.length})
          </button>
        </nav>
      </div>

      {/* Singers Tab */}
      {activeTab === 'singers' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Singers</h2>
            <Button
              onClick={() => {
                setShowSingerForm(!showSingerForm)
                setEditingSinger(null)
                setSingerFormData({ name: '', name_ta: '', imageUrl: '', categoryId: categories[0]?.id || '' })
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Singer
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.name_ta})</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search singers..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Singer Form */}
          {showSingerForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">{editingSinger ? 'Edit Singer' : 'Add New Singer'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={singerFormData.name}
                    onChange={(e) => setSingerFormData({ ...singerFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Tamil)</label>
                  <input
                    type="text"
                    value={singerFormData.name_ta}
                    onChange={(e) => setSingerFormData({ ...singerFormData, name_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={singerFormData.categoryId}
                    onChange={(e) => setSingerFormData({ ...singerFormData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name} ({cat.name_ta})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (400x400px)</label>
                  <input
                    type="text"
                    value={singerFormData.imageUrl}
                    onChange={(e) => setSingerFormData({ ...singerFormData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveSinger} className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingSinger ? 'Update Singer' : 'Create Singer'}
                </Button>
                <Button
                  onClick={() => {
                    setShowSingerForm(false)
                    setEditingSinger(null)
                    setSingerFormData({ name: '', name_ta: '', imageUrl: '', categoryId: categories[0]?.id || '' })
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Singers List */}
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : filteredSingers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No singers found. Create your first singer!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSingers.map((singer) => (
                <div key={singer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {singer.imageUrl ? (
                      <img
                        src={singer.imageUrl}
                        alt={singer.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{singer.name}</h3>
                      {singer.name_ta && <p className="text-sm text-gray-600">{singer.name_ta}</p>}
                      <p className="text-xs text-gray-500 mt-1">{singer.category?.name}</p>
                      <p className="text-xs text-gray-500">{singer._count?.songs || 0} songs</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleEditSinger(singer)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteSinger(singer.id)}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Songs Tab */}
      {activeTab === 'songs' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Songs</h2>
            <Button
              onClick={() => {
                setShowSongForm(!showSongForm)
                setEditingSong(null)
                setSongFormData({ title: '', title_ta: '', audioUrl: '', duration: '', singerId: singers[0]?.id || '' })
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Song
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Singer</label>
              <select
                value={selectedSinger}
                onChange={(e) => setSelectedSinger(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Singers</option>
                {singers.map(singer => (
                  <option key={singer.id} value={singer.id}>{singer.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Song Form */}
          {showSongForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">{editingSong ? 'Edit Song' : 'Add New Song'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={songFormData.title}
                    onChange={(e) => setSongFormData({ ...songFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Tamil)</label>
                  <input
                    type="text"
                    value={songFormData.title_ta}
                    onChange={(e) => setSongFormData({ ...songFormData, title_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Singer *</label>
                  <select
                    required
                    value={songFormData.singerId}
                    onChange={(e) => setSongFormData({ ...songFormData, singerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Singer</option>
                    {singers.map(singer => (
                      <option key={singer.id} value={singer.id}>{singer.name} - {singer.category?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g., 3:45)</label>
                  <input
                    type="text"
                    value={songFormData.duration}
                    onChange={(e) => setSongFormData({ ...songFormData, duration: e.target.value })}
                    placeholder="3:45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audio URL *</label>
                  <input
                    type="text"
                    required
                    value={songFormData.audioUrl}
                    onChange={(e) => setSongFormData({ ...songFormData, audioUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveSong} className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingSong ? 'Update Song' : 'Create Song'}
                </Button>
                <Button
                  onClick={() => {
                    setShowSongForm(false)
                    setEditingSong(null)
                    setSongFormData({ title: '', title_ta: '', audioUrl: '', duration: '', singerId: '' })
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Songs List */}
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : filteredSongs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No songs found. Create your first song!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Singer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plays</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSongs.map((song) => (
                    <tr key={song.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{song.title}</div>
                        {song.title_ta && <div className="text-sm text-gray-500">{song.title_ta}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{song.singer?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {song.singer?.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {song.duration || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {song.plays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditSong(song)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

