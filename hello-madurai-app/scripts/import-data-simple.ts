import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function importData() {
  console.log('📥 Importing businesses to PostgreSQL...\n')
  
  const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'))
  
  console.log(`   🏢 Businesses to import: ${data.businesses?.length || 0}\n`)
  
  if (data.businesses?.length > 0) {
    for (const business of data.businesses) {
      const { comments, ...businessData } = business
      await prisma.business.upsert({
        where: { id: businessData.id },
        update: {},
        create: businessData
      })
      
      // Import comments if any
      if (comments?.length > 0) {
        for (const comment of comments) {
          await prisma.businessComment.upsert({
            where: { id: comment.id },
            update: {},
            create: comment
          })
        }
      }
    }
    console.log(`✅ Imported ${data.businesses.length} businesses!`)
  }
  
  console.log('\n🎉 Import complete!')
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

