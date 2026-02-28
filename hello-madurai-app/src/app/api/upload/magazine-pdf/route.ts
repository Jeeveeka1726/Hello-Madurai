import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Generate a signed upload token for the browser to upload a PDF directly to Cloudinary.
// The browser uploads directly to Cloudinary (not through Vercel), so there is NO body size limit.
export async function GET() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'dbngxtspv'
    const apiKey = process.env.CLOUDINARY_API_KEY || '187251687769698'
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM'

    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'hello-madurai/magazines'

    // Sign exactly the params that the browser will send to Cloudinary
    const paramsToSign = { timestamp, folder }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

    console.log('🔑 Generated Cloudinary PDF signature:', { timestamp, folder, signature: signature.substring(0, 5) + '...' })

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
      resourceType: 'raw',
    })
  } catch (error) {
    console.error('❌ Error generating Cloudinary signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}
