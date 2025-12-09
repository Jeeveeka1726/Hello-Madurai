import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ songId: string }>
}

// Metadata is now in layout.tsx (same pattern as news section)
export default async function SharePage({ params }: Props) {
  const { songId } = await params
  // Redirect to the main radio page with the song ID
  redirect(`/radio?song=${songId}`)
}

