import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EventRequestForm } from "@/components/forms/event-request-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewEventRequestPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/prihlaseni?callbackUrl=/pozadavky/novy")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-display text-black mb-6 font-bold">Nová poptávka na akci</h1>
          <p className="text-title-3 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Popište svou akci a my ji zveřejníme pro provozovatele prostorů v Praze. 
            Získejte nabídky přímo od vlastníků prostorů.
          </p>
        </div>

        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white p-8">
            <CardTitle className="text-title-2 text-black font-bold">Detaily akce</CardTitle>
            <p className="text-body text-gray-600 mt-2">
              Vyplňte informace o vaší akci pro nejlepší nabídky
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <EventRequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}