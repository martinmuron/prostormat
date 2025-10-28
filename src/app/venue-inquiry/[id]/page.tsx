import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Mail, Phone, User, MessageSquare, ArrowLeft } from "lucide-react"

function formatDate(value: Date | null) {
  if (!value) return "Datum dle dohody"
  return value.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

async function getInquiryWithAccessCheck(inquiryId: string, userId: string, userRole: string) {
  const inquiry = await db.venueInquiry.findUnique({
    where: { id: inquiryId },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          slug: true,
          paid: true,
          managerId: true,
        },
      },
    },
  })

  if (!inquiry) {
    return { status: "not_found" } as const
  }

  const isAdmin = userRole === "admin"
  const managesVenue = inquiry.venue.managerId === userId

  if (!isAdmin && !managesVenue) {
    return { status: "unauthorized" } as const
  }

  return { status: "ok", inquiry }
}

export const dynamic = "force-dynamic"

export default async function VenueInquiryPublicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(`/venue-inquiry/${id}`)
    redirect(`/prihlaseni?callbackUrl=${callbackUrl}`)
  }

  const result = await getInquiryWithAccessCheck(id, session.user.id!, session.user.role)

  if (result.status === "not_found" || result.status === "unauthorized") {
    notFound()
  }

  const inquiry = result.inquiry
  if (!inquiry) {
    notFound()
  }

  const eventDate = inquiry.eventDate ? new Date(inquiry.eventDate) : null

  if (!inquiry.venue.paid) {
    redirect(`/pridat-prostor?inquiry=${encodeURIComponent(id)}&venue=${encodeURIComponent(inquiry.venue.slug)}`)
  }

  const mailtoHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(
    `Re: poptávka přes Prostormat - ${inquiry.venue.name}`
  )}`

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8">
          <Link
            href={`/prostory/${inquiry.venue.slug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět na profil prostoru
          </Link>

          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-900">
            Poptávka #{inquiry.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 mt-1">
            Vygenerováno pro prostor <strong>{inquiry.venue.name}</strong>
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detaily akce</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 tracking-[0.2em]">
                    Datum akce
                  </p>
                  <p className="text-base text-gray-900">{formatDate(eventDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 tracking-[0.2em]">
                    Počet hostů
                  </p>
                  <p className="text-base text-gray-900">
                    {typeof inquiry.guestCount === "number" ? `${inquiry.guestCount} hostů` : "Neuvedeno"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontaktní údaje zákazníka</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 tracking-[0.2em]">Jméno</p>
                  <p className="text-base text-gray-900">{inquiry.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500 tracking-[0.2em]">Email</p>
                  <a href={`mailto:${inquiry.email}`} className="text-base text-blue-600 underline">
                    {inquiry.email}
                  </a>
                </div>
              </div>

              {inquiry.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 tracking-[0.2em]">Telefon</p>
                    <a href={`tel:${inquiry.phone}`} className="text-base text-blue-600 underline">
                      {inquiry.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {inquiry.message && (
            <Card>
              <CardHeader>
                <CardTitle>Zpráva zákazníka</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <MessageSquare className="mt-0.5 h-5 w-5 text-gray-500" />
                  <p className="leading-relaxed">{inquiry.message}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={mailtoHref}>Kontaktovat zákazníka</a>
          </Button>
          <p className="text-sm text-gray-500">
            Poptávka vytvořena {inquiry.createdAt.toLocaleDateString("cs-CZ")} v{" "}
            {inquiry.createdAt.toLocaleTimeString("cs-CZ")}
          </p>
        </div>
      </div>
    </div>
  )
}
