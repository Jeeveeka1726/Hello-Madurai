import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData() {
  console.log('📥 Importing data to PostgreSQL...\n')
  
  try {
    const dataPath = path.join(process.cwd(), 'data-export.json')
    
    if (!fs.existsSync(dataPath)) {
      throw new Error('data-export.json not found! Run export script first.')
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    
    console.log('📊 Import Summary:')
    console.log(`   📰 News to import:         ${data.news?.length || 0}`)
    console.log(`   📹 Videos to import:       ${data.videos?.length || 0}`)
    console.log(`   📅 Events to import:       ${data.events?.length || 0}`)
    console.log(`   🏢 Businesses to import:   ${data.businesses?.length || 0}`)
    console.log(`   📻 Radio Shows to import:  ${data.radioShows?.length || 0}`)
    console.log('')
    
    // Import Radio Folders first (no dependencies)
    if (data.radioFolders?.length > 0) {
      console.log('📁 Importing radio folders...')
      for (const folder of data.radioFolders) {
        await prisma.radioFolder.upsert({
          where: { id: folder.id },
          update: {},
          create: folder
        })
      }
      console.log(`✅ Imported ${data.radioFolders.length} radio folders`)
    }
    
    // Import News
    if (data.news?.length > 0) {
      console.log('📰 Importing news...')
      for (const item of data.news) {
        const { comments, shares, ...newsData } = item
        await prisma.news.upsert({
          where: { id: newsData.id },
          update: {},
          create: newsData
        })
        // Import comments
        if (comments?.length > 0) {
          for (const comment of comments) {
            await prisma.newsComment.upsert({
              where: { id: comment.id },
              update: {},
              create: comment
            })
          }
        }
        // Import shares
        if (shares?.length > 0) {
          for (const share of shares) {
            await prisma.newsShare.upsert({
              where: { id: share.id },
              update: {},
              create: share
            })
          }
        }
      }
      console.log(`✅ Imported ${data.news.length} news articles`)
    }
    
    // Import Videos
    if (data.videos?.length > 0) {
      console.log('📹 Importing videos...')
      for (const item of data.videos) {
        const { comments, shares, ...videoData } = item
        await prisma.video.upsert({
          where: { id: videoData.id },
          update: {},
          create: videoData
        })
        // Import comments
        if (comments?.length > 0) {
          for (const comment of comments) {
            await prisma.videoComment.upsert({
              where: { id: comment.id },
              update: {},
              create: comment
            })
          }
        }
        // Import shares
        if (shares?.length > 0) {
          for (const share of shares) {
            await prisma.videoShare.upsert({
              where: { id: share.id },
              update: {},
              create: share
            })
          }
        }
      }
      console.log(`✅ Imported ${data.videos.length} videos`)
    }
    
    // Import Events
    if (data.events?.length > 0) {
      console.log('📅 Importing events...')
      for (const item of data.events) {
        const { registrations, ...eventData } = item
        await prisma.event.upsert({
          where: { id: eventData.id },
          update: {},
          create: eventData
        })
        // Import registrations
        if (registrations?.length > 0) {
          for (const reg of registrations) {
            await prisma.eventRegistration.upsert({
              where: { id: reg.id },
              update: {},
              create: reg
            })
          }
        }
      }
      console.log(`✅ Imported ${data.events.length} events`)
    }
    
    // Import Businesses
    if (data.businesses?.length > 0) {
      console.log('🏢 Importing businesses...')
      for (const item of data.businesses) {
        const { comments, ...businessData } = item
        await prisma.business.upsert({
          where: { id: businessData.id },
          update: {},
          create: businessData
        })
        // Import comments
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
      console.log(`✅ Imported ${data.businesses.length} businesses`)
    }
    
    // Import Radio Shows
    if (data.radioShows?.length > 0) {
      console.log('📻 Importing radio shows...')
      for (const item of data.radioShows) {
        const { comments, shares, ...showData } = item
        await prisma.radioShow.upsert({
          where: { id: showData.id },
          update: {},
          create: showData
        })
        // Import comments
        if (comments?.length > 0) {
          for (const comment of comments) {
            await prisma.radioComment.upsert({
              where: { id: comment.id },
              update: {},
              create: comment
            })
          }
        }
        // Import shares
        if (shares?.length > 0) {
          for (const share of shares) {
            await prisma.radioShare.upsert({
              where: { id: share.id },
              update: {},
              create: share
            })
          }
        }
      }
      console.log(`✅ Imported ${data.radioShows.length} radio shows`)
    }
    
    // Import Magazine Collections
    if (data.magazineCollections?.length > 0) {
      console.log('📖 Importing magazine collections...')
      for (const mag of data.magazineCollections) {
        await prisma.magazineCollection.upsert({
          where: { id: mag.id },
          update: {},
          create: mag
        })
      }
      console.log(`✅ Imported ${data.magazineCollections.length} magazine collections`)
    }
    
    // Import Magazine Issues
    if (data.magazineIssues?.length > 0) {
      console.log('📕 Importing magazine issues...')
      for (const issue of data.magazineIssues) {
        await prisma.magazineIssue.upsert({
          where: { id: issue.id },
          update: {},
          create: issue
        })
      }
      console.log(`✅ Imported ${data.magazineIssues.length} magazine issues`)
    }
    
    // Import Helplines
    if (data.helplines?.length > 0) {
      console.log('☎️ Importing helplines...')
      for (const helpline of data.helplines) {
        await prisma.helpline.upsert({
          where: { id: helpline.id },
          update: {},
          create: helpline
        })
      }
      console.log(`✅ Imported ${data.helplines.length} helplines`)
    }
    
    // Import Subscriptions
    if (data.subscriptions?.length > 0) {
      console.log('💌 Importing subscriptions...')
      for (const sub of data.subscriptions) {
        await prisma.subscription.upsert({
          where: { id: sub.id },
          update: {},
          create: sub
        })
      }
      console.log(`✅ Imported ${data.subscriptions.length} subscriptions`)
    }
    
    // Import Discount Cards
    if (data.discountCards?.length > 0) {
      console.log('🎫 Importing discount cards...')
      for (const card of data.discountCards) {
        const { usages, ...cardData } = card
        await prisma.discountCard.upsert({
          where: { id: cardData.id },
          update: {},
          create: cardData
        })
        // Import usages
        if (usages?.length > 0) {
          for (const usage of usages) {
            await prisma.cardUsage.upsert({
              where: { id: usage.id },
              update: {},
              create: usage
            })
          }
        }
      }
      console.log(`✅ Imported ${data.discountCards.length} discount cards`)
    }
    
    console.log('\n🎉 Import complete!')
  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  }
}

importData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })

