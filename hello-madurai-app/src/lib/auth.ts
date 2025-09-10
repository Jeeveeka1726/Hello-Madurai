import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, UserRole } from '@/types/database'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireAdmin() {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }
  return profile
}

export async function requireModerator() {
  const profile = await getUserProfile()
  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    redirect('/')
  }
  return profile
}

export function isAdmin(role?: UserRole): boolean {
  return role === 'admin'
}

export function isModerator(role?: UserRole): boolean {
  return role === 'moderator' || role === 'admin'
}

// Note: Client-side auth functions have been moved to @/lib/auth-client.ts
// This file only contains server-side auth functions
