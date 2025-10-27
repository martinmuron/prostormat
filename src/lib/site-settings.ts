import { prisma } from "@/lib/prisma"

const TOP_PRIORITY_KEY = "pricing.top_priority_sold_out"

export async function getTopPrioritySoldOut(): Promise<boolean> {
  const record = await prisma.emailTrigger.findUnique({
    where: { triggerKey: TOP_PRIORITY_KEY },
  })

  if (!record) {
    return false
  }

  return Boolean(record.isEnabled)
}

export async function setTopPrioritySoldOut(soldOut: boolean) {
  await prisma.emailTrigger.upsert({
    where: { triggerKey: TOP_PRIORITY_KEY },
    update: {
      isEnabled: soldOut,
      description: soldOut
        ? "Top Priority balíček je označen jako vyprodaný."
        : "Top Priority balíček je dostupný.",
    },
    create: {
      triggerKey: TOP_PRIORITY_KEY,
      name: "Top Priority – prodejní dostupnost",
      description: soldOut
        ? "Top Priority balíček je označen jako vyprodaný."
        : "Top Priority balíček je dostupný.",
      templateKey: "pricing-top-priority-flag",
      isEnabled: soldOut,
    },
  })
}
