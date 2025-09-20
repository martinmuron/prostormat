"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Mail, Phone, User } from "lucide-react"

type VenueManagerProps = {
  venue: {
    id: string
    manager: {
      id: string
      name: string | null
      email: string
      phone: string | null
      image?: string | null
    } | null
  }
}

export function VenueManager({ venue }: VenueManagerProps) {
  const router = useRouter()

  const [managerForm, setManagerForm] = useState({
    name: venue.manager?.name ?? "",
    email: venue.manager?.email ?? "",
    phone: venue.manager?.phone ?? "",
  })
  const [assignEmail, setAssignEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  const handleManagerChange = (field: "name" | "email" | "phone", value: string) => {
    setManagerForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveManager = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!venue.manager) {
      toast.error("Nejprve přiřaďte správce")
      return
    }

    if (!managerForm.email.trim()) {
      toast.error("E-mail správce je povinný")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${venue.manager.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(managerForm),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data?.error ?? "Nepodařilo se uložit změny správce")
        return
      }

      setManagerForm({
        name: data.user?.name ?? managerForm.name,
        email: data.user?.email ?? managerForm.email,
        phone: data.user?.phone ?? managerForm.phone,
      })

      toast.success("Kontaktní údaje správce byly aktualizovány")
      router.refresh()
    } catch (error) {
      console.error("Failed to update manager", error)
      toast.error("Nepodařilo se uložit změny správce")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssignManager = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = assignEmail.trim().toLowerCase()
    if (!normalizedEmail) {
      toast.error("Zadejte e-mail existujícího uživatele")
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/venues/${venue.id}/assign-manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data?.error ?? "Nepodařilo se přiřadit správce. Zkontrolujte, že uživatel existuje.")
        return
      }

      toast.success("Správce prostoru byl aktualizován")
      setAssignEmail("")
      router.refresh()
    } catch (error) {
      console.error("Failed to assign manager", error)
      toast.error("Nepodařilo se přiřadit správce")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      {venue.manager ? (
        <Card>
          <CardHeader>
            <CardTitle>Správce prostoru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={venue.manager.image || undefined} />
                <AvatarFallback className="text-lg">
                  {venue.manager.name?.[0]?.toUpperCase() || venue.manager.email[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h3 className="text-xl font-semibold">{venue.manager.name || "Bez jména"}</h3>
                  <Badge variant="outline">Správce prostoru</Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    <a href={`mailto:${venue.manager.email}`} className="hover:underline">
                      {venue.manager.email}
                    </a>
                  </div>
                  {venue.manager.phone && (
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      <a href={`tel:${venue.manager.phone}`} className="hover:underline">
                        {venue.manager.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveManager} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jméno</label>
                <Input
                  value={managerForm.name}
                  onChange={(event) => handleManagerChange("name", event.target.value)}
                  placeholder="Jméno správce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <Input
                  type="email"
                  value={managerForm.email}
                  onChange={(event) => handleManagerChange("email", event.target.value)}
                  placeholder="spravce@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <Input
                  value={managerForm.phone}
                  onChange={(event) => handleManagerChange("phone", event.target.value)}
                  placeholder="+420 123 456 789"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Ukládám..." : "Uložit kontaktní údaje"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Správce zatím není přiřazen</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-3">
            <div className="flex items-center justify-center py-6">
              <User className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <p>
              Tento prostor zatím nemá přiřazeného správce. Pro přístup do administrace je potřeba přiřadit existující účet nebo vytvořit nový.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Přiřadit jiného správce</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignManager} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail existujícího uživatele</label>
              <Input
                type="email"
                value={assignEmail}
                onChange={(event) => setAssignEmail(event.target.value)}
                placeholder="uzivatel@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Uživatel musí mít již vytvořený účet. Pokud účet neexistuje, vytvořte ho ve Správě uživatelů a poté ho přiřaďte.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={isAssigning}>
                {isAssigning ? "Přiřazuji..." : "Přiřadit správce"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
