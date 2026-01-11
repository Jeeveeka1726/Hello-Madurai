'use client'

import { usePathname } from 'next/navigation'
import SimpleFooter from './SimpleFooter'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  return <SimpleFooter />
}
