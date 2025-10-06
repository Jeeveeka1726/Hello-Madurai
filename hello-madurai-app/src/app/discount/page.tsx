'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import { CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline'

interface DiscountCard {
  id: string
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
  dCode: string
  isActive: boolean
  createdAt: string
  usages: DiscountUsage[]
}

interface DiscountUsage {
  id: string
  businessName: string
  businessPhone?: string
  shopkeeperName?: string
  amount?: number
  usedAt: string
}

export default function DiscountPage() {
  const { t, language } = useLanguage()
  const [card, setCard] = useState<DiscountCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    fetchOrCreateCard()
  }, [])

  const fetchOrCreateCard = async () => {
    try {
      const response = await fetch('/api/discount-card')
      if (response.ok) {
        const data = await response.json()
        setCard(data)
      } else if (response.status === 404) {
        // No card exists, show form to create one
        setCard(null)
      }
    } catch (error) {
      console.error('Error fetching discount card:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCard = async () => {
    try {
      const response = await fetch('/api/discount-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
      })

      if (response.ok) {
        const data = await response.json()
        setCard(data)
      }
    } catch (error) {
      console.error('Error creating discount card:', error)
    }
  }

  const downloadCard = () => {
    // Implementation for downloading card as PDF/image
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-800">
        <NewHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-800">
      <NewHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('discount.title', 'Hello Madurai Digital Discount Card', 'ஹலோ மதுரை டிஜிட்டல் தள்ளுபடி அட்டை')}
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            {t('discount.subtitle', 'Get discounts at all types of retail stores, textile stores, jewelry stores, home appliance stores, across Madurai district', 'மதுரை மாவட்டம் முழுவதும் உள்ள அனைத்து வகையான சில்லறை கடைகள், ஜவுளி கடைகள், நகை கடைகள், வீட்டு உபகரண கடைகளில் தள்ளுபடி பெறுங்கள்')}
          </p>
        </div>

        {!card ? (
          /* Registration Form */
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <GiftIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('discount.register.title', 'Get Your Discount Card', 'உங்கள் தள்ளுபடி அட்டையைப் பெறுங்கள்')}
              </h2>
              <p className="text-gray-600">
                {t('discount.register.subtitle', 'Fill in your details to get your digital discount card', 'உங்கள் டிஜிட்டல் தள்ளுபடி அட்டையைப் பெற உங்கள் விவரங்களை நிரப்பவும்')}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createCard(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('discount.form.name', 'Full Name', 'முழு பெயர்')} *
                </label>
                <input
                  type="text"
                  required
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('discount.form.email', 'Email', 'மின்னஞ்சல்')}
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('discount.form.phone', 'Phone Number', 'தொலைபேசி எண்')}
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {t('discount.form.submit', 'Create My Discount Card', 'என் தள்ளுபடி அட்டையை உருவாக்கவும்')}
              </button>
            </form>
          </div>
        ) : (
          /* Discount Card Display */
          <div className="space-y-8">
            {/* Card Preview */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-2xl p-8 text-white max-w-md mx-auto transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Hello Madurai</h3>
                  <p className="text-blue-100">Discount Card</p>
                </div>
                <CreditCardIcon className="h-8 w-8" />
              </div>

              <div className="mb-6">
                <p className="text-blue-100 text-sm mb-1">Cardholder Name</p>
                <p className="text-xl font-semibold">{card.userName}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Card ID</p>
                  <p className="font-mono text-sm">{card.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Valid</p>
                  <p className="text-sm">{card.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
              <button
                onClick={downloadCard}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {t('discount.download', 'Download Card', 'அட்டையைப் பதிவிறக்கவும்')}
              </button>
            </div>

            {/* Usage Stats */}
            {card.usages && card.usages.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('discount.usageHistory', 'Usage History', 'பயன்பாட்டு வரலாறு')}
                </h3>
                <div className="space-y-3">
                  {card.usages.slice(0, 5).map((usage) => (
                    <div key={usage.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{usage.businessName}</p>
                        <p className="text-sm text-gray-600">{new Date(usage.usedAt).toLocaleDateString()}</p>
                      </div>
                      {usage.amount && (
                        <p className="text-green-600 font-medium">₹{usage.amount}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {t('discount.totalUsage', 'Total uses: {{count}}', 'மொத்த பயன்பாடுகள்: {{count}}').replace('{{count}}', card.usages.length.toString())}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                {t('discount.howToUse', 'How to Use', 'எப்படி பயன்படுத்துவது')}
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li>• {t('discount.step1', 'Show your discount card to participating shopkeepers', 'பங்கேற்கும் கடைக்காரர்களுக்கு உங்கள் தள்ளுபடி அட்டையைக் காண்பிக்கவும்')}</li>
                <li>• {t('discount.step2', 'They will verify your card ID and apply discount', 'அவர்கள் உங்கள் அட்டை ஐடியை சரிபார்த்து தள்ளுபடி பயன்படுத்துவார்கள்')}</li>
                <li>• {t('discount.step3', 'Enjoy discounts across Madurai district', 'மதுரை மாவட்டம் முழுவதும் தள்ளுபடிகளை அனுபவிக்கவும்')}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

