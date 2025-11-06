import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateQuickRequestTitles() {
  console.log('🔍 Finding quick requests with range-based titles...')

  // Find all venue broadcasts with range-based titles
  const broadcasts = await prisma.venueBroadcast.findMany({
    where: {
      title: {
        contains: 'Rychlá poptávka'
      },
      OR: [
        { title: { contains: '1-25' } },
        { title: { contains: '26-50' } },
        { title: { contains: '51-100' } },
        { title: { contains: '101-200' } },
        { title: { contains: '200+' } },
      ]
    },
    select: {
      id: true,
      title: true,
      guestCount: true,
      locationPreference: true,
      eventRequestId: true,
    }
  })

  console.log(`📊 Found ${broadcasts.length} broadcasts to update`)

  let updatedBroadcasts = 0
  let updatedEventRequests = 0

  for (const broadcast of broadcasts) {
    const guestCount = broadcast.guestCount
    const location = broadcast.locationPreference

    // Build new title with exact number
    const locationLabel = location === 'Celá Praha' ? 'Praha' : location
    const titleParts = [`${guestCount} hostů`, locationLabel].filter(Boolean)
    const newTitle = titleParts.length > 0
      ? `Rychlá poptávka · ${titleParts.join(' · ')}`
      : 'Rychlá poptávka'

    // Update broadcast title
    await prisma.venueBroadcast.update({
      where: { id: broadcast.id },
      data: { title: newTitle }
    })
    updatedBroadcasts++

    console.log(`✅ Updated broadcast: "${broadcast.title}" → "${newTitle}"`)

    // Update corresponding event request if it exists
    if (broadcast.eventRequestId) {
      try {
        const eventRequest = await prisma.eventRequest.findUnique({
          where: { id: broadcast.eventRequestId },
          select: { title: true }
        })

        if (eventRequest) {
          // Update event request title
          const eventTitleParts = [`${guestCount} hostů`, locationLabel].filter(Boolean)
          const newEventTitle = eventTitleParts.length > 0
            ? `Rychlá poptávka: ${eventTitleParts.join(' · ')}`
            : 'Rychlá poptávka'

          await prisma.eventRequest.update({
            where: { id: broadcast.eventRequestId },
            data: { title: newEventTitle }
          })
          updatedEventRequests++

          console.log(`   ✅ Updated event board: "${eventRequest.title}" → "${newEventTitle}"`)
        }
      } catch (error) {
        console.error(`   ⚠️ Failed to update event request ${broadcast.eventRequestId}:`, error)
      }
    }
  }

  console.log('\n✨ Update complete!')
  console.log(`📊 Summary:`)
  console.log(`   - ${updatedBroadcasts} broadcasts updated`)
  console.log(`   - ${updatedEventRequests} event board entries updated`)
}

updateQuickRequestTitles()
  .then(() => {
    console.log('✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
