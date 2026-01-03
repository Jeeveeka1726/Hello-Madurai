import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || '187251687769698',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM',
})

// Generate Cloudinary upload signature for PDFs
// This allows the browser to upload directly to Cloudinary, bypassing Vercel's 4.5MB limit
export async function GET() {
  try {
    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'hello-madurai/magazines'

    // Parameters to sign (must match exactly what's sent to Cloudinary)
    // IMPORTANT: For /raw/upload endpoint, resource_type is NOT included in form data
    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
    }

    // Generate signature for secure uploads
    // IMPORTANT: Only include params that will be sent to Cloudinary
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM'
    )

    console.log('🔑 Generated PDF signature for timestamp:', timestamp)

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dbngxtspv',
      apiKey: process.env.CLOUDINARY_API_KEY || '187251687769698',
      folder,
      resourceType: 'raw', // PDFs need raw resource type
    })
  } catch (error) {
    console.error('❌ Error generating PDF signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF upload signature' },
      { status: 500 }
    )
  }
}
