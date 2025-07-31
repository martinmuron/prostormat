import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Logo variant="black" size="md" href="/" />
            </div>
            <p className="text-body text-gray-600 max-w-md">
              Největší katalog event prostorů v Praze. Spojujeme organizátory akcí s jedinečnými prostory.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-headline font-semibold text-black mb-4">
              Odkazy
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/prostory" className="text-body text-gray-600 hover:text-black transition-colors">
                  Prostory
                </Link>
              </li>
              <li>
                <Link href="/pozadavky" className="text-body text-gray-600 hover:text-black transition-colors">
                  Veřejné zakázky
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-body text-gray-600 hover:text-black transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/ceny" className="text-body text-gray-600 hover:text-black transition-colors">
                  Ceny
                </Link>
              </li>
              <li>
                <Link href="/pridat-prostor" className="text-body text-gray-600 hover:text-black transition-colors">
                  Přidat prostor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-headline font-semibold text-black mb-4">
              Podpora
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/kontakt" className="text-body text-gray-600 hover:text-black transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-body text-gray-600 hover:text-black transition-colors">
                  Časté otázky
                </Link>
              </li>
              <li>
                <Link href="/podminky-pouziti" className="text-body text-gray-600 hover:text-black transition-colors">
                  Podmínky použití
                </Link>
              </li>
              <li>
                <Link href="/ochrana-soukromi" className="text-body text-gray-600 hover:text-black transition-colors">
                  Ochrana soukromí
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-caption text-gray-500">
              © 2024 Prostormat. Všechna práva vyhrazena.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/podminky-pouziti" className="text-caption text-gray-500 hover:text-black transition-colors">
                Podmínky
              </Link>
              <Link href="/ochrana-soukromi" className="text-caption text-gray-500 hover:text-black transition-colors">
                Soukromí
              </Link>
              <Link href="/kontakt" className="text-caption text-gray-500 hover:text-black transition-colors">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}