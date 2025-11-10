import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test if images table exists by counting records
    const imageCount = await prisma.image.count()
    console.log(`✅ Images table exists. Found ${imageCount} images`)
    
    // Test if we can create a test record (we'll delete it immediately)
    const testImage = await prisma.image.create({
      data: {
        filename: 'test.jpg',
        data: Buffer.from('test'),
        mimeType: 'image/jpeg',
        size: 4
      }
    })
    console.log('✅ Can create image records:', testImage.id)
    
    // Delete the test record
    await prisma.image.delete({
      where: { id: testImage.id }
    })
    console.log('✅ Can delete image records')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      imageCount,
      tests: {
        connection: 'OK',
        tableExists: 'OK',
        canCreate: 'OK',
        canDelete: 'OK'
      }
    })
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

