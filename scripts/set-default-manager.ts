import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DEFAULT_MANAGER_EMAIL = 'info@prostormat.cz'

async function main() {
  const manager = await prisma.user.upsert({
    where: { email: DEFAULT_MANAGER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_MANAGER_EMAIL,
      name: 'ProstorMat Team',
      role: 'venue_manager',
    },
  })

  if (manager.role !== 'venue_manager') {
    console.warn(
      `Warning: user ${DEFAULT_MANAGER_EMAIL} exists with role "${manager.role}". Consider switching to "venue_manager" if venue manager features require it.`
    )
  }

  const result = await prisma.venue.updateMany({
    data: {
      managerId: manager.id,
    },
  })

  console.log(`Updated ${result.count} venues to manager ${DEFAULT_MANAGER_EMAIL}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
