import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Database is now clean and ready for real content!
  // You can add content through the admin panel at /admin-login
  // Default admin password: admin123
  
  console.log('✅ Database is clean and ready for real content!')
  console.log('🚀 Start adding content through the admin panel:')
  console.log('   1. Go to http://localhost:3000/admin-login')
  console.log('   2. Login with password: admin123')
  console.log('   3. Start adding your real news, events, videos, and more!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
