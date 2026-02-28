import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'dbngxtspv',
    api_key: process.env.CLOUDINARY_API_KEY || '187251687769698',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM',
})

/**
 * Generic API to generate Cloudinary upload signatures.
 * Query Parameters:
 * - folder: The folder in Cloudinary (e.g., 'hello-madurai/magazines')
 * - resourceType: 'image', 'raw' (for PDF), or 'video' (for audio)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const folder = searchParams.get('folder') || 'hello-madurai/uploads'
        const resourceType = searchParams.get('resourceType') || 'image'

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'dbngxtspv'
        const apiKey = process.env.CLOUDINARY_API_KEY || '187251687769698'
        const apiSecret = process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM'

        const timestamp = Math.round(Date.now() / 1000)

        // Sign exactly the params that the browser will send to Cloudinary
        const paramsToSign = {
            timestamp,
            folder
        }

        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

        console.log('🔑 Generated Cloudinary signature:', {
            timestamp,
            folder,
            resourceType,
            signature: signature.substring(0, 5) + '...'
        })

        return NextResponse.json({
            signature,
            timestamp,
            cloudName,
            apiKey,
            folder,
            resourceType,
        })
    } catch (error) {
        console.error('❌ Error generating Cloudinary signature:', error)
        return NextResponse.json(
            { error: 'Failed to generate upload signature' },
            { status: 500 }
        )
    }
}
