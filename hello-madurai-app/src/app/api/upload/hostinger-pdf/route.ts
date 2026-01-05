import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure route for large PDF uploads to Hostinger
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large files

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB limit
const ALLOWED_TYPES = ['application/pdf']

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Hostinger PDF upload started')
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024))
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeMB}MB.` },
        { status: 413 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`

    // Create uploads directory structure
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'magazines')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log('📁 Created magazines directory:', uploadsDir)
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, filename)

    await writeFile(filePath, buffer)
    console.log('✅ PDF saved to:', filePath)

    // Generate public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hello-madurai-c5xr.vercel.app'
    const publicUrl = `${baseUrl}/uploads/magazines/${filename}`

    // Return success response
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Hostinger PDF upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload PDF to Hostinger storage' },
      { status: 500 }
    )
  }
}
