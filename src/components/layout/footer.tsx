import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-title-3 font-bold text-black mb-4">
              Prostormat
            </h3>
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
                  Požadavky na akce
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-body text-gray-600 hover:text-black transition-colors">
                  Blog
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
                <Link href="/podminky" className="text-body text-gray-600 hover:text-black transition-colors">
                  Podmínky použití
                </Link>
              </li>
              <li>
                <Link href="/soukromi" className="text-body text-gray-600 hover:text-black transition-colors">
                  Ochrana soukromí
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-callout text-gray-500">
            © {new Date().getFullYear()} Prostormat. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  )
}