import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface VenueInquiryPageProps {
  params: Promise<{ id: string }>
}

export default async function VenueInquiryPage({ params }: VenueInquiryPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard")
  }

  const inquiry = await db.venueInquiry.findUnique({
    where: { id },
    include: {
      venue: {
        select: {
          id: true,
          name: true,
          slug: true,
          paid: true,
          status: true,
          contactEmail: true,
          contactPhone: true,
          manager: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!inquiry) {
    notFound()
  }

  const formattedEventDate = inquiry.eventDate
    ? new Date(inquiry.eventDate).toLocaleDateString("cs-CZ")
    : "Neuvedeno"

  const formattedSubmitted = new Date(inquiry.createdAt).toLocaleString("cs-CZ")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Detail poptávky u prostoru</h1>
        <p className="text-muted-foreground">
          Ověřte stav členství prostoru a obratem kontaktujte klienta.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-xl">{inquiry.venue.name}</CardTitle>
            <Badge variant={inquiry.venue.paid ? "default" : "destructive"}>
              {inquiry.venue.paid ? "Placené členství" : "Bez členství"}
            </Badge>
            <Badge variant="outline" className="uppercase tracking-wide">
              {inquiry.venue.status}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/venues/${inquiry.venue.id}/edit`}>
                Otevřít detail prostoru
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/prostory/${inquiry.venue.slug}`} target="_blank">
                Zobrazit veřejný profil
              </Link>
            </Button>
            {inquiry.venue.contactEmail && (
              <Button asChild variant="ghost">
                <a href={`mailto:${inquiry.venue.contactEmail}`}>
                  Napsat provozovateli
                </a>
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Odesláno {formattedSubmitted}
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Kontakt zákazníka</h2>
              <dl className="space-y-2 text-sm leading-relaxed">
                <div>
                  <dt className="font-medium text-muted-foreground">Jméno</dt>
                  <dd>{inquiry.name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">E-mail</dt>
                  <dd>
                    <a className="text-primary underline" href={`mailto:${inquiry.email}`}>
                      {inquiry.email}
                    </a>
                  </dd>
                </div>
                {inquiry.phone && (
                  <div>
                    <dt className="font-medium text-muted-foreground">Telefon</dt>
                    <dd>
                      <a className="text-primary underline" href={`tel:${inquiry.phone}`}>
                        {inquiry.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {inquiry.guestCount && (
                  <div>
                    <dt className="font-medium text-muted-foreground">Počet hostů</dt>
                    <dd>{inquiry.guestCount}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-muted-foreground">Datum akce</dt>
                  <dd>{formattedEventDate}</dd>
                </div>
              </dl>
            </section>

            {inquiry.user && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Registrovaný uživatel</h2>
                <dl className="space-y-2 text-sm leading-relaxed">
                  <div>
                    <dt className="font-medium text-muted-foreground">Jméno</dt>
                    <dd>{inquiry.user.name ?? "Neuvedeno"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">E-mail</dt>
                    <dd>{inquiry.user.email}</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Zpráva klienta</h2>
              <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                {inquiry.message || "Bez zprávy"}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Správce prostoru</h2>
              <dl className="space-y-2 text-sm leading-relaxed">
                <div>
                  <dt className="font-medium text-muted-foreground">Jméno</dt>
                  <dd>{inquiry.venue.manager?.name ?? "Neuvedeno"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">E-mail</dt>
                  <dd>{inquiry.venue.manager?.email ?? "Neuvedeno"}</dd>
                </div>
                {inquiry.venue.manager?.phone && (
                  <div>
                    <dt className="font-medium text-muted-foreground">Telefon</dt>
                    <dd>{inquiry.venue.manager.phone}</dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
