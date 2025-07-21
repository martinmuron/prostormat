"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { 
  Building, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  Save, 
  Eye,
  MessageSquare,
  Calendar,
  Settings
} from "lucide-react"

interface VenueEditFormProps {
  venue: any
}

export function VenueEditForm({ venue }: VenueEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: venue.name || "",
    description: venue.description || "",
    address: venue.address || "",
    capacitySeated: venue.capacitySeated || "",
    capacityStanding: venue.capacityStanding || "",
    venueType: venue.venueType || "",
    contactEmail: venue.contactEmail || "",
    contactPhone: venue.contactPhone || "",
    websiteUrl: venue.websiteUrl || "",
    status: venue.status || "draft"
  })

  const venueTypes = [
    { value: "conference-hall", label: "Konferenční sál" },
    { value: "wedding-venue", label: "Svatební prostor" },
    { value: "corporate-space", label: "Firemní prostor" },
    { value: "gallery", label: "Galerie" },
    { value: "restaurant", label: "Restaurace" },
    { value: "hotel", label: "Hotel" },
    { value: "outdoor-space", label: "Venkovní prostor" },
    { value: "theater", label: "Divadlo" },
    { value: "other", label: "Jiné" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        // Show success message or redirect
      } else {
        console.error("Failed to update venue")
      }
    } catch (error) {
      console.error("Error updating venue:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-8">
      {/* Venue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Status</p>
                <Badge 
                  variant={venue.status === "active" ? "default" : "secondary"}
                  className={venue.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {venue.status === "active" ? "Aktivní" : "Neaktivní"}
                </Badge>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Dotazy</p>
                <p className="text-title-2 text-gray-900">{venue._count.inquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Kapacita</p>
                <p className="text-title-2 text-gray-900">{venue.capacitySeated || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Vytvořen</p>
                <p className="text-caption text-gray-900">{formatDate(new Date(venue.createdAt))}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Upravit informace o prostoru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Základní informace</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název prostoru *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Název vašeho prostoru"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Popište váš prostor, jeho výhody a možnosti..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresa *
                    </label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Ulice a číslo, město, PSČ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ prostoru
                    </label>
                    <Select
                      value={formData.venueType}
                      onValueChange={(value) => handleChange("venueType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ prostoru" />
                      </SelectTrigger>
                      <SelectContent>
                        {venueTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Kapacita</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        K sezení
                      </label>
                      <Input
                        type="number"
                        value={formData.capacitySeated}
                        onChange={(e) => handleChange("capacitySeated", parseInt(e.target.value) || 0)}
                        placeholder="50"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ke stání
                      </label>
                      <Input
                        type="number"
                        value={formData.capacityStanding}
                        onChange={(e) => handleChange("capacityStanding", parseInt(e.target.value) || 0)}
                        placeholder="100"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Kontaktní informace</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail *
                    </label>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      placeholder="kontakt@prostor.cz"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <Input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange("contactPhone", e.target.value)}
                      placeholder="+420 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webové stránky
                    </label>
                    <Input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => handleChange("websiteUrl", e.target.value)}
                      placeholder="https://www.prostor.cz"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Stav prostoru</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte stav" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Koncept</SelectItem>
                        <SelectItem value="active">Aktivní</SelectItem>
                        <SelectItem value="expired">Neaktivní</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Ukládá se..." : "Uložit změny"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => router.push("/dashboard")}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Zrušit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <div>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Nedávné dotazy</CardTitle>
            </CardHeader>
            <CardContent>
              {venue.inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-body text-gray-600">
                    Zatím žádné dotazy
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {venue.inquiries.slice(0, 5).map((inquiry: any) => (
                    <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{inquiry.name}</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Nový
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {inquiry.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatDate(new Date(inquiry.createdAt))}
                        </p>
                        <a 
                          href={`mailto:${inquiry.email}`}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Odpovědět
                        </a>
                      </div>
                    </div>
                  ))}
                  {venue.inquiries.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{venue.inquiries.length - 5} dalších dotazů
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Rychlé akce</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => window.open(`/prostory/${venue.slug}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Zobrazit prostor
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => router.push("/dashboard/inquiries")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Všechny dotazy
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => router.push("/dashboard")}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}