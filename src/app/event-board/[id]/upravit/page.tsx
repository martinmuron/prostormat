import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { EventRequestForm } from "@/components/forms/event-request-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EditEventRequestPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventRequestPage({ params }: EditEventRequestPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect(`/prihlaseni?callbackUrl=/event-board/${id}/upravit`)
  }

  const eventRequest = await db.eventRequest.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      eventType: true,
      eventDate: true,
      guestCount: true,
      budgetRange: true,
      locationPreference: true,
      requirements: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
    },
  })

  if (!eventRequest || eventRequest.userId !== session.user.id) {
    notFound()
  }

  const initialValues = {
    title: eventRequest.title,
    description: eventRequest.description ?? "",
    eventType: eventRequest.eventType,
    eventDate: eventRequest.eventDate
      ? eventRequest.eventDate.toISOString().slice(0, 10)
      : "",
    guestCount: eventRequest.guestCount ?? undefined,
    budgetRange: eventRequest.budgetRange ?? "",
    locationPreference: eventRequest.locationPreference ?? "",
    requirements: eventRequest.requirements ?? "",
    contactName: eventRequest.contactName,
    contactEmail: eventRequest.contactEmail,
    contactPhone: eventRequest.contactPhone ?? "",
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-display text-black mb-6 font-bold">Upravit poptávku</h1>
          <p className="text-title-3 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Aktualizujte detaily své poptávky, aby nabídky od provozovatelů co nejlépe odpovídaly tomu, co hledáte.
          </p>
        </div>

        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white p-8">
            <CardTitle className="text-title-2 text-black font-bold">Detaily akce</CardTitle>
            <p className="text-body text-gray-600 mt-2">
              Upravte informace, které mají provozovatelé vidět
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <EventRequestForm
              mode="edit"
              eventRequestId={id}
              initialValues={initialValues}
              successRedirect="/dashboard"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
