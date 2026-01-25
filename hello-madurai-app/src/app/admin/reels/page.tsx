'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  Bars3Icon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import ReelForm from '@/components/admin/ReelForm'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Reel {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  thumbnailUrl?: string
  reelType: string
  duration?: string
  views: number
  likes: number
  active: boolean
  orderNumber: number
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export default function AdminReelsPage() {
  const { t, language } = useLanguage()
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/reels')
      if (response.ok) {
        const data = await response.json()
        setReels(data)
      }
    } catch (error) {
      console.error('Error fetching reels:', error)
      toast.error('Failed to fetch reels')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(reels)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update local state immediately
    setReels(items)

    // Update order numbers
    const updatedReels = items.map((reel, index) => ({
      ...reel,
      orderNumber: index
    }))

    try {
      const response = await fetch('/api/reels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reels: updatedReels })
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      toast.success('Reel order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update reel order')
      // Revert on error
      fetchReels()
    }
  }

  const toggleReelStatus = async (reel: Reel) => {
    try {
      const response = await fetch(`/api/reels/${reel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !reel.active })
      })

      if (response.ok) {
        setReels(reels.map(r => 
          r.id === reel.id ? { ...r, active: !r.active } : r
        ))
        toast.success(`Reel ${reel.active ? 'deactivated' : 'activated'} successfully`)
      }
    } catch (error) {
      console.error('Error toggling reel status:', error)
      toast.error('Failed to update reel status')
    }
  }

  const deleteReel = async (reel: Reel) => {
    if (!confirm('Are you sure you want to delete this reel?')) return

    try {
      const response = await fetch(`/api/reels/${reel.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReels(reels.filter(r => r.id !== reel.id))
        toast.success('Reel deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting reel:', error)
      toast.error('Failed to delete reel')
    }
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : null
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reels Management</h1>
            <p className="text-gray-600">Manage homepage reels (Max 10 reels)</p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Reel
          </Button>
        </div>

        {/* Reels List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Current Reels ({reels.length}/10)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop to reorder. Only active reels will show on homepage.
            </p>
          </div>

          {reels.length === 0 ? (
            <div className="p-8 text-center">
              <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reels yet</h3>
              <p className="text-gray-500 mb-4">Add your first reel to get started</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Reel
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="reels">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {reels.map((reel, index) => (
                      <Draggable key={reel.id} draggableId={reel.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border-b border-gray-200 last:border-b-0 ${
                              snapshot.isDragging ? 'bg-blue-50' : 'bg-white'
                            }`}
                          >
                            <div className="p-6 flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400 hover:text-gray-600"
                              >
                                <Bars3Icon className="h-5 w-5" />
                              </div>

                              {/* Order Number */}
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                {index + 1}
                              </div>

                              {/* Thumbnail */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-28 bg-gray-200 rounded-lg overflow-hidden">
                                  <img
                                    src={reel.thumbnailUrl || getYouTubeThumbnail(reel.videoUrl) || '/placeholder-video.jpg'}
                                    alt={reel.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>

                              {/* Reel Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {language === 'ta' && reel.title_ta ? reel.title_ta : reel.title}
                                </h3>
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {reel.reelType.toUpperCase()} • {formatViews(reel.views)} views
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(reel.publishedAt).toLocaleDateString()}
                                </p>
                              </div>

                              {/* Status */}
                              <div className="flex-shrink-0">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  reel.active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {reel.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex-shrink-0 flex items-center space-x-2">
                                <button
                                  onClick={() => toggleReelStatus(reel)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title={reel.active ? 'Deactivate' : 'Activate'}
                                >
                                  {reel.active ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setEditingReel(reel)}
                                  className="text-gray-400 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => deleteReel(reel)}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
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
        </div>

        {/* Add/Edit Form Modal */}
        {(showAddForm || editingReel) && (
          <ReelForm
            reel={editingReel}
            onClose={() => {
              setShowAddForm(false)
              setEditingReel(null)
            }}
            onSave={() => {
              fetchReels()
              setShowAddForm(false)
              setEditingReel(null)
            }}
          />
        )}
    </div>
  )
}
