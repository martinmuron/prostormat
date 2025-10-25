import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

const BASE_URL = SITE_URL

const STATIC_ROUTES: Array<{ path: string; priority?: number }> = [
  { path: "" },
  { path: "/prostory" },
  { path: "/organizace-akce" },
  { path: "/rychla-poptavka" },
  { path: "/poptavka-prostoru" },
  { path: "/faq" },
  { path: "/kontakt" },
  { path: "/blog" },
  { path: "/o-nas" },
  { path: "/ceny" },
  { path: "/pridat-prostor" },
  { path: "/event-board" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: priority ?? 0.7,
  }))

  // Dynamic entries are disabled for deployment stability. 
  return routes
  return routes
}
