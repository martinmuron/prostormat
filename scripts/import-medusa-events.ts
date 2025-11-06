import xlsx from "xlsx"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"
import { findMatchingVenues, deriveGuestRangeFromNumber } from "@/lib/quick-request-utils"

// Admin user ID for importing events
const ADMIN_USER_ID = "c381d339-c09b-4216-9730-ad351796eaa7"

// Path to the Excel file
const EXCEL_FILE_PATH =
  "/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/Downloads/poptavky-medusa-restaurant-club-cabaret-06-11-2025-21-37-37.xlsx"

interface ExcelRow {
  "Jméno": string
  "Příjmení": string
  "Email": string
  "Telefon": string
  "Název akce": string
  "Datum a čas akce": string | number
  "Počet hostů": number
  "Popis akce": string
}

function parseExcelDate(excelDate: string | number): Date | null {
  if (typeof excelDate === "number") {
    // Excel date serial number
    const date = xlsx.SSF.parse_date_code(excelDate)
    return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0)
  }

  if (typeof excelDate === "string") {
    // Try parsing various date formats
    // Format: "DD.MM.YYYY HH:MM" or "DD.MM.YYYY"
    const parts = excelDate.split(" ")
    const datePart = parts[0]
    const timePart = parts[1] || "00:00"

    const [day, month, year] = datePart.split(".").map(Number)
    const [hours, minutes] = timePart.split(":").map(Number)

    if (!day || !month || !year) return null

    return new Date(year, month - 1, day, hours || 0, minutes || 0)
  }

  return null
}

function parsePhoneNumber(phone: string): string | null {
  if (!phone || phone.trim() === "") return null

  // Clean up phone number
  let cleaned = phone.trim().replace(/\s+/g, "")

  // If it starts with 420, ensure it has +
  if (cleaned.startsWith("420")) {
    cleaned = "+" + cleaned
  }

  // If it doesn't start with + and looks like a Czech number, add +420
  if (!cleaned.startsWith("+") && cleaned.match(/^[0-9]{9}$/)) {
    cleaned = "+420" + cleaned
  }

  return cleaned
}

async function importEvents() {
  console.log("📖 Reading Excel file...")

  try {
    const workbook = xlsx.readFile(EXCEL_FILE_PATH)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const rows = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { raw: false })

    console.log(`📊 Found ${rows.length} rows in Excel file`)

    // Filter for future events (after November 6, 2025)
    const today = new Date("2025-11-06")
    today.setHours(0, 0, 0, 0)

    const futureEvents = rows
      .slice(1) // Skip header row
      .map((row, index) => {
        const eventDate = parseExcelDate(row["Datum a čas akce"])
        return { row, eventDate, rowNumber: index + 2 }
      })
      .filter(({ eventDate }) => {
        if (!eventDate) return false
        return eventDate >= today
      })

    console.log(`✅ Found ${futureEvents.length} events with future dates (after Nov 6, 2025)`)

    if (futureEvents.length === 0) {
      console.log("No events to import. Exiting.")
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const { row, eventDate, rowNumber } of futureEvents) {
      try {
        const firstName = row["Jméno"]?.trim() || ""
        const lastName = row["Příjmení"]?.trim() || ""
        const contactName = [firstName, lastName].filter(Boolean).join(" ") || "Bez jména"
        const contactEmail = row["Email"]?.trim()
        const contactPhone = parsePhoneNumber(row["Telefon"])
        const title = row["Název akce"]?.trim() || "Bez názvu"
        const description = row["Popis akce"]?.trim() || ""
        const guestCount = row["Počet hostů"] ? parseInt(String(row["Počet hostů"]), 10) : null

        if (!contactEmail || !contactEmail.includes("@")) {
          console.warn(`⚠️  Row ${rowNumber}: Skipping - invalid email (${contactEmail})`)
          errorCount++
          continue
        }

        console.log(`\n📝 Importing: ${title} (${contactName}, ${guestCount} guests, ${eventDate?.toLocaleDateString("cs-CZ")})`)

        // Determine event type based on title
        let eventType = "ostatní"
        const titleLower = title.toLowerCase()
        if (titleLower.includes("svatb")) eventType = "svatba"
        else if (titleLower.includes("večírek") || titleLower.includes("vecirek")) eventType = "firemní akce"
        else if (titleLower.includes("oslava") || titleLower.includes("narozenin")) eventType = "oslava"
        else if (titleLower.includes("teambuilding")) eventType = "teambuilding"

        // Create event request
        const eventRequestId = randomUUID()
        const eventRequest = await db.eventRequest.create({
          data: {
            id: eventRequestId,
            userId: ADMIN_USER_ID,
            title,
            description: description || null,
            eventType,
            eventDate: eventDate,
            guestCount: guestCount || null,
            budgetRange: null,
            locationPreference: "Praha", // Default to Prague since Medusa is in Prague
            requirements: null,
            contactName,
            contactEmail,
            contactPhone,
            status: "active",
          },
        })

        console.log(`   ✓ Created event request: ${eventRequestId}`)

        // Find matching venues and create venue broadcast
        try {
          const matchingVenues = await findMatchingVenues({
            guestCount: guestCount || null,
            locationPreference: "Praha",
          })

          const guestRangeInfo = deriveGuestRangeFromNumber(guestCount || null)
          const guestLabel =
            guestRangeInfo.label ||
            (typeof guestCount === "number" && Number.isFinite(guestCount)
              ? `${guestCount} hostů`
              : null)

          const broadcastTitleParts = [guestLabel, "Praha"].filter(Boolean)
          const broadcastTitle = broadcastTitleParts.length
            ? `Rychlá poptávka · ${broadcastTitleParts.join(" · ")}`
            : "Rychlá poptávka"

          const sentVenueIds = matchingVenues.map((venue) => venue.id)

          const broadcast = await db.venueBroadcast.create({
            data: {
              id: randomUUID(),
              userId: ADMIN_USER_ID,
              eventRequestId: eventRequest.id,
              title: broadcastTitle,
              description: description || "Poptávka z Event Boardu (import z Medusa)",
              eventType,
              eventDate: eventDate,
              guestCount: typeof guestCount === "number" && Number.isFinite(guestCount)
                ? Math.max(1, Math.floor(guestCount))
                : 1,
              budgetRange: null,
              locationPreference: "Praha",
              requirements: null,
              contactEmail,
              contactPhone,
              contactName,
              sentVenues: sentVenueIds as any,
              status: "pending",
              sentCount: 0,
            },
          })

          console.log(`   ✓ Created venue broadcast: ${broadcast.id}`)

          // Create venue broadcast logs
          if (matchingVenues.length > 0) {
            await db.venueBroadcastLog.createMany({
              data: matchingVenues.map((venue) => ({
                id: randomUUID(),
                broadcastId: broadcast.id,
                venueId: venue.id,
                emailStatus: "pending",
              })),
            })
            console.log(`   ✓ Created ${matchingVenues.length} venue broadcast logs`)
          } else {
            console.log(`   ⚠️  No matching venues found`)
          }
        } catch (broadcastError) {
          console.error(`   ✗ Failed to create venue broadcast:`, broadcastError)
        }

        successCount++
      } catch (error) {
        console.error(`✗ Row ${rowNumber}: Error importing event:`, error)
        errorCount++
      }
    }

    console.log(`\n${"=".repeat(60)}`)
    console.log(`✅ Successfully imported: ${successCount} events`)
    console.log(`❌ Failed to import: ${errorCount} events`)
    console.log(`${"=".repeat(60)}`)

  } catch (error) {
    console.error("Fatal error:", error)
    process.exit(1)
  }
}

// Run the import
importEvents()
  .then(() => {
    console.log("\n✅ Import completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Import failed:", error)
    process.exit(1)
  })
