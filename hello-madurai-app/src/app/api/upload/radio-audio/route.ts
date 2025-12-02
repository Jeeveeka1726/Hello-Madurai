import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || '187251687769698',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM',
})

// Generate Cloudinary upload signature
// This allows the browser to upload directly to Cloudinary, bypassing Vercel's 4.5MB limit
export async function GET() {
  try {
    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'hello-madurai/radio-audio'

    // Generate signature for secure uploads
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        resource_type: 'video',
      },
      process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM'
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY || '187251687769698',
      folder,
    })
  } catch (error) {
    console.error('❌ Error generating signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}

