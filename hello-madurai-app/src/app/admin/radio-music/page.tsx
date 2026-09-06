'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/admin/FileUpload'
import { toast } from 'react-hot-toast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MusicalNoteIcon,
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon
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
  featured: boolean
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
  audioType: string
  duration: string | null
  plays: number
  singerId: string
  singer?: Singer & { category?: RadioCategory }
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  isAdminReply: boolean
  replies: Comment[]
  _count: {
    replies: number
  }
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
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [fetchingDurations, setFetchingDurations] = useState(false)
  const [durationProgress, setDurationProgress] = useState({ current: 0, total: 0 })

  const [singerFormData, setSingerFormData] = useState({
    name: '',
    name_ta: '',
    imageUrl: '',
    featured: false,
    orderNumber: 0,
    categoryId: ''
  })

  const [songFormData, setSongFormData] = useState({
    title: '',
    title_ta: '',
    audioUrl: '',
    audioType: 'direct' as 'direct' | 'embed',
    duration: '',
    singerId: ''
  })

  useEffect(() => {
    initializeCategories()
    fetchSingers()
    fetchSongs()
  }, [])

  useEffect(() => {
    if (selectedSinger) {
      fetchComments()
    }
  }, [selectedSinger])

  const initializeCategories = async () => {
    try {
      // Check if categories exist
      const res = await fetch('/api/admin/radio-categories')
      let data = await res.json()
      
      // If no categories, create default ones
      if (data.length === 0) {
        const defaultCategories = [
          { name: 'Talk', name_ta: 'பேசுவோம்', slug: 'talk', orderNumber: 1 },
          { name: 'Agri', name_ta: 'விவசாயம்', slug: 'agri', orderNumber: 2 },
          { name: 'Spirituality', name_ta: 'ஆன்மீகம்', slug: 'spirituality', orderNumber: 3 },
          { name: 'Business', name_ta: 'தொழில்', slug: 'business', orderNumber: 4 },
          { name: 'Medical', name_ta: 'மருத்துவம்', slug: 'medical', orderNumber: 5 },
          { name: 'Education', name_ta: 'கல்வி', slug: 'education', orderNumber: 6 },
          { name: 'Women', name_ta: 'மகளிர்', slug: 'women', orderNumber: 7 },
          { name: 'Motors', name_ta: 'வாகனங்கள்', slug: 'motors', orderNumber: 8 },
          { name: 'Job', name_ta: 'வேலை', slug: 'job', orderNumber: 9 },
          { name: 'Law', name_ta: 'சட்டம்', slug: 'law', orderNumber: 10 }
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
      if (!res.ok) {
        console.error('Failed to fetch songs:', res.status, res.statusText)
        setSongs([]) // Set empty array on error
        return
      }
      const data = await res.json()
      // Ensure data is an array
      setSongs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching songs:', error)
      setSongs([]) // Set empty array on error
    }
  }

  const handleSongDragEnd = async (result: any) => {
    if (!result.destination || !selectedSinger) return

    // Get songs for current singer only
    const singerSongs = songs.filter(s => s.singerId === selectedSinger.id)
    const otherSongs = songs.filter(s => s.singerId !== selectedSinger.id)

    const items = Array.from(singerSongs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order numbers
    const updatedSongs = items.map((song, index) => ({
      ...song,
      orderNumber: index
    }))

    // Update local state immediately
    setSongs([...otherSongs, ...updatedSongs])

    try {
      const response = await fetch('/api/admin/radio-songs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: updatedSongs })
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      toast.success('Audio order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update audio order')
      // Revert on error
      fetchSongs()
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
        setSingerFormData({ name: '', name_ta: '', imageUrl: '', featured: false, orderNumber: 0, categoryId: categories[0]?.id || '' })
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
      featured: singer.featured || false,
      orderNumber: singer.orderNumber || 0,
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
        setSongFormData({ title: '', title_ta: '', audioUrl: '', audioType: 'direct', duration: '', singerId: '' })
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
      audioType: song.audioType || 'direct',
      duration: song.duration || '',
      singerId: song.singerId
    })
    setShowSongForm(true)
  }

  const fetchComments = async () => {
    if (!selectedSinger) return

    setLoadingComments(true)
    try {
      const response = await fetch(`/api/singers/${selectedSinger.id}/comments`)
      const data = await response.json()
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to fetch comments')
    } finally {
      setLoadingComments(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment and all its replies?')) return

    try {
      const response = await fetch(`/api/admin/radio-comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchComments()
        toast.success('Comment deleted!')
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('An error occurred')
    }
  }

  const handleReplyToComment = async (commentId: string) => {
    const content = replyContent[commentId]?.trim()
    if (!content) {
      toast.error('Please enter a reply')
      return
    }

    try {
      const response = await fetch(`/api/admin/radio-comments/${commentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: 'Hello Madurai Admin',
          content: content.trim(),
        }),
      })

      if (response.ok) {
        await fetchComments()
        setReplyContent({ ...replyContent, [commentId]: '' })
        setReplyingTo(null)
        toast.success('Reply sent successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('An error occurred')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchAllDurations = async () => {
    if (!selectedSinger) {
      toast.error('Please select an artist first')
      return
    }

    const songsToUpdate = filteredSongs.filter(song => !song.duration || song.duration === '0:00')

    if (songsToUpdate.length === 0) {
      toast.success('All songs already have duration set!')
      return
    }

    if (!confirm(`Fetch duration for ${songsToUpdate.length} songs? This may take a few minutes.`)) {
      return
    }

    setFetchingDurations(true)
    setDurationProgress({ current: 0, total: songsToUpdate.length })

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < songsToUpdate.length; i++) {
      const song = songsToUpdate[i]
      setDurationProgress({ current: i + 1, total: songsToUpdate.length })

      try {
        // Create audio element to load metadata
        const audio = new Audio()

        // Wait for metadata to load
        const duration = await new Promise<number>((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration)
          })
          audio.addEventListener('error', (e) => {
            reject(new Error('Failed to load audio'))
          })
          audio.src = song.audioUrl
          audio.load()
        })

        // Skip Infinity/NaN durations (common for live streams with unknown length)
        if (!isFinite(duration) || duration <= 0) {
          throw new Error('Duration not available (stream has no fixed length)')
        }

        // Format duration as MM:SS
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`

        // Update in database
        const response = await fetch(`/api/radio-songs/${song.id}/duration`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration: formattedDuration })
        })

        if (response.ok) {
          successCount++
          console.log(`✅ Updated duration for "${song.title}": ${formattedDuration}`)
        } else {
          failCount++
          console.error(`❌ Failed to update duration for "${song.title}"`)
        }
      } catch (error) {
        failCount++
        console.error(`❌ Error fetching duration for "${song.title}":`, error)
      }
    }

    setFetchingDurations(false)
    setDurationProgress({ current: 0, total: 0 })

    // Refresh songs list
    await fetchSongs()

    toast.success(`✅ Updated ${successCount} songs${failCount > 0 ? `, ${failCount} failed` : ''}`)
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
        <h1 className="text-3xl font-bold text-gray-900">Digital FM Management</h1>
        <p className="text-gray-600 mt-2">Manage speakers and their audios by category</p>
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
            ← Back to Speakers
          </Button>
        </div>
      )}

      {/* Singers View */}
      {!selectedSinger && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Speakers ({singers.length})</h2>
            <Button
              onClick={() => {
                setShowSingerForm(!showSingerForm)
                setEditingSinger(null)
                setSingerFormData({ name: '', name_ta: '', imageUrl: '', featured: false, orderNumber: 0, categoryId: categories[0]?.id || '' })
                setImagePreview('') // Clear preview
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Speaker
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
                  placeholder="Search speakers..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Singer Form */}
          {showSingerForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">{editingSinger ? 'Edit Speaker' : 'Add New Speaker'}</h3>
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={singerFormData.featured}
                      onChange={(e) => setSingerFormData({ ...singerFormData, featured: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Speaker ⭐</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">Featured speakers appear first in the list</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                  <input
                    type="number"
                    min="0"
                    value={singerFormData.orderNumber}
                    onChange={(e) => setSingerFormData({ ...singerFormData, orderNumber: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0 = default order)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaker Image (400x400px)</label>

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
                  {editingSinger ? 'Update Speaker' : 'Create Speaker'}
                </Button>
                <Button
                  onClick={() => {
                    setShowSingerForm(false)
                    setEditingSinger(null)
                    setSingerFormData({ name: '', name_ta: '', imageUrl: '', featured: false, orderNumber: 0, categoryId: categories[0]?.id || '' })
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
            <p className="text-center py-8 text-gray-500">No speakers found. Create your first speaker!</p>
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
                    <p className="text-xs text-blue-600 font-medium">{singer._count?.songs || 0} audios</p>
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
            <div className="flex gap-2">
              <Button
                onClick={fetchAllDurations}
                disabled={fetchingDurations}
                className="bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {fetchingDurations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {durationProgress.current}/{durationProgress.total}
                  </>
                ) : (
                  <>
                    <MusicalNoteIcon className="h-5 w-5 mr-2" />
                    Fetch Durations
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowSongForm(!showSongForm)
                  setEditingSong(null)
                  setSongFormData({ title: '', title_ta: '', audioUrl: '', audioType: 'direct', duration: '', singerId: selectedSinger.id })
                }}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Audio
              </Button>
            </div>
          </div>

          {/* Song Form */}
          {showSongForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">{editingSong ? 'Edit Audio' : 'Add New Audio'}</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio Type *
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="audioType"
                        value="direct"
                        checked={songFormData.audioType === 'direct'}
                        onChange={(e) => setSongFormData({ ...songFormData, audioType: e.target.value as 'direct' | 'embed' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Direct Audio File/URL</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="audioType"
                        value="embed"
                        checked={songFormData.audioType === 'embed'}
                        onChange={(e) => setSongFormData({ ...songFormData, audioType: e.target.value as 'direct' | 'embed' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Audio Stream (Radio/SoundCloud/etc.)</span>
                    </label>
                  </div>

                  <FileUpload
                    label={songFormData.audioType === 'direct'
                      ? "Audio File * (MP3, WAV, OGG, AAC, M4A, FLAC)"
                      : "Audio Stream URL * (Radio stations, SoundCloud, etc.)"
                    }
                    fileType={songFormData.audioType === 'direct' ? "audio" : "url"}
                    currentFile={songFormData.audioUrl}
                    currentUrl={songFormData.audioUrl}
                    onFileUpload={(url) => setSongFormData({ ...songFormData, audioUrl: url })}
                    onUrlChange={(url) => setSongFormData({ ...songFormData, audioUrl: url })}
                    accept={songFormData.audioType === 'direct' ? "audio/*" : undefined}
                    maxSize={100}
                    showUrlOption={true}
                    showFileUpload={songFormData.audioType === 'direct'}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveSong} className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingSong ? 'Update Audio' : 'Create Audio'}
                </Button>
                <Button
                  onClick={() => {
                    setShowSongForm(false)
                    setEditingSong(null)
                    setSongFormData({ title: '', title_ta: '', audioUrl: '', audioType: 'direct', duration: '', singerId: '' })
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
              <p className="text-gray-500">No audios yet. Add your first audio!</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleSongDragEnd}>
              <Droppable droppableId="songs">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {songs
                      .filter(s => s.singerId === selectedSinger.id)
                      .sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0))
                      .map((song, index) => (
                        <Draggable key={song.id} draggableId={song.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border border-gray-200 rounded-lg p-4 transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg bg-blue-50' : 'hover:shadow-md bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                  <Bars3Icon className="h-5 w-5" />
                                </div>

                                {/* Track Number */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">{index + 1}</span>
                                </div>

                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900">{song.title}</h4>
                                  {song.title_ta && <p className="text-sm text-gray-600">{song.title_ta}</p>}
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>⏱️ {song.duration && !song.duration.includes('Infinity') && !song.duration.includes('NaN') ? song.duration : 'N/A'}</span>
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
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Comments Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-900">
                Comments ({comments.length})
              </h3>
            </div>

            {loadingComments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    {/* Main Comment */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          {comment.isAdminReply && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Admin</span>
                          )}
                          <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs py-1 px-2"
                        >
                          Reply
                        </Button>
                        <Button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 text-xs py-1 px-2"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-300">
                        <textarea
                          value={replyContent[comment.id] || ''}
                          onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                          placeholder="Write your reply..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleReplyToComment(comment.id)}
                            className="bg-blue-600 text-white hover:bg-blue-700 text-xs py-1 px-3"
                          >
                            Send Reply
                          </Button>
                          <Button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent({ ...replyContent, [comment.id]: '' })
                            }}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs py-1 px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-300 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-white rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">{reply.author}</span>
                              {reply.isAdminReply && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Admin</span>
                              )}
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

