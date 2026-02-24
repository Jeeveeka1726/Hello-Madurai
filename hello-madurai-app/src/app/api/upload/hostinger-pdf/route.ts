import { NextRequest, NextResponse } from 'next/server'

// Hostinger PDF Upload Proxy (alias route — same logic as /api/upload/magazine-pdf)
// Receives PDF from admin browser → forwards to Hostinger PHP script → returns public URL
// This keeps HOSTINGER_PDF_UPLOAD_URL as a server-side secret and avoids CORS issues.

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const hostingerUploadUrl = process.env.HOSTINGER_PDF_UPLOAD_URL

    if (!hostingerUploadUrl) {
      console.error('❌ HOSTINGER_PDF_UPLOAD_URL environment variable is not set')
      return NextResponse.json(
        { error: 'PDF upload service is not configured. Set HOSTINGER_PDF_UPLOAD_URL.' },
        { status: 500 }
      )
    }

    // Parse multipart form data from the browser
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('pdf') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { error: `File too large (${fileSizeMB}MB). Maximum size is 50MB.` },
        { status: 413 }
      )
    }

    console.log(`📤 Proxying PDF to Hostinger: ${file.name} (${Math.round(file.size / 1024)}KB)`)

    // Forward to Hostinger PHP script
    const uploadForm = new FormData()
    uploadForm.append('pdf', file)

    const hostingerResponse = await fetch(hostingerUploadUrl, {
      method: 'POST',
      body: uploadForm,
    })

    if (!hostingerResponse.ok) {
      let errorMessage = `Hostinger upload failed (${hostingerResponse.status})`
      try {
        const errorData = await hostingerResponse.json()
        errorMessage = errorData?.error || errorMessage
      } catch {
        // ignore JSON parse errors
      }
      console.error('❌', errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 502 })
    }

    const responseData = await hostingerResponse.json()

    if (!responseData?.url) {
      return NextResponse.json(
        { error: 'Upload succeeded but no URL returned from Hostinger' },
        { status: 502 }
      )
    }

    console.log('✅ PDF uploaded to Hostinger:', responseData.url)
    return NextResponse.json({
      url: responseData.url,
      filename: responseData.filename,
      size: responseData.size,
    })
  } catch (error) {
    console.error('❌ Error proxying PDF upload:', error)
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 })
  }
}
