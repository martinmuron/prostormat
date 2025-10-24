import type { Metadata } from "next"

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
    images: [
      {
        url: "https://prostormat.cz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prostormat - Event Board"
      }
    ],
    locale: "cs_CZ",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Board - Poptávky po prostorech",
    description: "Prohlížejte aktuální poptávky organizátorů firemních akcí a nabídněte své místo.",
    images: ["https://prostormat.cz/og-image.jpg"]
  }
}

export default function EventBoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
