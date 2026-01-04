import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Handle chunked PDF uploads to bypass Vercel's 4.5MB limit
export async function POST(request: NextRequest) {
  try {
    const { chunk, chunkIndex, totalChunks, filename, mimeType, uploadId } = await request.json()

    // Validate required fields
    if (!chunk || chunkIndex === undefined || !totalChunks || !filename || !uploadId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`📦 Received chunk ${chunkIndex + 1}/${totalChunks} for ${filename}`)

    // Store chunk in database temporarily
    await prisma.pdfChunk.create({
      data: {
        uploadId,
        chunkIndex,
        chunkData: chunk,
        filename,
        mimeType: mimeType || 'application/pdf',
        totalChunks,
        createdAt: new Date(),
      },
    })

    // Check if all chunks are received
    const receivedChunks = await prisma.pdfChunk.count({
      where: { uploadId },
    })

    if (receivedChunks === totalChunks) {
      console.log(`✅ All chunks received for ${filename}, assembling...`)
      
      // Get all chunks in order
      const chunks = await prisma.pdfChunk.findMany({
        where: { uploadId },
        orderBy: { chunkIndex: 'asc' },
      })

      // Combine all chunks
      const combinedBase64 = chunks.map(chunk => chunk.chunkData).join('')
      
      // Convert to buffer and save as file
      const buffer = Buffer.from(combinedBase64, 'base64')
      const base64Data = buffer.toString('base64')
      
      // Create the final file URL (you can store this in your preferred storage)
      const fileUrl = `data:${mimeType || 'application/pdf'};base64,${base64Data}`
      
      // Save PDF metadata to database
      const pdfRecord = await prisma.magazinePdf.create({
        data: {
          filename,
          url: fileUrl,
          size: buffer.length,
          mimeType: mimeType || 'application/pdf',
          publicId: uploadId, // Use uploadId as publicId
          createdAt: new Date(),
        },
      })

      // Clean up chunks
      await prisma.pdfChunk.deleteMany({
        where: { uploadId },
      })

      console.log(`🎉 PDF assembled successfully: ${filename}`)

      return NextResponse.json({
        success: true,
        url: fileUrl,
        id: pdfRecord.id,
        message: 'PDF uploaded successfully',
      })
    }

    // Return success for individual chunk
    return NextResponse.json({
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
      chunksReceived: receivedChunks,
      totalChunks,
    })

  } catch (error) {
    console.error('❌ Chunked PDF upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF chunk' },
      { status: 500 }
    )
  }
}
