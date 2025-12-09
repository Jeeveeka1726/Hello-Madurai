import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update singer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get current singer to check if name changed
    const currentSinger = await prisma.singer.findUnique({ where: { id } })

    let slug = currentSinger?.slug

    // If name changed, regenerate slug
    if (currentSinger && body.name !== currentSinger.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()

      // Check if slug already exists (excluding current singer)
      let counter = 1
      let uniqueSlug = slug
      while (true) {
        const existing = await prisma.singer.findUnique({ where: { slug: uniqueSlug } })
        if (!existing || existing.id === id) break
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    const singer = await prisma.singer.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: slug || undefined,
        imageUrl: body.imageUrl || null,
        featured: body.featured !== undefined ? body.featured : false,
        categoryId: body.categoryId
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(singer)
  } catch (error) {
    console.error('Error updating singer:', error)
    return NextResponse.json(
      { error: 'Failed to update singer' },
      { status: 500 }
    )
  }
}

// DELETE singer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.singer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting singer:', error)
    return NextResponse.json(
      { error: 'Failed to delete singer' },
      { status: 500 }
    )
  }
}

