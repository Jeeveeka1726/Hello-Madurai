import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'file:./prisma/dev.db' }
  }
})

async function exportData() {
  console.log('📦 Exporting data...\n')
  
  const businesses = await prisma.business.findMany({
    include: { comments: true }
  })
  
  const data = { businesses }
  
  fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2))
  
  console.log('✅ Exported successfully!')
  console.log(`   🏢 Businesses: ${businesses.length}`)
  console.log(`\n📁 Saved to: data-export.json`)
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

