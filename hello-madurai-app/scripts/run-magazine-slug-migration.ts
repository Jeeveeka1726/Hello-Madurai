import prisma from '../src/lib/prisma'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  try {
    console.log('🔧 Running magazine slug column migration...')
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-magazine-slug-column.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    
    // Execute raw SQL
    await prisma.$executeRawUnsafe(sql)
    
    console.log('✅ Successfully added slug column to magazines table!')
    console.log('📝 Column: slug VARCHAR(600) NULL UNIQUE')
    console.log('🔍 Index: magazines_slug_idx created')
  } catch (error: any) {
    if (error.message.includes('Duplicate column name')) {
      console.log('⏭️  Column already exists, skipping migration')
    } else {
      console.error('❌ Migration failed:', error)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
