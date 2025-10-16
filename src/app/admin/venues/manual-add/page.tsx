"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VENUE_TYPES } from "@/types"
import { toast } from "sonner"
import {
  MapPin,
  Users,
  Phone,
  Calendar,
  CreditCard,
  User,
  ArrowLeft
} from "lucide-react"

const DEFAULT_MANAGER_EMAIL = "info@prostormat.cz"

const manualVenueSchema = z.object({
  // User selection
  userId: z.string().min(1, "Vyberte uživatele"),

  // Venue fields
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().min(10, "Popis musí mít alespoň 10 znaků"),
  address: z.string().min(5, "Adresa musí mít alespoň 5 znaků"),
  district: z.string().min(1, "Městská část je povinná"),
  capacitySeated: z.string().min(1, "Kapacita sedící je povinná"),
  capacityStanding: z.string().min(1, "Kapacita stojící je povinná"),
  venueType: z.string().min(1, "Typ prostoru je povinný"),
  contactEmail: z.string().email("Neplatný email"),
  contactPhone: z.string().min(1, "Kontaktní telefon je povinný"),
  websiteUrl: z.string().min(1, "Webové stránky jsou povinné"),
  instagramUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  musicAfter10: z.boolean(),

  // Payment info
  paymentDate: z.string().min(1, "Datum platby je povinné"),
  paymentAmount: z.string().min(1, "Částka je povinná"),
  paymentNote: z.string().optional(),
})

type ManualVenueFormData = z.infer<typeof manualVenueSchema>

const AMENITIES_OPTIONS = [
  "WiFi",
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

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
}

export default function ManualAddVenuePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amenities, setAmenities] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<ManualVenueFormData>({
    resolver: zodResolver(manualVenueSchema),
    defaultValues: {
      paymentAmount: "12000",
      paymentDate: new Date().toISOString().split('T')[0],
      musicAfter10: false,
    }
  })

  const musicAfter10 = watch("musicAfter10")

  const loadUsers = React.useCallback(async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        const fetchedUsers: User[] = data.users || []
        setUsers(fetchedUsers)

        if (!getValues('userId')) {
          const defaultManager = fetchedUsers.find(
            (user) => user.email.toLowerCase() === DEFAULT_MANAGER_EMAIL
          )

          if (defaultManager) {
            setValue('userId', defaultManager.id, { shouldDirty: false })
          }
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Nepodařilo se načíst uživatele')
    } finally {
      setLoadingUsers(false)
    }
  }, [getValues, setValue])

  React.useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const onSubmit = async (data: ManualVenueFormData) => {
    setIsSubmitting(true)

    try {
      const submitData = {
        ...data,
        capacitySeated: parseInt(data.capacitySeated, 10),
        capacityStanding: parseInt(data.capacityStanding, 10),
        musicAfter10: data.musicAfter10,
        amenities,
        paymentAmount: parseInt(data.paymentAmount, 10),
      }

      const response = await fetch('/api/admin/venues/manual-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nepodařilo se vytvořit prostor')
      }

      await response.json()
      toast.success('Prostor byl úspěšně vytvořen')
      router.push('/admin/venues')
    } catch (error) {
      console.error("Error creating venue:", error)
      toast.error(error instanceof Error ? error.message : 'Nepodařilo se vytvořit prostor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět na správu prostorů
          </button>
          <h1 className="text-2xl sm:text-title-1 text-black mb-3 sm:mb-2 leading-tight">
            Přidat prostor manuálně
          </h1>
          <p className="text-base sm:text-body text-gray-600 leading-relaxed">
            Vytvořte prostor pro existujícího uživatele s manuální platbou.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* User Selection */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5 flex-shrink-0" />
                Vybrat uživatele
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Uživatel *
                </label>
                <Select
                  onValueChange={(value) => setValue("userId", value, { shouldDirty: true })}
                  value={watch("userId") || undefined}
                >
                  <SelectTrigger className="h-11 sm:h-12">
                    <SelectValue placeholder={loadingUsers ? "Načítání uživatelů..." : "Vyberte uživatele"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || 'Bez jména'} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.userId && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.userId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="h-5 w-5 flex-shrink-0" />
                Informace o platbě
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Datum platby *
                  </label>
                  <Input
                    type="date"
                    {...register("paymentDate")}
                    className="h-11 sm:h-12"
                  />
                  {errors.paymentDate && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.paymentDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Částka (CZK) *
                  </label>
                  <Input
                    type="number"
                    {...register("paymentAmount")}
                    placeholder="12000"
                    className="h-11 sm:h-12"
                  />
                  {errors.paymentAmount && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.paymentAmount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Poznámka k platbě
                </label>
                <Textarea
                  {...register("paymentNote")}
                  placeholder="Např. platba v hotovosti, bankovní převod, atd."
                  rows={2}
                  className="min-h-[60px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                Základní informace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Název prostoru *
                </label>
                <Input
                  {...register("name")}
                  placeholder="Název prostoru"
                  className="h-11 sm:h-12"
                />
                {errors.name && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Popis prostoru *
                </label>
                <Textarea
                  {...register("description")}
                  placeholder="Popište prostor, jeho atmosféru a možnosti využití..."
                  rows={4}
                  className="min-h-[88px] sm:min-h-[96px] resize-y"
                />
                {errors.description && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Adresa *
                </label>
                <Input
                  {...register("address")}
                  placeholder="Ulice číslo, Praha"
                  className="h-11 sm:h-12"
                />
                {errors.address && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Městská část *
                </label>
                <Select onValueChange={(value) => setValue("district", value)} defaultValue="">
                  <SelectTrigger className="h-11 sm:h-12">
                    <SelectValue placeholder="Vyberte městskou část" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Praha 1', 'Praha 2', 'Praha 3', 'Praha 4', 'Praha 5', 'Praha 6', 'Praha 7', 'Praha 8', 'Praha 9', 'Praha 10', 'Praha 11', 'Praha 12', 'Praha 13', 'Praha 14', 'Praha 15'].map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Typ prostoru *
                </label>
                <Select onValueChange={(value) => setValue("venueType", value)} defaultValue="">
                  <SelectTrigger className="h-11 sm:h-12">
                    <SelectValue placeholder="Vyberte typ prostoru" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VENUE_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.venueType && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.venueType.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capacity */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 flex-shrink-0" />
                Kapacita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Kapacita (sedící) *
                  </label>
                  <Input
                    type="number"
                    {...register("capacitySeated")}
                    placeholder="50"
                    min="1"
                    className="h-11 sm:h-12"
                  />
                  {errors.capacitySeated && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.capacitySeated.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Kapacita (stojící) *
                  </label>
                  <Input
                    type="number"
                    {...register("capacityStanding")}
                    placeholder="100"
                    min="1"
                    className="h-11 sm:h-12"
                  />
                  {errors.capacityStanding && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.capacityStanding.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                Vybavení a služby
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-3 sm:p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px] sm:min-h-[48px] ${
                      amenities.includes(amenity)
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 active:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="sr-only"
                    />
                    <span className="text-sm sm:text-callout leading-tight">{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Music Hours */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                Provozní omezení
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-3">
                  Může se u vás hrát hudba po 22:00? *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:border-gray-300">
                    <input
                      type="radio"
                      {...register("musicAfter10")}
                      value="true"
                      onChange={() => setValue("musicAfter10", true)}
                      checked={musicAfter10 === true}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <span className="text-sm sm:text-callout">Ano, hudba je povolena i po 22:00</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:border-gray-300">
                    <input
                      type="radio"
                      {...register("musicAfter10")}
                      value="false"
                      onChange={() => setValue("musicAfter10", false)}
                      checked={musicAfter10 === false}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <span className="text-sm sm:text-callout">Ne, hudba musí skončit do 22:00</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Phone className="h-5 w-5 flex-shrink-0" />
                Kontaktní informace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    E-mail *
                  </label>
                  <Input
                    type="email"
                    {...register("contactEmail")}
                    placeholder="info@prostor.cz"
                    className="h-11 sm:h-12"
                  />
                  {errors.contactEmail && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Telefon *
                  </label>
                  <Input
                    type="tel"
                    {...register("contactPhone")}
                    placeholder="+420 123 456 789"
                    className="h-11 sm:h-12"
                  />
                  {errors.contactPhone && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Webové stránky *
                </label>
                <Input
                  type="url"
                  {...register("websiteUrl")}
                  placeholder="https://www.prostor.cz"
                  className="h-11 sm:h-12"
                />
                {errors.websiteUrl && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.websiteUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Instagram
                </label>
                <Input
                  type="url"
                  {...register("instagramUrl")}
                  placeholder="https://www.instagram.com/vasucet"
                  className="h-11 sm:h-12"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  YouTube URL
                </label>
                <Input
                  {...register("videoUrl")}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-11 sm:h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1 min-h-[44px] sm:min-h-[48px]"
            >
              Zrušit
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 order-1 sm:order-2 min-h-[44px] sm:min-h-[48px]"
            >
              {isSubmitting ? "Vytváření prostoru..." : "Vytvořit prostor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
