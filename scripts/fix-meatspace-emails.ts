import { db } from "@/lib/db"

// Mapping of venue slug to correct email
const venueEmailUpdates: Record<string, string> = {
  // Centrum Jasoň (3 venues)
  "atelier-jason": "info@jasoncentrum.cz",
  "cvicebna-jason": "info@jasoncentrum.cz",
  "multifunkcni-sal-jason": "info@jasoncentrum.cz",

  // Falkensteiner Hotel Prague
  "boardroom-falkensteiner": "prague@reservations.falkensteiner.com",

  // Braunův dům (3 venues)
  "braunuv-dum": "pronajem@braunuvdum.cz",
  "braunuv-dum_braunuv-sal": "pronajem@braunuvdum.cz",
  "braunuv-dum_salmovsky-sal": "pronajem@braunuvdum.cz",

  // Jednačky Hradčanská
  "jednacky-hradcanska": "jednacka@anfas.cz",

  // JEZERO.OOO
  "jezero-ooo": "info@jezero.ooo",

  // Národní dům na Vinohradech
  "narodni-dum-na-vinohradech": "nardum@nardum.cz",

  // Sumo Garden
  "sumo-garden": "info@littlebiglab.cz",

  // Vila Kajetánka (3 venues)
  "vila-kajetanka-sal-roma": "premek@vilakajetanka.cz",
  "vila-kajetanka-salonky": "premek@vilakajetanka.cz",
  "vila-kajetanka-terasa": "premek@vilakajetanka.cz",

  // Zasedáme
  "zasedame-cz": "info@zasedame.cz",
}

async function fixMeatspaceEmails() {
  console.log("🔧 Fixing meatspace.cz emails...")
  console.log(`Found ${Object.keys(venueEmailUpdates).length} venues to update\n`)

  let successCount = 0
  let errorCount = 0

  for (const [slug, newEmail] of Object.entries(venueEmailUpdates)) {
    try {
      const venue = await db.venue.findUnique({
        where: { slug },
        select: { id: true, name: true, contactEmail: true },
      })

      if (!venue) {
        console.log(`⚠️  Venue not found: ${slug}`)
        errorCount++
        continue
      }

      if (venue.contactEmail === newEmail) {
        console.log(`✓ ${venue.name} - Already has correct email: ${newEmail}`)
        successCount++
        continue
      }

      await db.venue.update({
        where: { slug },
        data: { contactEmail: newEmail },
      })

      console.log(`✅ ${venue.name}`)
      console.log(`   Old: ${venue.contactEmail}`)
      console.log(`   New: ${newEmail}\n`)

      successCount++
    } catch (error) {
      console.error(`❌ Error updating ${slug}:`, error)
      errorCount++
    }
  }

  console.log(`\n${"=".repeat(60)}`)
  console.log(`✅ Successfully updated: ${successCount} venues`)
  console.log(`❌ Failed to update: ${errorCount} venues`)
  console.log(`${"=".repeat(60)}`)
}

// Run the fix
fixMeatspaceEmails()
  .then(() => {
    console.log("\n✅ Email fix completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Email fix failed:", error)
    process.exit(1)
  })
