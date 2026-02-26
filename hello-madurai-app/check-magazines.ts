import { PrismaClient } from '@prisma/client'

async function main() {
    const prisma = new PrismaClient()
    try {
        const magazines = await prisma.magazine.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { collection: true }
        })
        console.log('Last 5 magazines:')
        console.log(JSON.stringify(magazines, null, 2))
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
