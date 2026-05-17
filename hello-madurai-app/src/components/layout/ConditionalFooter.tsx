'use client'

import { usePathname } from 'next/navigation'
import SimpleFooter from './SimpleFooter'

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Don't show footer on admin pages or home page (home page has its own footer)
  if (pathname.startsWith('/admin') || pathname === '/') {
    return null
  }

  return <SimpleFooter />
}
