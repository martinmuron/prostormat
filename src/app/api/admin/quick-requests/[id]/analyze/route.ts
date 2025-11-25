import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import Anthropic from "@anthropic-ai/sdk"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  // Fetch the broadcast with all venue logs
  const broadcast = await prisma.venueBroadcast.findUnique({
    where: { id },
    include: {
      logs: {
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              description: true,
              amenities: true,
              venueTypes: true,
              capacitySeated: true,
              capacityStanding: true,
              musicAfter10: true,
              district: true,
            },
          },
        },
      },
    },
  })

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 })
  }

  // Get unique venues from logs
  const venues = broadcast.logs
    .map((log) => log.venue)
    .filter((v): v is NonNullable<typeof v> => v !== null)

  if (venues.length === 0) {
    return NextResponse.json({ error: "No venues to analyze" }, { status: 400 })
  }

  // Build the prompt for Claude
  const venueList = venues
    .map(
      (v) => `
- ID: ${v.id}
- Název: ${v.name}
- Popis: ${v.description || "Není k dispozici"}
- Vybavení: ${v.amenities.length > 0 ? v.amenities.join(", ") : "Neuvedeno"}
- Typy: ${v.venueTypes.length > 0 ? v.venueTypes.join(", ") : "Neuvedeno"}
- Kapacita: ${v.capacitySeated || 0} vsedě / ${v.capacityStanding || 0} vestoje
- Lokalita: ${v.district || "Neuvedeno"}
- Hudba po 22:00: ${v.musicAfter10 === true ? "Ano" : v.musicAfter10 === false ? "Ne" : "Neuvedeno"}
`
    )
    .join("\n")

  const prompt = `Jsi expert na výběr eventových prostor v Praze. Analyzuj následující poptávku a vyber prostory, které nejlépe odpovídají požadavkům.

POPTÁVKA:
- Popis: ${broadcast.description}
- Dodatečné požadavky: ${broadcast.requirements || "Žádné"}
- Počet hostů: ${broadcast.guestCount || "Neuvedeno"}
- Lokalita: ${broadcast.locationPreference || "Celá Praha"}
- Datum akce: ${broadcast.eventDate ? new Date(broadcast.eventDate).toLocaleDateString("cs-CZ") : "Neuvedeno"}

DOSTUPNÉ PROSTORY:
${venueList}

INSTRUKCE:
1. Analyzuj sémanticky popis poptávky a požadavky
2. Pokud poptávka zmiňuje:
   - "venkovní/outdoor/zahrada/terasa" → preferuj prostory s terasou nebo zahradou
   - "komorní/intimní" → preferuj menší kapacity
   - "hlasitá hudba/párty/večírek do noci" → zkontroluj musicAfter10
   - "konference/meeting/jednání" → preferuj konferenční prostory
   - "svatba/wedding" → preferuj prostory vhodné pro svatby
3. Vyřaď prostory, které zjevně neodpovídají (např. indoor prostor když chtějí outdoor)
4. Vrať POUZE JSON bez dalšího textu

Vrať JSON v tomto formátu:
{
  "recommendedVenueIds": ["id1", "id2", ...],
  "reasoning": "Stručné vysvětlení výběru v češtině (max 200 znaků)"
}`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : ""

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const result = JSON.parse(jsonStr) as {
      recommendedVenueIds: string[]
      reasoning: string
    }

    // Validate that returned IDs exist in our venue list
    const validVenueIds = new Set(venues.map((v) => v.id))
    const validRecommendedIds = result.recommendedVenueIds.filter((id) =>
      validVenueIds.has(id)
    )

    // Update the broadcast with AI results
    await prisma.venueBroadcast.update({
      where: { id },
      data: {
        aiAnalyzedAt: new Date(),
        aiRecommendedVenues: validRecommendedIds,
        aiAnalysisReason: result.reasoning,
      },
    })

    return NextResponse.json({
      success: true,
      recommendedVenueIds: validRecommendedIds,
      reasoning: result.reasoning,
      totalVenues: venues.length,
      recommendedCount: validRecommendedIds.length,
    })
  } catch (error) {
    console.error("AI analysis error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "AI analysis failed", details: message },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve cached AI results
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  const broadcast = await prisma.venueBroadcast.findUnique({
    where: { id },
    select: {
      aiAnalyzedAt: true,
      aiRecommendedVenues: true,
      aiAnalysisReason: true,
    },
  })

  if (!broadcast) {
    return NextResponse.json({ error: "Broadcast not found" }, { status: 404 })
  }

  return NextResponse.json({
    analyzed: broadcast.aiAnalyzedAt !== null,
    analyzedAt: broadcast.aiAnalyzedAt,
    recommendedVenueIds: broadcast.aiRecommendedVenues,
    reasoning: broadcast.aiAnalysisReason,
  })
}
