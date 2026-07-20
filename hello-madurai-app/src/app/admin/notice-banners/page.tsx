'use client'

import { useState, useEffect, useRef } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface NoticeBanner {
  id: string
  titleEn: string
  titleTa?: string
  descriptionEn: string
  descriptionTa?: string
  imageUrl?: string
  mobileImageUrl?: string
  link?: string
  active: boolean
  orderNumber: number
  createdAt: string
}

// Sortable Banner Item Component
function SortableBannerItem({ banner, onEdit, onDelete }: {
  banner: NoticeBanner
  onEdit: (banner: NoticeBanner) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
        >
          <Bars3Icon className="w-6 h-6 text-gray-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100">
              Order: {banner.orderNumber}
            </span>
            {banner.active ? (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-800">
                Inactive
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg text-gray-900">{banner.titleEn}</h3>
          {banner.titleTa && (
            <p className="text-sm text-gray-600">{banner.titleTa}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">{banner.descriptionEn}</p>
          {banner.imageUrl && (
            <img src={banner.imageUrl} alt={banner.titleEn} className="mt-2 h-20 object-contain rounded" />
          )}
          {banner.link && (
            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
              {banner.link}
            </a>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(banner)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(banner.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminNoticeBannersPage() {
  const { language } = useLanguage()
  const [banners, setBanners] = useState<NoticeBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<NoticeBanner | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    titleEn: '',
    titleTa: '',
    descriptionEn: '',
    descriptionTa: '',
    imageUrl: '',
    mobileImageUrl: '',
    link: '',
    active: true,
    orderNumber: 0
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/notice-banners')
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, isMobile = false) => {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    if (isMobile) {
      setUploadingMobile(true)
    } else {
      setUploading(true)
    }

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        if (isMobile) {
          setFormData(prev => ({ ...prev, mobileImageUrl: data.url }))
          toast.success('Mobile image uploaded successfully')
        } else {
          setFormData(prev => ({ ...prev, imageUrl: data.url }))
          toast.success('Desktop image uploaded successfully')
        }
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error uploading image')
    } finally {
      if (isMobile) {
        setUploadingMobile(false)
      } else {
        setUploading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingBanner
        ? `/api/admin/notice-banners/${editingBanner.id}`
        : '/api/admin/notice-banners'

      const method = editingBanner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully')
        fetchBanners()
        resetForm()
        setShowForm(false)
      } else {
        toast.error('Failed to save banner')
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error('Error saving banner')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(`/api/admin/notice-banners/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Banner deleted successfully')
        fetchBanners()
      } else {
        toast.error('Failed to delete banner')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Error deleting banner')
    }
  }

  const handleEdit = (banner: NoticeBanner) => {
    // First scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'smooth' })

    setEditingBanner(banner)
    setFormData({
      titleEn: banner.titleEn,
      titleTa: banner.titleTa || '',
      descriptionEn: banner.descriptionEn,
      descriptionTa: banner.descriptionTa || '',
      imageUrl: banner.imageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || '',
      link: banner.link || '',
      active: banner.active,
      orderNumber: banner.orderNumber
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleTa: '',
      descriptionEn: '',
      descriptionTa: '',
      imageUrl: '',
      mobileImageUrl: '',
      link: '',
      active: true,
      orderNumber: 0
    })
    setEditingBanner(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id)
      const newIndex = banners.findIndex((b) => b.id === over.id)

      const newBanners = arrayMove(banners, oldIndex, newIndex)

      // Update local state immediately for smooth UX
      setBanners(newBanners)

      // Update order numbers in database
      try {
        const updates = newBanners.map((banner, index) => ({
          id: banner.id,
          orderNumber: index
        }))

        // Update all banners with new order
        await Promise.all(
          updates.map(({ id, orderNumber }) => {
            const banner = banners.find(b => b.id === id)
            if (!banner) return Promise.resolve()

            return fetch(`/api/admin/notice-banners/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...banner, orderNumber })
            })
          })
        )

        toast.success('Order updated successfully')
        fetchBanners() // Refresh from server
      } catch (error) {
        console.error('Error updating order:', error)
        toast.error('Failed to update order')
        fetchBanners() // Revert to server state
      }
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ta' ? 'அறிவிப்பு பேனர்கள்' : 'Notice Banners'}
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {language === 'ta'
                ? 'முகப்பு பக்கத்தில் காட்டப்படும் அறிவிப்பு பேனர்களை நிர்வகிக்கவும்'
                : 'Manage notice banners displayed on the homepage'}
            </p>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              📐 Desktop: 1400x350px | Mobile: 900x280px | Auto-fits all screens | Max: 5MB
            </p>
          </div>
          <Button onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setShowForm(true);
            resetForm();
          }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            {language === 'ta' ? 'புதிய பேனர்' : 'New Banner'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6" ref={formRef}>
            <CardHeader>
              <CardTitle>
                {editingBanner
                  ? (language === 'ta' ? 'பேனரை திருத்து' : 'Edit Banner')
                  : (language === 'ta' ? 'புதிய பேனர் உருவாக்கு' : 'Create New Banner')
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Tamil)
                    </label>
                    <input
                      type="text"
                      value={formData.titleTa}
                      onChange={(e) => setFormData({ ...formData, titleTa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (English) *
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Tamil)
                    </label>
                    <textarea
                      value={formData.descriptionTa}
                      onChange={(e) => setFormData({ ...formData, descriptionTa: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Desktop Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desktop Image (1400 x 350 pixels)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, false)
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Desktop Preview</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Clear
                          </button>
                        </div>
                        <img src={formData.imageUrl} alt="Desktop Preview" className="w-full max-h-32 object-contain rounded border border-gray-200 bg-white" />
                      </div>
                    )}
                  </div>

                  {/* Mobile Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Image (900 x 280 pixels)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, true)
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        disabled={uploadingMobile}
                      />
                      {uploadingMobile && <span className="text-sm text-gray-500">Uploading...</span>}
                    </div>
                    {formData.mobileImageUrl && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Mobile Preview</span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, mobileImageUrl: '' })}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Clear
                          </button>
                        </div>
                        <img src={formData.mobileImageUrl} alt="Mobile Preview" className="w-full max-h-32 object-contain rounded border border-gray-200 bg-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <input
                      type="number"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBanner ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Notice Banners ({banners.length})
              <p className="text-sm font-normal text-gray-500 mt-1">
                Drag and drop to reorder banners
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {banners.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No banners found. Create your first banner!</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={banners.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {banners.map((banner) => (
                      <SortableBannerItem
                        key={banner.id}
                        banner={banner}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
