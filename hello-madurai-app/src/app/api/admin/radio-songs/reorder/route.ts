import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT /api/admin/radio-songs/reorder - Update song order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { songs } = body

    console.log('📝 Reorder request:', { songCount: songs?.length })

    if (!Array.isArray(songs)) {
      console.error('❌ Invalid: songs is not array')
      return NextResponse.json(
        { error: 'Songs array is required' },
        { status: 400 }
      )
    }

    if (songs.length === 0) {
      console.log('⚠️ Empty array')
      return NextResponse.json({ message: 'No songs to update' })
    }

    console.log('🔄 Updating songs:', songs.map(s => ({ id: s.id, order: s.orderNumber })))

    // Update order numbers for all songs
    const updatePromises = songs.map((song: any, index: number) => {
      console.log(`  ${index + 1}. Updating ${song.id} to order ${song.orderNumber}`)
      return prisma.radioSong.update({
        where: { id: song.id },
        data: { orderNumber: song.orderNumber }
      })
    })

    await Promise.all(updatePromises)

    console.log('✅ Successfully updated all songs')
    return NextResponse.json({ message: 'Song order updated successfully' })
  } catch (error: any) {
    console.error('❌ Error updating song order:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { error: error.message || 'Failed to update song order' },
      { status: 500 }
    )
  }
}
