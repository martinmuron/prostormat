import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <span className="text-8xl font-bold text-gray-200">404</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Stránka nenalezena
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          Omlouváme se, ale stránka kterou hledáte neexistuje, byla přesunuta nebo je dočasně nedostupná.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 rounded-xl">
              <Home className="h-4 w-4 mr-2" />
              Zpět na úvod
            </Button>
          </Link>
          <Link href="/prostory">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl">
              <Search className="h-4 w-4 mr-2" />
              Prohlédnout prostory
            </Button>
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 mb-4">Hledáte něco konkrétního?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/prostory"
              className="text-sm text-gray-600 hover:text-black transition-colors underline underline-offset-4"
            >
              Katalog prostorů
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/event-board"
              className="text-sm text-gray-600 hover:text-black transition-colors underline underline-offset-4"
            >
              Event Board
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/rychla-poptavka"
              className="text-sm text-gray-600 hover:text-black transition-colors underline underline-offset-4"
            >
              Rychlá poptávka
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/kontakt"
              className="text-sm text-gray-600 hover:text-black transition-colors underline underline-offset-4"
            >
              Kontakt
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/faq"
              className="text-sm text-gray-600 hover:text-black transition-colors underline underline-offset-4"
            >
              Časté dotazy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
