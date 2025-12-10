import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ songId: string }>
}

// Metadata is in layout.tsx (provides OG image for social media)
// This page redirects directly to the radio page with the song playing
export default async function SharePage({ params }: Props) {
  const { songId } = await params

  // Verify song exists
  const song = await prisma.radioSong.findUnique({
    where: { id: songId },
    select: { id: true }
  })

  if (!song) {
    notFound()
  }

  // Redirect directly to radio page with song parameter
  redirect(`/radio?song=${songId}`)
}

