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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-title-1 text-black mb-4">Nový požadavek na akci</h1>
          <p className="text-body text-gray-600">
            Popište svou akci a my ji zveřejníme pro provozovatele prostorů v Praze.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detaily akce</CardTitle>
          </CardHeader>
          <CardContent>
            <EventRequestForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}