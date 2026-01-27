'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'

interface Offer {
  id: string
  title: string
  title_ta: string | null
  imageUrl: string
  bookNowUrl: string
  active: boolean
  orderNumber: number
  createdAt: string
  updatedAt: string
}

export default function AdminOffersPage() {
  const { language } = useLanguage()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    title_ta: '',
    imageUrl: '',
    bookNowUrl: '',
    active: true,
    orderNumber: 0
  })

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setOffers(data)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast.error('Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingOffer ? `/api/offers/${editingOffer.id}` : '/api/offers'
      const method = editingOffer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchOffers()
        setShowForm(false)
        setEditingOffer(null)
        setFormData({
          title: '',
          title_ta: '',
          imageUrl: '',
          bookNowUrl: '',
          active: true,
          orderNumber: 0
        })
        toast.success(editingOffer ? 'Offer updated!' : 'Offer created!')
      } else {
        toast.error('Error saving offer')
      }
    } catch (error) {
      console.error('Error saving offer:', error)
      toast.error('Error saving offer')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title,
      title_ta: offer.title_ta || '',
      imageUrl: offer.imageUrl,
      bookNowUrl: offer.bookNowUrl,
      active: offer.active,
      orderNumber: offer.orderNumber
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'ta' ? 'இந்த சலுகையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this offer?')) return

    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchOffers()
        toast.success('Offer deleted!')
      } else {
        toast.error('Error deleting offer')
      }
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast.error('Error deleting offer')
    }
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (response.ok) {
        await fetchOffers()
        toast.success(currentActive ? 'Offer deactivated!' : 'Offer activated!')
      }
    } catch (error) {
      console.error('Error toggling offer:', error)
      toast.error('Error updating offer')
    }
  }

  return (
    <AdminSidebar>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'ta' ? 'சலுகைகள் நிர்வாகம்' : 'Offers Management'}
          </h1>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingOffer(null)
              setFormData({
                title: '',
                title_ta: '',
                imageUrl: '',
                bookNowUrl: '',
                active: true,
                orderNumber: 0
              })
            }}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {language === 'ta' ? 'புதிய சலுகை' : 'New Offer'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingOffer
                  ? (language === 'ta' ? 'சலுகையைத் திருத்து' : 'Edit Offer')
                  : (language === 'ta' ? 'புதிய சலுகை' : 'New Offer')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'தலைப்பு (ஆங்கிலம்)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'தலைப்பு (தமிழ்)' : 'Title (Tamil)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title_ta}
                    onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'படம்' : 'Image'}
                  </label>
                  <ImageUpload
                    onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                    currentImageUrl={formData.imageUrl}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'இப்போது முன்பதிவு செய்யுங்கள் URL' : 'Book Now URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.bookNowUrl}
                    onChange={(e) => setFormData({ ...formData, bookNowUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/book"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ta' ? 'வரிசை எண்' : 'Order Number'}
                  </label>
                  <input
                    type="number"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    {language === 'ta' ? 'செயலில்' : 'Active'}
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : (language === 'ta' ? 'சேமி' : 'Save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingOffer(null)
                    }}
                  >
                    {language === 'ta' ? 'ரத்து செய்' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Offers List */}
        <div className="grid gap-4">
          {loading && offers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'ta' ? 'சலுகைகள் இல்லை' : 'No offers found'}
            </div>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {offer.imageUrl && (
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{offer.title}</h3>
                      {offer.title_ta && (
                        <p className="text-gray-600">{offer.title_ta}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {language === 'ta' ? 'முன்பதிவு URL:' : 'Book Now URL:'} {offer.bookNowUrl}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'ta' ? 'வரிசை:' : 'Order:'} {offer.orderNumber}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${offer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {offer.active ? (language === 'ta' ? 'செயலில்' : 'Active') : (language === 'ta' ? 'செயலற்றது' : 'Inactive')}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(offer.id, offer.active)}
                        className={offer.active ? 'text-yellow-600' : 'text-green-600'}
                      >
                        {offer.active ? '⏸️' : '▶️'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(offer)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(offer.id)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminSidebar>
  )
}

