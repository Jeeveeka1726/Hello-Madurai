'use client'

import Link from 'next/link'

export default function SimpleFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Copyright © 2026 Hello Madurai |
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 mx-1 transition-colors duration-200">
              Contact
            </Link> |
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 mx-1 transition-colors duration-200">
              Privacy Policy
            </Link> |
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 mx-1 transition-colors duration-200">
              Terms of Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
