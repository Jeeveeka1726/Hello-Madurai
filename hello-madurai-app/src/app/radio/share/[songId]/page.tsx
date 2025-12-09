'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  params: Promise<{ songId: string }>
}

// Metadata is in layout.tsx (same pattern as news section)
// This page shows briefly to allow social media crawlers to read metadata,
// then redirects to the main radio page
export default function SharePage({ params }: Props) {
  const router = useRouter()

  useEffect(() => {
    // Unwrap params and redirect after a brief delay
    params.then(({ songId }) => {
      // Small delay to allow metadata to be crawled
      setTimeout(() => {
        router.replace(`/radio?song=${songId}`)
      }, 100)
    })
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading FM...</p>
        <p className="text-gray-400 text-sm mt-2">FM ஏற்றுகிறது...</p>
      </div>
    </div>
  )
}

