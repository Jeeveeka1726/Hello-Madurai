'use client'

import Link from 'next/link'
import {
  UserIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  CogIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function NewDesignHomePage() {
  // Service cards matching the design (2 rows of 7 cards each)
  const services = [
    // First row
    { name: 'My Account', icon: UserIcon, href: '/account' },
    { name: 'Inventory', icon: TruckIcon, href: '/inventory' },
    { name: 'Search Mechanic', icon: WrenchScrewdriverIcon, href: '/mechanic' },
    { name: 'Analytics', icon: ChartBarIcon, href: '/analytics' },
    { name: 'Contact us', icon: EnvelopeIcon, href: '/contact' },
    { name: 'My Account', icon: UserIcon, href: '/account' },
    { name: 'Inventory', icon: TruckIcon, href: '/inventory' },
    
    // Second row
    { name: 'My Account', icon: UserIcon, href: '/account' },
    { name: 'Inventory', icon: TruckIcon, href: '/inventory' },
    { name: 'Search Mechanic', icon: WrenchScrewdriverIcon, href: '/mechanic' },
    { name: 'Analytics', icon: ChartBarIcon, href: '/analytics' },
    { name: 'Contact us', icon: EnvelopeIcon, href: '/contact' },
    { name: 'My Account', icon: UserIcon, href: '/account' },
    { name: 'Inventory', icon: TruckIcon, href: '/inventory' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      
      {/* Hero Section - Blue Background */}
      <section className="bg-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Hello Madurai
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Your gateway to Madurai - News, Radio & More
          </p>
          <Link
            href="/news"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Explore Latest News
          </Link>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search artists or songs across all categories..."
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-7 gap-6">
            {services.map((service, index) => (
              <Link
                key={index}
                href={service.href}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border border-gray-200"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                  <service.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {service.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AD Slide Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* AD Slide Header */}
          <div className="bg-blue-900 text-white py-4 px-6 rounded-t-lg">
            <h2 className="text-2xl font-bold text-center">AD Slide</h2>
          </div>
          
          {/* Rectangle boxes for reels */}
          <div className="bg-white p-6 rounded-b-lg shadow-lg">
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="aspect-[3/4] bg-gray-400 rounded-lg flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-gray-500 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-lg mb-2">📹</div>
                    <div className="text-sm">Reel {item}</div>
                    <div className="text-xs mt-1 opacity-75">Click to upload</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
