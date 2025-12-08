import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// DELETE: Delete radio comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // First delete all replies to this comment
    await prisma.singerComment.deleteMany({
      where: { parentId: id }
    })
    
    // Then delete the comment itself
    await prisma.singerComment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error deleting radio comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}

