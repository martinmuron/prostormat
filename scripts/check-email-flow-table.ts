import { db } from "../src/lib/db"

async function checkEmailFlowTable() {
  console.log("🔍 Checking Email Flow table...\n")

  try {
    // Check if table exists by trying to count records
    const count = await db.emailFlowLog.count()
    console.log(`✅ Table exists: prostormat_email_flow_logs`)
    console.log(`📊 Total records: ${count}\n`)

    if (count > 0) {
      // Get sample records
      const samples = await db.emailFlowLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      })

      console.log("📧 Sample email logs:")
      samples.forEach((log, i) => {
        console.log(`\n${i + 1}. ${log.emailType}`)
        console.log(`   To: ${log.recipient}`)
        console.log(`   Subject: ${log.subject}`)
        console.log(`   Status: ${log.status}`)
        console.log(`   Sent by: ${log.user.name} (${log.user.email})`)
        console.log(`   Created: ${log.createdAt}`)
        if (log.error) {
          console.log(`   Error: ${log.error}`)
        }
      })

      // Get statistics
      const stats = await db.emailFlowLog.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      })

      console.log("\n📈 Status breakdown:")
      stats.forEach(stat => {
        console.log(`   ${stat.status}: ${stat._count.id}`)
      })
    } else {
      console.log("⚠️  Table is empty - no email logs found")
      console.log("This could mean:")
      console.log("  1. No emails have been sent yet")
      console.log("  2. Email sending is not calling the logging function")
      console.log("  3. Logging function is failing silently")
    }

  } catch (error) {
    console.error("❌ Error accessing email flow table:")
    console.error(error)

    if ((error as any).code === 'P2021') {
      console.log("\n⚠️  Table does not exist in database!")
      console.log("You may need to run: npx prisma db push")
    }
  } finally {
    await db.$disconnect()
  }
}

checkEmailFlowTable()
