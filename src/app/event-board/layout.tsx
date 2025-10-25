import type { Metadata } from "next"
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGES } from "@/lib/seo"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Event Board - Poptávky po prostorech | Prostormat",
  description: "Prohlížejte aktuální poptávky organizátorů firemních akcí, teambuilding a konferencí v Praze. Oslovte je jako majitel event prostoru a nabídněte své místo.",
  keywords: [
    "event board",
    "poptávky po prostorech",
    "event prostor poptávky",
    "firemní akce poptávky",
    "teambuilding prostor",
    "konference prostor Praha"
  ],
  alternates: {
    canonical: "https://prostormat.cz/event-board",
  },
  openGraph: {
    title: "Event Board - Poptávky po prostorech | Prostormat",
    description: "Prohlížejte aktuální poptávky organizátorů firemních akcí a nabídněte své místo.",
    url: "https://prostormat.cz/event-board",
    siteName: "Prostormat",
    images: [...DEFAULT_OG_IMAGES],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Board - Poptávky po prostorech",
    description: "Prohlížejte aktuální poptávky organizátorů firemních akcí a nabídněte své místo.",
    images: [DEFAULT_OG_IMAGE]
  }
}

export default function EventBoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
