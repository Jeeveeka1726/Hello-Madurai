'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { SunIcon } from '@heroicons/react/24/outline'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  // Theme toggle disabled - always light mode
  return (
    <button
      disabled
      className={`p-2 rounded-lg transition-colors bg-gray-100 cursor-not-allowed opacity-50 ${className}`}
      title="Light mode only"
    >
      <SunIcon className="h-5 w-5 text-gray-600" />
    </button>
  )
}







