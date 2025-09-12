'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TranslatedText from '@/components/TranslatedText'
import FileUpload from '@/components/admin/FileUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { 
  CalendarIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Event {
  id: number
  title: string
  title_ta: string
  description: string
  description_ta: string
  date: string
  location: string
  location_ta: string
  category: string
  featured: boolean
  featuredImage?: string
  createdAt: string
}

const eventCategories = [
  { id: 'festival', name: 'Festival', name_ta: 'திருவிழா' },
  { id: 'cultural', name: 'Cultural', name_ta: 'கலாச்சாரம்' },
  { id: 'business', name: 'Business', name_ta: 'வணிகம்' },
  { id: 'education', name: 'Education', name_ta: 'கல்வி' },
  { id: 'sports', name: 'Sports', name_ta: 'விளையாட்டு' },
  { id: 'other', name: 'Other', name_ta: 'மற்றவை' }
]

export default function AdminEventsPage() {
  const { isAdmin, isLoading } = useAdmin()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    description: '',
    description_ta: '',
    date: '',
    location: '',
    location_ta: '',
    category: 'festival',
    featured: false,
    featuredImage: ''
  })

  useEffect(() => {
    if (isAdmin) {
      fetchEvents()
    }
  }, [isAdmin])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingEvent ? 'PUT' : 'POST'
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchEvents()
        setShowForm(false)
        setEditingEvent(null)
        setFormData({
          title: '',
          title_ta: '',
          description: '',
          description_ta: '',
          date: '',
          location: '',
          location_ta: '',
          category: 'festival',
          featured: false,
          featuredImage: ''
        })
      }
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      title_ta: event.title_ta,
      description: event.description,
      description_ta: event.description_ta,
      date: event.date,
      location: event.location,
      location_ta: event.location_ta,
      category: event.category,
      featured: event.featured,
      featuredImage: event.featuredImage || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            <TranslatedText>Access Denied</TranslatedText>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            <TranslatedText>You don't have permission to access this page.</TranslatedText>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              <TranslatedText>Manage Events</TranslatedText>
            </h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span><TranslatedText>Add Event</TranslatedText></span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Total Events</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPinIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Featured Events</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {events.filter(e => e.featured).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    <TranslatedText>Upcoming Events</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {events.filter(e => new Date(e.date) > new Date()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  <TranslatedText>{editingEvent ? 'Edit Event' : 'Add Event'}</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <TranslatedText>Featured Image</TranslatedText>
                    </label>
                    <FileUpload
                      label="Featured Image"
                      fileType="image"
                      onFileUpload={(url) => setFormData({ ...formData, featuredImage: url })}
                      onUrlChange={(url) => setFormData({ ...formData, featuredImage: url })}
                      currentFile={formData.featuredImage}
                      accept="image/*"
                      maxSize={5} // 5MB
                    />
                  </div>

                  {/* Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Title (English)</TranslatedText>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Event title in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Title (Tamil)</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={formData.title_ta}
                        onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Event title in Tamil"
                      />
                    </div>
                  </div>

                  {/* Date and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Event Date</TranslatedText>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Category</TranslatedText>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                      >
                        {eventCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Location (English)</TranslatedText>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Event location in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <TranslatedText>Location (Tamil)</TranslatedText>
                      </label>
                      <input
                        type="text"
                        value={formData.location_ta}
                        onChange={(e) => setFormData({ ...formData, location_ta: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-purple-800 dark:text-white"
                        placeholder="Event location in Tamil"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <TranslatedText>Description (English)</TranslatedText>
                    </label>
                    <RichTextEditor
                      content={formData.description}
                      onChange={(content) => setFormData({ ...formData, description: content })}
                      showTranslate={true}
                      targetLanguage="ta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <TranslatedText>Description (Tamil)</TranslatedText>
                    </label>
                    <RichTextEditor
                      content={formData.description_ta}
                      onChange={(content) => setFormData({ ...formData, description_ta: content })}
                      showTranslate={true}
                      targetLanguage="en"
                    />
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      <TranslatedText>Featured Event</TranslatedText>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingEvent(null)
                      }}
                    >
                      <TranslatedText>Cancel</TranslatedText>
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-white dark:bg-purple-900 border-gray-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Featured Image */}
                  {event.featuredImage && (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={event.featuredImage}
                        alt={event.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.featured 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-purple-800 dark:text-purple-200'
                      }`}>
                        {event.featured ? 'Featured' : 'Regular'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {eventCategories.find(cat => cat.id === event.category)?.name || event.category}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {event.title}
                    </h3>
                    {event.title_ta && (
                      <h4 className="text-md text-gray-700 dark:text-gray-300 mb-2">
                        {event.title_ta}
                      </h4>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPinIcon className="inline h-4 w-4 mr-1" />
                      {event.location}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400" 
                         dangerouslySetInnerHTML={{ __html: event.description.substring(0, 200) + '...' }} />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {events.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  <TranslatedText>No events yet</TranslatedText>
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  <TranslatedText>Get started by adding your first event.</TranslatedText>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
