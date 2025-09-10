'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'news', href: '/news' },
    { name: 'events', href: '/events' },
    { name: 'directory', href: '/directory' },
    { name: 'jobs', href: '/jobs' },
  ]

  const services = [
    { name: 'magazine', href: '/magazine' },
    { name: 'tourism', href: '/tourism' },
    { name: 'weather', href: '/weather' },
    { name: 'helpline', href: '/helpline' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">Hello Madurai</span>
              <span className="ml-2 text-lg text-gray-300">ஹலோ மதுரை</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              {t('footer.description', 'Your local news and information hub. Stay connected with the latest news, events, and services from Madurai and surrounding areas.', 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம். மதுரை மற்றும் சுற்றுவட்டார பகுதிகளின் சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் சேவைகளை அறிந்து கொள்ளுங்கள்.')}
            </p>
            <div className="flex space-x-4">
              {/* Social media links can be added here */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t('footer.quickLinks', 'Quick Links', 'விரைவு இணைப்புகள்')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {t(`nav.${link.name}`, link.name, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t('footer.services', 'Services', 'சேவைகள்')}
            </h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {t(`nav.${service.name}`, service.name, service.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Hello Madurai. {t('footer.copyright', 'All rights reserved.', 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t('footer.privacy', 'Privacy Policy', 'தனியுரிமை கொள்கை')}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t('footer.terms', 'Terms of Service', 'விதிமுறைகள்')}
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                {t('footer.contact', 'Contact', 'தொடர்பு')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


