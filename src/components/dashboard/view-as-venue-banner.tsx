import Link from "next/link"
import { Eye, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ViewAsVenueBannerProps {
  venueName: string
  venueSlug: string
}

export function ViewAsVenueBanner({ venueName, venueSlug }: ViewAsVenueBannerProps) {
  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Eye className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Režim náhledu
            </p>
            <p className="text-sm text-amber-700">
              Prohlížíte admin panel prostoru <strong>{venueName}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/prostory/${venueSlug}`} target="_blank">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <ExternalLink className="h-4 w-4 mr-1" />
              Veřejný profil
            </Button>
          </Link>
          <Link href="/admin/view-as-venue">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Změnit prostor
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              Zpět do adminu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
