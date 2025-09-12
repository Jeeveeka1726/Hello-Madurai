'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppWrapper from '@/components/AppWrapper'
import { useAdmin } from '@/contexts/AdminContext'
import AdminSidebar from '@/components/admin/AdminSidebar'

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAdmin, isLoading } = useAdmin()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin-login')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <AdminSidebar>
      {children}
    </AdminSidebar>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppWrapper showFooter={false}>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AppWrapper>
  )
}
