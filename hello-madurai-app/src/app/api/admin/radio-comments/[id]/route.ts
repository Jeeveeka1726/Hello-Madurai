import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Reply to a comment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: parentId } = await params
    const body = await request.json()
    const { content, author } = body

    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      )
    }

    // Get the parent comment to find the singer
    const parentComment = await prisma.singerComment.findUnique({
      where: { id: parentId }
    })

    if (!parentComment) {
      return NextResponse.json(
        { error: 'Parent comment not found' },
        { status: 404 }
      )
    }

    // Create admin reply
    const reply = await prisma.singerComment.create({
      data: {
        content: content.trim(),
        author: author.trim(),
        singerId: parentComment.singerId,
        parentId: parentId,
        isAdminReply: true
      }
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}

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

