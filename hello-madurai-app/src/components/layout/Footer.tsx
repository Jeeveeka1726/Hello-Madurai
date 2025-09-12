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
    { name: 'contact', href: '/contact' },
  ]

  const services = [
    { name: 'magazine', href: '/magazine' },
    { name: 'radio', href: '/radio' },
    { name: 'videos', href: '/videos' },
    { name: 'tourism', href: '/tourism' },
  ]

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/hellomadurai',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/hellomadurai',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@hellomadurai',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ]

  return (
    <footer className="bg-purple-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">Hello Madurai</span>
              <span className="ml-2 text-lg text-purple-200">ஹலோ மதுரை</span>
            </Link>
            <p className="text-purple-200 mb-4 max-w-md">
              {t('footer.description', 'Your local news and information hub. Stay connected with the latest news, events, and services from Madurai and surrounding areas.', 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம். மதுரை மற்றும் சுற்றுவட்டார பகுதிகளின் சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் சேவைகளை அறிந்து கொள்ளுங்கள்.')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-white transition-colors duration-200"
                  title={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
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
                    className="text-purple-300 hover:text-white transition-colors duration-200"
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
                    className="text-purple-300 hover:text-white transition-colors duration-200"
                  >
                    {t(`nav.${service.name}`, service.name, service.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-purple-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-300 text-sm">
              © {currentYear} Hello Madurai. {t('footer.copyright', 'All rights reserved.', 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-purple-300 hover:text-white text-sm transition-colors duration-200">
                {t('footer.privacy', 'Privacy Policy', 'தனியுரிமை கொள்கை')}
              </Link>
              <Link href="/terms" className="text-purple-300 hover:text-white text-sm transition-colors duration-200">
                {t('footer.terms', 'Terms of Service', 'விதிமுறைகள்')}
              </Link>
              <Link href="/contact" className="text-purple-300 hover:text-white text-sm transition-colors duration-200">
                {t('footer.contact', 'Contact', 'தொடர்பு')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


