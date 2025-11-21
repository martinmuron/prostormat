"use client"

import Link from "next/link"
import { Building2, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VenueRemovedPageProps {
  venueName?: string
  district?: string
}

export function VenueRemovedPage({ venueName, district }: VenueRemovedPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center">
        <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-8 h-8 text-gray-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {venueName ? `${venueName} již není k dispozici` : "Prostor již není k dispozici"}
        </h1>

        <div className="space-y-4">
          <Link href="/prostory" className="block">
            <Button className="w-full" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Procházet všechny prostory
            </Button>
          </Link>

          {district && (
            <Link
              href={`/prostory?district=${encodeURIComponent(district)}`}
              className="block"
            >
              <Button variant="outline" className="w-full" size="lg">
                Prostory v lokalitě {district}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}

          <Link href="/rychla-poptavka" className="block">
            <Button variant="ghost" className="w-full">
              Poslat rychlou poptávku
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Máte otázku? Kontaktujte nás na{" "}
            <a href="mailto:info@prostormat.cz" className="text-blue-600 hover:underline">
              info@prostormat.cz
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
