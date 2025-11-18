import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalVenues = await prisma.venue.count();
  const activeVenues = await prisma.venue.count({ where: { status: 'active' } });
  const pragueVenues = await prisma.venue.count({
    where: {
      OR: [
        { address: { contains: 'Praha', mode: 'insensitive' } },
        { district: { contains: 'Praha', mode: 'insensitive' } }
      ]
    }
  });

  console.log('Database Statistics:');
  console.log('===================');
  console.log(`Total venues: ${totalVenues}`);
  console.log(`Active venues: ${activeVenues}`);
  console.log(`Prague venues: ${pragueVenues}`);

  // Get some recent venues
  const recentVenues = await prisma.venue.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { name: true, slug: true, createdAt: true }
  });

  console.log('\nRecent venues created:');
  recentVenues.forEach(v => {
    console.log(`  - ${v.name} (${v.slug})`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
