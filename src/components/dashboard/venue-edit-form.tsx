"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ImageManager } from "@/components/ui/image-manager"
import { YouTubeManager } from "@/components/ui/youtube-manager"
import { AmenitiesManager } from "@/components/ui/amenities-manager"
import { ProfileCompletion } from "@/components/ui/profile-completion"
import { VenueInfo } from "@/components/ui/venue-info"
import { VenuePreview } from "@/components/ui/venue-preview"
import { formatDate } from "@/lib/utils"
import { 
  Building, 
  Save, 
  Eye,
  MessageSquare,
  Settings,
  Camera,
  Star,
  Monitor
} from "lucide-react"

type VenueInquirySummary = {
  id: string
  name: string
  email: string
  phone?: string | null
  message?: string | null
  eventDate?: string | Date | null
  guestCount?: number | null
  createdAt: string | Date
}

type EditableVenue = {
  id: string
  slug: string
  name: string
  description?: string | null
  address?: string | null
  capacitySeated?: number | null
  capacityStanding?: number | null
  venueType?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  websiteUrl?: string | null
  videoUrl?: string | null
  images: string[]
  amenities: string[]
  status: string
  inquiries?: VenueInquirySummary[]
  createdAt: string | Date
  updatedAt: string | Date
}

interface VenueEditFormProps {
  venue: EditableVenue
}

interface VenueFormState {
  name: string
  description: string
  address: string
  capacitySeated: string
  capacityStanding: string
  venueType: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
  youtubeUrl: string
  images: string[]
  amenities: string[]
  status: string
}

export function VenueEditForm({ venue }: VenueEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<VenueFormState>({
    name: venue.name ?? "",
    description: venue.description ?? "",
    address: venue.address ?? "",
    capacitySeated: venue.capacitySeated ? String(venue.capacitySeated) : "",
    capacityStanding: venue.capacityStanding ? String(venue.capacityStanding) : "",
    venueType: venue.venueType ?? "",
    contactEmail: venue.contactEmail ?? "",
    contactPhone: venue.contactPhone ?? "",
    websiteUrl: venue.websiteUrl ?? "",
    youtubeUrl: venue.videoUrl ?? "",
    images: Array.isArray(venue.images) ? venue.images : [],
    amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
    status: venue.status ?? "draft"
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

const statusLabels: Record<string, string> = {
  draft: "Koncept",
  pending: "Čeká na schválení",
  published: "Zveřejněný",
  active: "Aktivní",
  hidden: "Skrytý",
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
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

  const handleChange = <Field extends keyof VenueFormState>(field: Field, value: VenueFormState[Field]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSectionFocus = (section: string) => {
    const sectionMap: { [key: string]: string } = {
      'basic-info': 'basic',
      'images': 'media',
      'video': 'media',
      'capacity': 'basic',
      'contact': 'basic',
      'venue-type': 'basic',
      'amenities': 'features',
      'website': 'basic'
    }
    const targetTab = sectionMap[section] || 'basic'
    setActiveTab(targetTab)
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
          <p className="text-gray-600">Správa vašeho prostoru</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Náhled
          </Button>
          <Button 
            onClick={() => window.open(`/prostory/${venue.slug}`, '_blank')}
            variant="secondary"
          >
            <Monitor className="h-4 w-4 mr-2" />
            Zobrazit živě
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Profile Completion */}
        <div className="lg:col-span-1">
          <ProfileCompletion 
            venue={formData} 
            onSectionFocus={handleSectionFocus}
          />
          
          {/* Recent Inquiries */}
          <Card className="mt-6 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Nedávné dotazy</CardTitle>
            </CardHeader>
            <CardContent>
              {venue.inquiries?.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-body text-gray-600">
                    Zatím žádné dotazy
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {venue.inquiries?.slice(0, 3).map((inquiry) => (
                    <div key={inquiry.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{inquiry.name}</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Nový
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
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
                  {(venue.inquiries?.length ?? 0) > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{(venue.inquiries?.length ?? 0) - 3} dalších
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Edit Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-gray-50">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Základní</span>
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Média</span>
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Vybavení</span>
                  </TabsTrigger>
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="hidden sm:inline">Info</span>
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="basic" className="space-y-6 mt-0">
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
                              type="text"
                              value={formData.capacitySeated}
                              onChange={(e) => handleChange("capacitySeated", e.target.value)}
                              placeholder="50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ke stání
                            </label>
                            <Input
                              type="text"
                              value={formData.capacityStanding}
                              onChange={(e) => handleChange("capacityStanding", e.target.value)}
                              placeholder="100"
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
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm text-gray-600 mb-1">Aktuální stav</p>
                          <p className="text-base font-semibold text-gray-900">
                            {statusLabels[formData.status] || formData.status}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Stav prostoru upravuje tým Prostormat. Pokud potřebujete změnu viditelnosti, kontaktujte nás prosím.
                          </p>
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
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6 mt-0">
                    <div className="space-y-6">
                      <ImageManager 
                        images={formData.images} 
                        onImagesChange={(images) => handleChange("images", images)}
                      />
                      <YouTubeManager 
                        videoUrl={formData.youtubeUrl}
                        onVideoChange={(url) => handleChange("youtubeUrl", url)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-6 mt-0">
                    <AmenitiesManager 
                      selectedAmenities={formData.amenities}
                      onAmenitiesChange={(amenities) => handleChange("amenities", amenities)}
                    />
                  </TabsContent>

                  <TabsContent value="info" className="space-y-6 mt-0">
                  <VenueInfo
                    venue={{
                      ...venue,
                      createdAt: new Date(venue.createdAt).toISOString(),
                      updatedAt: new Date(venue.updatedAt).toISOString(),
                      inquiries: venue.inquiries?.map((inquiry) => ({
                        ...inquiry,
                        message: inquiry.message ?? '',
                        createdAt: new Date(inquiry.createdAt).toISOString(),
                        eventDate: inquiry.eventDate ? new Date(inquiry.eventDate).toISOString() : undefined,
                        phone: inquiry.phone ?? undefined,
                        guestCount: inquiry.guestCount ?? undefined,
                      })),
                    }}
                  />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="bg-white sticky top-4">
            <CardHeader>
              <CardTitle className="text-gray-900">Rychlé akce</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Náhled profilu
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                  onClick={() => window.open(`/prostory/${venue.slug}`, '_blank')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Zobrazit živě
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

      {/* Preview Modal */}
      <VenuePreview 
        venue={{ ...formData, slug: venue.slug }}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}
