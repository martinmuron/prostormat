"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ImageManager } from "@/components/ui/image-manager"
import { YouTubeManager } from "@/components/ui/youtube-manager"
import { AmenitiesManager } from "@/components/ui/amenities-manager"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Save,
  Eye,
  MessageSquare,
  Settings,
  Camera,
  Star,
  BarChart3,
  Monitor,
  Shield,
  Music,
  Instagram,
  ArrowLeft
} from "lucide-react"

type ClaimantInfo = {
  name?: string | null
  email?: string | null
}

type VenueClaimSummary = {
  id: string
  status: string
  createdAt: string
  claimant?: ClaimantInfo | null
}

type VenueManagerInfo = {
  id: string
  name?: string | null
  email?: string | null
}

interface AdminVenue {
  id: string
  slug: string
  name: string
  description?: string | null
  address?: string | null
  district?: string | null
  capacitySeated?: number | null
  capacityStanding?: number | null
  venueType?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  websiteUrl?: string | null
  instagramUrl?: string | null
  videoUrl?: string | null
  youtubeUrl?: string | null
  musicAfter10?: boolean | null
  images: string[]
  amenities: string[]
  status: string
  isRecommended?: boolean | null
  priority?: number | null
  managerId?: string | null
  manager?: VenueManagerInfo | null
  claims?: VenueClaimSummary[]
  totalViews?: number | null
  _count?: {
    inquiries: number
  }
  createdAt: string | Date
  updatedAt: string | Date
}

interface AdminVenueFormState {
  name: string
  description: string
  address: string
  district: string
  capacitySeated: string
  capacityStanding: string
  venueType: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
  instagramUrl: string
  youtubeUrl: string
  musicAfter10: boolean
  images: string[]
  amenities: string[]
  status: string
  isRecommended: boolean
  priority: number | null
  managerId: string
}

interface AdminVenueEditFormProps {
  venue: AdminVenue
}

export function AdminVenueEditForm({ venue }: AdminVenueEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [managerEmail, setManagerEmail] = useState(venue.manager?.email || "")
  const [managerPassword, setManagerPassword] = useState("")
  const pendingClaims = venue.claims ?? []

  const [formData, setFormData] = useState<AdminVenueFormState>({
    name: venue.name ?? "",
    description: venue.description ?? "",
    address: venue.address ?? "",
    district: venue.district ?? "",
    capacitySeated: venue.capacitySeated?.toString() ?? "",
    capacityStanding: venue.capacityStanding?.toString() ?? "",
    venueType: venue.venueType ?? "",
    contactEmail: venue.contactEmail ?? "",
    contactPhone: venue.contactPhone ?? "",
    websiteUrl: venue.websiteUrl ?? "",
    instagramUrl: venue.instagramUrl ?? "",
    youtubeUrl: venue.videoUrl ?? venue.youtubeUrl ?? "",
    musicAfter10: !!venue.musicAfter10,
    images: Array.isArray(venue.images) ? venue.images : [],
    amenities: Array.isArray(venue.amenities) ? venue.amenities : [],
    status: venue.status ?? "draft",
    isRecommended: !!venue.isRecommended,
    priority: typeof venue.priority === "number" ? venue.priority : null,
    managerId: venue.managerId ?? ""
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

  const statusOptions = [
    { value: "draft", label: "Koncept" },
    { value: "pending", label: "Čeká na schválení" },
    { value: "published", label: "Zveřejněný" },
    { value: "active", label: "Aktivní" },
    { value: "hidden", label: "Skrytý" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const trimmedManagerEmail = managerEmail.trim()

      if (!trimmedManagerEmail) {
        setErrorMessage('Email správce prostoru je povinný')
        setIsLoading(false)
        return
      }

      let resolvedManagerId = formData.managerId
      const currentManagerEmail = venue.manager?.email || ''
      let managerCreated = false

      if (trimmedManagerEmail.toLowerCase() !== currentManagerEmail.toLowerCase()) {
        const userResponse = await fetch(
          `/api/admin/users/find-by-email?email=${encodeURIComponent(trimmedManagerEmail)}`
        )

        if (userResponse.ok) {
          const userData = await userResponse.json()
          resolvedManagerId = userData.user.id
        } else if (userResponse.status === 404) {
          if (!managerPassword || managerPassword.length < 8) {
            setErrorMessage('Pro nového správce zadejte heslo alespoň o 8 znacích')
            setIsLoading(false)
            return
          }

          const createResponse = await fetch('/api/admin/users/create-venue-manager', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: trimmedManagerEmail,
              password: managerPassword,
            }),
          })

          if (createResponse.ok) {
            const createData = await createResponse.json()
            resolvedManagerId = createData.user.id
            setManagerPassword('')
            managerCreated = true
          } else if (createResponse.status === 409) {
            const conflictData = await createResponse.json().catch(() => null)
            if (conflictData?.userId) {
              resolvedManagerId = conflictData.userId
            } else {
              setErrorMessage(conflictData?.error || 'Nepodařilo se vytvořit uživatele.')
              setIsLoading(false)
              return
            }
          } else {
            const errorData = await createResponse.json().catch(() => null)
            setErrorMessage(errorData?.error || 'Nepodařilo se vytvořit nového správce.')
            setIsLoading(false)
            return
          }
        } else {
          const errorText = await userResponse.text()
          setErrorMessage(errorText || 'Nepodařilo se načíst informace o správci prostoru.')
          setIsLoading(false)
          return
        }
      }

      const payload = {
        ...formData,
        managerId: resolvedManagerId,
      }

      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccessMessage(
          managerCreated
            ? 'Byl vytvořen nový správce prostoru a přiřazen k tomuto místu. Prostor byl úspěšně aktualizován!'
            : 'Prostor byl úspěšně aktualizován!'
        )
        if (!managerCreated && managerPassword) {
          setManagerPassword('')
        }
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        const error = await response.json()
        setErrorMessage(`Chyba při aktualizaci: ${error.message || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error("Error updating venue:", error)
      setErrorMessage("Došlo k chybě při aktualizaci prostoru")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = <Field extends keyof AdminVenueFormState>(field: Field, value: AdminVenueFormState[Field]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatClaimTimestamp = (value: string) =>
    new Date(value).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/venues")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na seznam
            </Button>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Admin režim
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{venue.name}</h2>
          <p className="text-gray-600">Kompletní správa prostoru</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(`/prostory/${venue.slug}`, '_blank')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Zobrazit živě
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <Card className="bg-white">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 rounded-none border-b bg-gray-50">
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
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistiky</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Základní informace</h3>

                    <div>
                      <Label htmlFor="name">Název prostoru *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Název vašeho prostoru"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Popis</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Popište váš prostor, jeho výhody a možnosti..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Adresa *</Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="Ulice a číslo, město, PSČ"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="district">Okres/Část města</Label>
                      <Input
                        id="district"
                        type="text"
                        value={formData.district}
                        onChange={(e) => handleChange("district", e.target.value)}
                        placeholder="Praha 1, Brno-střed, atd."
                      />
                    </div>

                    <div>
                      <Label htmlFor="venueType">Typ prostoru</Label>
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
                        <Label htmlFor="capacitySeated">K sezení</Label>
                        <Input
                          id="capacitySeated"
                          type="text"
                          value={formData.capacitySeated}
                          onChange={(e) => handleChange("capacitySeated", e.target.value)}
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacityStanding">Ke stání</Label>
                        <Input
                          id="capacityStanding"
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
                      <Label htmlFor="contactEmail">E-mail *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleChange("contactEmail", e.target.value)}
                        placeholder="kontakt@prostor.cz"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Telefon</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                        placeholder="+420 123 456 789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="websiteUrl">Webové stránky</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => handleChange("websiteUrl", e.target.value)}
                        placeholder="https://www.prostor.cz"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagramUrl">Instagram URL</Label>
                      <div className="flex gap-2">
                        <Instagram className="h-5 w-5 text-gray-400 mt-2" />
                        <Input
                          id="instagramUrl"
                          type="url"
                          value={formData.instagramUrl}
                          onChange={(e) => handleChange("instagramUrl", e.target.value)}
                          placeholder="https://instagram.com/prostor"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Media Tab */}
                <TabsContent value="media" className="space-y-6 mt-0">
                  <ImageManager
                    images={formData.images}
                    onImagesChange={(images) => handleChange("images", images)}
                  />
                  <YouTubeManager
                    videoUrl={formData.youtubeUrl}
                    onVideoChange={(url) => handleChange("youtubeUrl", url)}
                  />
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-6 mt-0">
                  <AmenitiesManager
                    selectedAmenities={formData.amenities}
                    onAmenitiesChange={(amenities) => handleChange("amenities", amenities)}
                  />

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="musicAfter10" className="text-base">
                          Hudba po 22:00
                        </Label>
                        <p className="text-sm text-gray-500">
                          Povolení pro hlasitou hudbu po 22:00
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gray-400" />
                        <Switch
                          checked={formData.musicAfter10}
                          onCheckedChange={(checked) => handleChange("musicAfter10", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Admin Tab */}
                <TabsContent value="admin" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      Administrátorská nastavení
                    </h3>

                    <div>
                      <Label htmlFor="status">Stav prostoru</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priorita zobrazení</Label>
                      <Select
                        value={typeof formData.priority === "number" ? formData.priority.toString() : "none"}
                        onValueChange={(value) =>
                          handleChange(
                            "priority",
                            value === "none" ? null : Number.parseInt(value, 10)
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bez priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Bez priority</SelectItem>
                          <SelectItem value="1">1 – vždy první</SelectItem>
                          <SelectItem value="2">2 – po prioritě 1</SelectItem>
                          <SelectItem value="3">3 – po prioritě 1 a 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Prázdná hodnota znamená náhodné pořadí po prioritách 1–3.
                      </p>
                    </div>

                    <div className="flex items-center justify-between border rounded-lg p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="isRecommended" className="text-base">
                          Doporučený prostor
                        </Label>
                        <p className="text-sm text-gray-500">
                          Zobrazit jako doporučený na platformě
                        </p>
                      </div>
                      <Switch
                        id="isRecommended"
                        checked={formData.isRecommended}
                        onCheckedChange={(checked) => handleChange("isRecommended", checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="managerEmail">Email správce prostoru</Label>
                      <Input
                        id="managerEmail"
                        type="email"
                        value={managerEmail}
                        onChange={(e) => setManagerEmail(e.target.value)}
                        placeholder="manazer@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Aktuální správce: {venue.manager?.name} ({venue.manager?.email})
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="managerPassword">Heslo pro nového správce</Label>
                      <Input
                        id="managerPassword"
                        type="password"
                        value={managerPassword}
                        onChange={(e) => setManagerPassword(e.target.value)}
                        placeholder="Zadejte heslo (min. 8 znaků)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pokud email dosud neexistuje, vytvoříme nové konto správce s tímto heslem.
                      </p>
                    </div>

                    {pendingClaims.length > 0 && (
                      <div className="space-y-3 border rounded-lg p-4 bg-purple-50 border-purple-200">
                        <h4 className="text-sm font-semibold text-purple-900">
                          Čekající žádosti o převzetí ({pendingClaims.length})
                        </h4>
                        <div className="space-y-3">
                          {pendingClaims.map((claim) => (
                            <div key={claim.id} className="bg-white rounded-lg border border-purple-100 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {claim.claimant?.name || 'Neuvedeno'}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {claim.claimant?.email || 'Bez emailu'}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatClaimTimestamp(claim.createdAt)}
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {claim.claimant?.email && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setManagerEmail(claim.claimant.email)}
                                  >
                                    Použít email pro správce
                                  </Button>
                                )}
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                  Stav: {claim.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Statistiky prostoru</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Celkové zobrazení</p>
                              <p className="text-2xl font-bold">{venue.totalViews}</p>
                            </div>
                            <Eye className="h-8 w-8 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Dotazy</p>
                              <p className="text-2xl font-bold">{venue._count?.inquiries || 0}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Vytvořeno</p>
                      <p className="text-base">{new Date(venue.createdAt).toLocaleDateString('cs-CZ')}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Poslední aktualizace</p>
                      <p className="text-base">{new Date(venue.updatedAt).toLocaleDateString('cs-CZ')}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Slug</p>
                      <p className="text-base font-mono">{venue.slug}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="text-base font-mono text-xs">{venue.id}</p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
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
            onClick={() => router.push("/admin/venues")}
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Zrušit
          </Button>
        </div>
      </form>
    </div>
  )
}
