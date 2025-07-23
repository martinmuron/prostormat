"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VENUE_TYPES } from "@/types"

type VenueFormProps = {
  venue: any
}

export function VenueForm({ venue }: VenueFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: venue.name || "",
    description: venue.description || "",
    address: venue.address || "",
    district: venue.district || "",
    venueType: venue.venueType || "",
    contactEmail: venue.contactEmail || "",
    contactPhone: venue.contactPhone || "",
    status: venue.status || "draft",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Nepodařilo se uložit změny")
      toast.success("Změny byly úspěšně uloženy")
      router.refresh()
    } catch (error) {
      console.error("Error updating venue:", error)
      toast.error("Nepodařilo se uložit změny")
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form id="venue-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Název prostoru</label>
          <Input 
            placeholder="Název prostoru" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Typ prostoru</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.venueType}
            onChange={(e) => handleChange('venueType', e.target.value)}
          >
            <option value="">Vyberte typ prostoru</option>
            {Object.entries(VENUE_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Adresa</label>
          <Input 
            placeholder="Ulice a číslo popisné" 
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Městská část</label>
          <Input 
            placeholder="Např. Praha 1" 
            value={formData.district}
            onChange={(e) => handleChange('district', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Kontaktní e-mail</label>
          <Input 
            type="email" 
            placeholder="kontakt@example.com" 
            value={formData.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Telefonní číslo</label>
          <Input 
            placeholder="+420 123 456 789" 
            value={formData.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stav</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="draft">Koncept</option>
            <option value="active">Aktivní</option>
            <option value="expired">Expirovaný</option>
            <option value="suspended">Pozastavený</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Popis prostoru</label>
        <Textarea
          placeholder="Podrobný popis prostoru, vybavení, kapacity, atd."
          className="min-h-[120px]"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Ukládání..." : "Uložit změny"}
        </Button>
      </div>
    </form>
  )
}
