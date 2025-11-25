import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Stránka nenalezena | Prostormat",
  description: "Stránka, kterou hledáte, neexistuje. Vraťte se na hlavní stránku nebo vyhledejte prostory.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold text-gray-200">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Stránka nenalezena
        </h1>
        <p className="text-gray-600 mb-8">
          Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:bg-blue-700"
          >
            Zpět na hlavní stránku
          </Link>
          <Link
            href="/prostory"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Prohlédnout prostory
          </Link>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Hledáte konkrétní prostor? Zkuste tyto odkazy:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/prostory/kategorie/firemni-akce"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Firemní akce
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/prostory/kategorie/svatba"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Svatby
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/prostory/kategorie/teambuilding"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Teambuilding
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/kontakt"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
