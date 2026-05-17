'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Copyright Section */}
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Copyright © 2026 Hello Madurai |
              <Link href="/contact" className="text-gray-400 hover:text-white mx-1 transition-colors duration-200">
                Contact
              </Link> |
              <Link href="/privacy" className="text-gray-400 hover:text-white mx-1 transition-colors duration-200">
                Privacy Policy
              </Link> |
              <Link href="/terms" className="text-gray-400 hover:text-white mx-1 transition-colors duration-200">
                Terms of Conditions
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}


