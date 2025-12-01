'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MusicalNoteIcon,
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon
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

export default function RadioMusicAdminPage() {
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [singers, setSingers] = useState<Singer[]>([])
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [loading, setLoading] = useState(true)
  const [showSingerForm, setShowSingerForm] = useState(false)
  const [showSongForm, setShowSongForm] = useState(false)
  const [editingSinger, setEditingSinger] = useState<Singer | null>(null)
  const [editingSong, setEditingSong] = useState<RadioSong | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Create local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('📤 Uploading singer image...')
      const response = await fetch('/api/upload/singer-image', {
        method: 'POST',
        body: formData,
      })

      console.log('📥 Upload response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload successful:', data)
        setSingerFormData({ ...singerFormData, imageUrl: data.url })
        toast.success('✅ Image uploaded and resized to 400x400px!')
      } else {
        const errorData = await response.json()
        console.error('❌ Upload failed:', errorData)
        toast.error(errorData.error || 'Failed to upload image')
        setImagePreview('') // Clear preview on error
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      toast.error('Error uploading image')
      setImagePreview('') // Clear preview on error
    } finally {
      setUploadingImage(false)
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
        setImagePreview('') // Clear preview
        toast.success(editingSinger ? '✅ Singer updated!' : '✅ Singer created!')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to save singer')
      }
    } catch (error) {
      console.error('Error saving singer:', error)
      toast.error('Error saving singer')
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
    setImagePreview('') // Clear local preview when editing (will show saved image)
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
    const matchesSinger = !selectedSinger || song.singerId === selectedSinger.id
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

      {/* Back Button (if singer selected) */}
      {selectedSinger && (
        <div className="mb-6">
          <Button
            onClick={() => {
              setSelectedSinger(null)
              setShowSongForm(false)
              setEditingSong(null)
            }}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            ← Back to Singers
          </Button>
        </div>
      )}

      {/* Singers View */}
      {!selectedSinger && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Singers ({singers.length})</h2>
            <Button
              onClick={() => {
                setShowSingerForm(!showSingerForm)
                setEditingSinger(null)
                setSingerFormData({ name: '', name_ta: '', imageUrl: '', categoryId: categories[0]?.id || '' })
                setImagePreview('') // Clear preview
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Singer Image (400x400px)</label>

                  {/* Image Preview */}
                  {(imagePreview || singerFormData.imageUrl) && (
                    <div className="mb-3 relative">
                      <img
                        src={imagePreview || singerFormData.imageUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        onError={(e) => {
                          console.error('Image failed to load:', imagePreview || singerFormData.imageUrl)
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <div className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        uploadingImage
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                          : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                      }`}>
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <PhotoIcon className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">
                              {singerFormData.imageUrl || imagePreview ? 'Change Image' : 'Upload Image'}
                            </span>
                          </>
                        )}
                      </div>
                    </label>

                    {(singerFormData.imageUrl || imagePreview) && (
                      <Button
                        onClick={() => {
                          setSingerFormData({ ...singerFormData, imageUrl: '' })
                          setImagePreview('')
                        }}
                        className="bg-red-50 text-red-600 hover:bg-red-100"
                        disabled={uploadingImage}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 400x400px square image, max 5MB (JPEG, PNG, WebP)
                  </p>
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
                    setImagePreview('') // Clear preview
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Singers Grid */}
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : filteredSingers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No singers found. Create your first singer!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredSingers.map((singer) => (
                <div key={singer.id} className="group">
                  {/* Square Image - Clickable */}
                  <div
                    onClick={() => setSelectedSinger(singer)}
                    className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-200 cursor-pointer group-hover:ring-4 group-hover:ring-blue-300 transition-all"
                  >
                    {singer.imageUrl ? (
                      <img
                        src={singer.imageUrl}
                        alt={singer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="h-1/2 w-1/2 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Singer Info */}
                  <div className="text-center mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{singer.name}</h3>
                    {singer.name_ta && <p className="text-sm text-gray-600 truncate">{singer.name_ta}</p>}
                    <p className="text-xs text-gray-500">{singer.category?.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{singer._count?.songs || 0} songs</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditSinger(singer)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs py-1"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteSinger(singer.id)}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs py-1"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Songs View (when singer selected) */}
      {selectedSinger && (
        <Card className="p-6">
          {/* Singer Header */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            {selectedSinger.imageUrl ? (
              <img
                src={selectedSinger.imageUrl}
                alt={selectedSinger.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{selectedSinger.name}</h2>
              {selectedSinger.name_ta && <p className="text-lg text-gray-600">{selectedSinger.name_ta}</p>}
              <p className="text-sm text-gray-500">{selectedSinger.category?.name}</p>
            </div>
            <Button
              onClick={() => {
                setShowSongForm(!showSongForm)
                setEditingSong(null)
                setSongFormData({ title: '', title_ta: '', audioUrl: '', duration: '', singerId: selectedSinger.id })
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Song
            </Button>
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
          ) : songs.filter(s => s.singerId === selectedSinger.id).length === 0 ? (
            <div className="text-center py-12">
              <MusicalNoteIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No songs yet. Add your first song!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs
                .filter(s => s.singerId === selectedSinger.id)
                .map((song, index) => (
                  <div key={song.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-center gap-4">
                      {/* Track Number */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{song.title}</h4>
                        {song.title_ta && <p className="text-sm text-gray-600">{song.title_ta}</p>}
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>⏱️ {song.duration || 'N/A'}</span>
                          <span>▶️ {song.plays} plays</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditSong(song)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm py-2 px-3"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteSong(song.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 text-sm py-2 px-3"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

