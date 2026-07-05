import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding sample Hello Madurai author...')

  // Check if author already exists
  const existingAuthor = await prisma.author.findUnique({
    where: { slug: 'hello-madurai' }
  })

  if (existingAuthor) {
    console.log('Hello Madurai author already exists!')
    return
  }

  // Create the sample author
  const author = await prisma.author.create({
    data: {
      name: 'Hello Madurai',
      name_ta: 'ஹலோ மதுரை',
      slug: 'hello-madurai',
      imageUrl: '/hello-madurai-logo.jpeg',
      description: 'Hello Madurai is your trusted source for local news, events, and information from Madurai and surrounding areas. Our team of dedicated reporters brings you the latest updates on what matters most to our community.',
      description_ta: 'ஹலோ மதுரை என்பது மதுரை மற்றும் சுற்றியுள்ள பகுதிகளின் உள்ளூர் செய்திகள், நிகழ்வுகள் மற்றும் தகவல்களுக்கான உங்கள் நம்பகமான ஆதாரமாகும். எங்கள் அர்ப்பணிப்புள்ள செய்தியாளர்கள் குழு, எங்கள் சமூகத்திற்கு மிக முக்கியமான சமீபத்திய புதுப்பிப்புகளை உங்களுக்கு கொண்டு வருகிறது.',
      active: true,
      featured: true,
      orderNumber: 0
    }
  })

  console.log('Sample author created successfully!')
  console.log('Name:', author.name)
  console.log('Slug:', author.slug)
  console.log('ID:', author.id)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
