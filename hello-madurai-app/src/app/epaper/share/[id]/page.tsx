import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const magazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!magazine) {
      return {
        title: 'Magazine Not Found',
      }
    }

    const title = magazine.title
    const description = magazine.title_ta || magazine.title
    const imageUrl = (magazine.coverImage || magazine.featuredImage || '')
    const absoluteImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}${imageUrl}`

    return {
      title: `${title} - Hello Madurai E-Paper`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [absoluteImageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Hello Madurai E-Paper',
    }
  }
}

export default async function MagazineSharePage({ params }: Props) {
  const { id } = await params
  
  // Redirect to main epaper page
  redirect('/epaper')
}
