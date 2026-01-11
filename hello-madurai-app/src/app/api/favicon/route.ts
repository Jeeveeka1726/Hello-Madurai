import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Read the favicon file from public directory
    const faviconPath = join(process.cwd(), 'public', 'hello-madurai-icon.ico')
    const faviconBuffer = readFileSync(faviconPath)
    
    // Return the favicon with proper headers and no caching
    return new NextResponse(faviconBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error serving favicon:', error)
    return new NextResponse('Favicon not found', { status: 404 })
  }
}
