import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Stránka nenalezena | Prostormat",
  description: "Stránka, kterou hledáte, neexistuje nebo byla přesunuta. Zkuste vyhledat prostory nebo se vraťte na hlavní stránku.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* 404 Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl mb-6">
          <span className="text-4xl font-bold text-rose-600">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Stránka nenalezena
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
          Možná vám pomůže jedna z následujících možností.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 rounded-xl px-6">
              <Home className="w-4 h-4 mr-2" />
              Hlavní stránka
            </Button>
          </Link>
          <Link href="/prostory">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl px-6 border-gray-300">
              <Search className="w-4 h-4 mr-2" />
              Hledat prostory
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-4">Mohlo by vás zajímat:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/faq"
              className="text-gray-600 hover:text-black transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              Časté dotazy
            </Link>
            <Link
              href="/kontakt"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Kontakt
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Zpět na předchozí stránku
          </button>
        </div>
      </div>
    </div>
  )
}
