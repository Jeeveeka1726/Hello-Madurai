import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'file:./prisma/dev.db' }
  }
})

async function exportData() {
  console.log('📦 Exporting data from SQLite...\n')
  
  try {
    const data = {
      news: await prisma.news.findMany({
        include: {
          comments: true,
          shares: true
        }
      }),
      videos: await prisma.video.findMany({
        include: {
          comments: true,
          shares: true
        }
      }),
      events: await prisma.event.findMany({
        include: {
          registrations: true
        }
      }),
      businesses: await prisma.business.findMany({
        include: {
          comments: true
        }
      }),
      radioFolders: await prisma.radioFolder.findMany(),
      radioShows: await prisma.radioShow.findMany({
        include: {
          comments: true,
          shares: true
        }
      }),
      magazineCollections: await prisma.magazineCollection.findMany(),
      magazineIssues: await prisma.magazineIssue.findMany(),
      helplines: await prisma.helpline.findMany(),
      subscriptions: await prisma.subscription.findMany(),
      discountCards: await prisma.discountCard.findMany({
        include: {
          usages: true
        }
      })
    }
    
    const outputPath = path.join(process.cwd(), 'data-export.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    
    console.log('✅ Data exported successfully!\n')
    console.log('📊 Export Summary:')
    console.log(`   📰 News:         ${data.news.length}`)
    console.log(`   📹 Videos:       ${data.videos.length}`)
    console.log(`   📅 Events:       ${data.events.length}`)
    console.log(`   🏢 Businesses:   ${data.businesses.length}`)
    console.log(`   📻 Radio Shows:  ${data.radioShows.length}`)
    console.log(`   📁 Radio Folders: ${data.radioFolders.length}`)
    console.log(`   📖 Magazines:    ${data.magazineCollections.length}`)
    console.log(`   📕 Issues:       ${data.magazineIssues.length}`)
    console.log(`   ☎️  Helplines:    ${data.helplines.length}`)
    console.log(`   💌 Subscriptions: ${data.subscriptions.length}`)
    console.log(`   🎫 Discount Cards: ${data.discountCards.length}`)
    console.log(`\n📁 Saved to: ${outputPath}`)
    console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  }
}

exportData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })

