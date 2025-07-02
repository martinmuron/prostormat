"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VENUE_TYPES } from "@/types"
import { 
  Upload, 
  X, 
  MapPin, 
  Users, 
  Euro, 
  Palette, 
  Phone, 
  Mail, 
  Globe, 
  Video,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle
} from "lucide-react"

const venueFormSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  address: z.string().min(5, "Adresa musí mít alespoň 5 znaků"),
  capacitySeated: z.string().optional(),
  capacityStanding: z.string().optional(),
  priceRange: z.string().optional(),
  venueType: z.string().optional(),
  contactEmail: z.string().email("Neplatný email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().optional(),
  videoUrl: z.string().optional(),
})

type VenueFormData = z.infer<typeof venueFormSchema>

const AMENITIES_OPTIONS = [
  "WiFi",
  "Parkování",
  "Klimatizace",
  "Multimediální vybavení",
  "Catering možnosti",
  "Bar",
  "Terasa",
  "Výtah",
  "Bezbariérový přístup",
  "Zvuková technika",
  "Scéna/pódium",
  "Projektory",
  "Bezpečnostní systém",
  "Šatna",
  "Kuchyně"
]

function isValidYouTubeUrl(url: string): boolean {
  if (!url) return true // Optional field
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
  ]
  return patterns.some(pattern => pattern.test(url))
}

export default function AddVenuePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueFormSchema),
  })

  const videoUrl = watch("videoUrl")
  const isYouTubeUrlValid = isValidYouTubeUrl(videoUrl || "")

  // Check authentication and authorization
  if (status === "loading") {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-body text-gray-600">Načítání...</p>
      </div>
    </div>
  }

  if (!session) {
    router.push("/prihlaseni")
    return null
  }

  if (session.user.role !== "venue_manager" && session.user.role !== "admin") {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-title-1 text-black mb-4">Nedostatečná oprávnění</h1>
        <p className="text-body text-gray-600 mb-4">
          Pro přidání prostoru musíte mít roli správce prostorů.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Zpět na dashboard
        </Button>
      </div>
    </div>
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (images.length + files.length > 10) {
      alert("Můžete nahrát maximálně 10 obrázků")
      return
    }

    // Check file sizes (max 5MB per image)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert("Některé obrázky jsou větší než 5MB. Zmenšete je prosím.")
      return
    }

    // Check file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      alert("Můžete nahrávat pouze obrázky")
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file))
    setImageUrls(prev => [...prev, ...newUrls])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index])
    
    setImages(newImages)
    setImageUrls(newUrls)
  }

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert image to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

    try {
      // Convert images to base64 for storage
      // In production, you'd want to upload to a proper image service
      const base64Images = await Promise.all(
        images.map(file => convertImageToBase64(file))
      )
      return base64Images
    } catch (error) {
      console.error('Error converting images:', error)
      // Fallback to placeholder URLs
      return images.map((_, index) => 
        `https://images.unsplash.com/photo-${Date.now() + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
      )
    }
  }

  const onSubmit = async (data: VenueFormData) => {
    if (data.videoUrl && !isYouTubeUrlValid) {
      alert("Zadejte prosím platnou YouTube URL")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages()

      // Prepare data for API
      const venueData = {
        ...data,
        capacitySeated: data.capacitySeated ? parseInt(data.capacitySeated) : undefined,
        capacityStanding: data.capacityStanding ? parseInt(data.capacityStanding) : undefined,
        amenities,
        images: uploadedImageUrls,
      }

      const response = await fetch("/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      })

      const result = await response.json()

      if (response.ok) {
        // Show success message before redirect
        alert("Prostor byl úspěšně vytvořen!")
        router.push(`/prostory/${result.venue.slug}`)
      } else {
        throw new Error(result.error || "Chyba při vytváření prostoru")
      }
    } catch (error) {
      console.error("Error creating venue:", error)
      alert("Došlo k chybě při vytváření prostoru. Zkuste to prosím znovu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-title-1 text-black mb-2">Přidat nový prostor</h1>
          <p className="text-body text-gray-600">
            Vyplňte informace o vašem event prostoru. Všechna pole označená * jsou povinná.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Základní informace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Název prostoru *
                </label>
                <Input
                  {...register("name")}
                  placeholder="Název vašeho prostoru"
                />
                {errors.name && (
                  <p className="text-caption text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Popis prostoru
                </label>
                <Textarea
                  {...register("description")}
                  placeholder="Popište váš prostor, jeho atmosféru a možnosti využití..."
                  rows={4}
                />
                <p className="text-caption text-gray-500 mt-1">
                  Dobrý popis pomůže klientům lépe pochopit, zda je váš prostor vhodný pro jejich akci.
                </p>
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Adresa *
                </label>
                <Input
                  {...register("address")}
                  placeholder="Ulice číslo, Praha"
                />
                {errors.address && (
                  <p className="text-caption text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Typ prostoru
                </label>
                <Select {...register("venueType")}>
                  <option value="">Vyberte typ prostoru</option>
                  {Object.entries(VENUE_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kapacita a ceny
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-callout font-medium text-black mb-2">
                    Kapacita (sedící)
                  </label>
                  <Input
                    type="number"
                    {...register("capacitySeated")}
                    placeholder="50"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-callout font-medium text-black mb-2">
                    Kapacita (stojící)
                  </label>
                  <Input
                    type="number"
                    {...register("capacityStanding")}
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Cenové rozpětí
                </label>
                <Input
                  {...register("priceRange")}
                  placeholder="např. 10000-50000 Kč/den"
                />
                <p className="text-caption text-gray-500 mt-1">
                  Uveďte orientační cenové rozpětí pro váš prostor
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Vybavení a služby
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-gray-600 mb-4">
                Vyberte vybavení a služby, které váš prostor nabízí:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      amenities.includes(amenity)
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="sr-only"
                    />
                    <span className="text-callout">{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Kontaktní informace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-callout font-medium text-black mb-2">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    {...register("contactEmail")}
                    placeholder="info@prostor.cz"
                  />
                  {errors.contactEmail && (
                    <p className="text-caption text-red-600 mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-callout font-medium text-black mb-2">
                    Telefon
                  </label>
                  <Input
                    type="tel"
                    {...register("contactPhone")}
                    placeholder="+420 123 456 789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  Webové stránky
                </label>
                <Input
                  type="url"
                  {...register("websiteUrl")}
                  placeholder="https://www.prostor.cz"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Fotografie (max. 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={images.length >= 10}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-body text-gray-600">
                      {images.length >= 10 
                        ? "Dosáhli jste maximálního počtu obrázků (10)"
                        : "Klikněte pro výběr obrázků nebo je přetáhněte sem"
                      }
                    </p>
                    <p className="text-caption text-gray-500 mt-1">
                      Maximální velikost: 5MB na obrázek • Podporované formáty: JPG, PNG, WEBP
                    </p>
                  </label>
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-callout font-medium text-black">
                      Náhled obrázků ({imageUrls.length}/10):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            aria-label={`Odstranit obrázek ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video (YouTube)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-callout font-medium text-black mb-2">
                  YouTube URL
                </label>
                <div className="relative">
                  <Input
                    {...register("videoUrl")}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {videoUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isYouTubeUrlValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-caption text-gray-500 mt-1">
                  Přidejte YouTube video pro lepší prezentaci vašeho prostoru. 
                  Podporované formáty: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                </p>
                {videoUrl && !isYouTubeUrlValid && (
                  <p className="text-caption text-red-600 mt-1">
                    Neplatná YouTube URL. Zkontrolujte prosím formát.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Zrušit
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Vytvářím prostor..." : "Vytvořit prostor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 