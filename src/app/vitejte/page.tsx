import { getServerSession } from "next-auth"
import Link from "next/link"
import type { Metadata } from "next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Vítejte v Prostormatu",
  description: "Úspěšně jste ověřili svůj účet. Vyberte si další krok na Prostormatu.",
}

export default async function VerifiedWelcomePage() {
  const session = await getServerSession(authOptions)
  const displayName = session?.user?.name || session?.user?.email || "Prostorťáku"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-12 text-center">
          <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
            E-mail ověřen
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 break-words">
            {`Vítejte, ${displayName}!`}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Jsme rádi, že jste s námi. Váš účet je aktivní a připravený na první akci.
            Vyberte si další krok – můžete rovnou procházet prostory nebo poslat rychlou poptávku
            na stovky ověřených míst současně s jedním kliknutím.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild size="lg" className="rounded-xl bg-black hover:bg-gray-900 text-white">
              <Link href="/prostory">Procházet prostory</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Link href="/rychla-poptavka">Poslat rychlou poptávku</Link>
            </Button>
          </div>

          <div className="mt-8">
            <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900">
              <Link href="/dashboard">Přejít na dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
