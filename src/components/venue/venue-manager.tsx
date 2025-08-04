"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, User } from "lucide-react"

type VenueManagerProps = {
  venue: {
    id: string
    prostormat_users: {
      id: string
      name: string | null
      email: string
      phone: string | null
      image?: string | null
    } | null
  }
}

export function VenueManager({ venue }: VenueManagerProps) {
  if (!venue.prostormat_users) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Žádný správce přiřazen</h3>
        <p className="text-gray-500 mb-4">
          Tento prostor nemá přiřazeného správce.
        </p>
        <Button variant="outline">
          Přiřadit správce
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informace o správci</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={venue.prostormat_users.image || undefined} />
              <AvatarFallback className="text-lg">
                {venue.prostormat_users.name?.[0]?.toUpperCase() || venue.prostormat_users.email[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <h3 className="text-xl font-semibold">{venue.prostormat_users.name || "Bez jména"}</h3>
                <Badge variant="outline">Správce prostoru</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  <a href={`mailto:${venue.prostormat_users.email}`} className="hover:underline">
                    {venue.prostormat_users.email}
                  </a>
                </div>
                {venue.prostormat_users.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    <a href={`tel:${venue.prostormat_users.phone}`} className="hover:underline">
                      {venue.prostormat_users.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline">
          Změnit správce
        </Button>
        <Button variant="outline">
          Zobrazit profil
        </Button>
      </div>
    </div>
  )
}
