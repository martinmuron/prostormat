"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StripeCheckout } from "@/components/payment/stripe-checkout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VENUE_TYPES, LOCATION_OPTIONS } from "@/types"
import { 
  Upload, 
  X, 
  MapPin, 
  Users, 
  Palette, 
  Phone, 
  Video,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowLeft
} from "lucide-react"

// Form input types (before validation)
interface VenueFormInputs {
  userName?: string
  userEmail?: string
  userPassword?: string
  userPhone?: string
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
  instagramUrl?: string
  videoUrl?: string
  musicAfter10: boolean
}

// Create dynamic schema based on auth status
const createVenueFormSchema = (isLoggedIn: boolean) => z.object({
  // Account fields - conditional validation
  userName: isLoggedIn ? z.string().optional() : z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  userEmail: isLoggedIn ? z.string().optional() : z.string().email("Neplatný email"),
  userPassword: isLoggedIn ? z.string().optional() : z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  userPhone: isLoggedIn ? z.string().optional() : z.string().min(1, "Telefonní číslo je povinné"),

  // Venue fields
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().min(10, "Popis musí mít alespoň 10 znaků"),
  address: z.string().min(5, "Adresa musí mít alespoň 5 znaků"),
  district: z.string().min(1, "Městská část je povinná"),
  capacitySeated: z.string().min(1, "Kapacita sedící je povinná").refine((val) => parseInt(val, 10) > 0, "Kapacita musí být větší než 0"),
  capacityStanding: z.string().min(1, "Kapacita stojící je povinná").refine((val) => parseInt(val, 10) > 0, "Kapacita musí být větší než 0"),
  venueType: z.string().min(1, "Typ prostoru je povinný"),
  contactEmail: z.string().email("Neplatný email"),
  contactPhone: z.string().min(1, "Kontaktní telefon je povinný"),
  websiteUrl: z.string().min(1, "Webové stránky jsou povinné"),
  instagramUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  musicAfter10: z.boolean(),
})

type VenueFormData = z.infer<ReturnType<typeof createVenueFormSchema>>

// Payment data interface (processed form data with images and amenities)
interface PaymentData {
  userName?: string | null
  userEmail?: string | null
  userPassword?: string
  userPhone?: string
  userId?: string
  name: string
  description: string
  address: string
  district: string
  capacitySeated: number
  capacityStanding: number
  venueType: string
  contactEmail: string
  contactPhone: string
  websiteUrl: string
  instagramUrl?: string
  videoUrl?: string
  musicAfter10: boolean
  amenities: string[]
  images: string[]
  mode: 'new' | 'claim'
  existingVenueId?: string | null
  existingVenueName?: string | null
  existingVenueSlug?: string | null
  existingManagerEmail?: string | null
}

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

function isValidYouTubeUrl(url: string): boolean {
  if (!url) return true // Optional field
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
  ]
  return patterns.some(pattern => pattern.test(url))
}

type FormStep = 'form' | 'payment' | 'success'

export default function AddVenuePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState<FormStep>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [formData, setFormData] = useState<PaymentData | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [submissionMode, setSubmissionMode] = useState<'new' | 'claim'>('new')
  const [claimInfo, setClaimInfo] = useState<{
    id: string
    name: string
    slug: string
    status: string
    manager?: {
      id: string
      name: string | null
      email: string | null
    }
  } | null>(null)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState<{
    validatedData: VenueFormData
    existingVenueMatch: typeof claimInfo
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VenueFormInputs>({
    resolver: zodResolver(createVenueFormSchema(isLoggedIn)),
    defaultValues: {
      musicAfter10: false,
    },
  })

  // Check authentication status and pre-fill user data
  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      setIsLoggedIn(true)
      // Pre-fill user data
      if (session.user.name) setValue('userName', session.user.name)
      if (session.user.email) setValue('userEmail', session.user.email)
      // Phone is not available in session, will be handled in form data preparation
    }
  }, [session, status, setValue])

  const videoUrl = watch("videoUrl")
  const musicAfter10 = watch("musicAfter10")
  const isYouTubeUrlValid = isValidYouTubeUrl(videoUrl || "")

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

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

    try {
      // Generate temporary venue ID for image upload
      const tempVenueId = `temp-${Date.now()}`

      // Upload images to Supabase
      const { uploadVenueImages } = await import('@/lib/supabase-storage')
      const uploadedUrls = await uploadVenueImages(images, tempVenueId)
      return uploadedUrls
    } catch (error) {
      console.error('Error uploading images:', error)
      throw new Error('Nepodařilo se nahrát obrázky. Zkuste to prosím znovu.')
    }
  }

  const checkExistingVenue = async (name: string, address: string) => {
    try {
      const response = await fetch('/api/venues/check-existing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, address }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.exists && data.venue) {
          return { mode: 'claim' as const, existingVenueMatch: data.venue }
        }
      } else {
        console.warn('Failed to verify existing venues for claim flow')
      }
    } catch (error) {
      console.error('Error checking for existing venue:', error)
    }

    return { mode: 'new' as const, existingVenueMatch: null }
  }

  const proceedToPayment = async (
    validatedData: VenueFormData,
    mode: 'new' | 'claim',
    existingVenueMatch: typeof claimInfo
  ) => {
    try {
      const uploadedImageUrls = await uploadImages()

      const submitData: PaymentData = {
        userName: isLoggedIn ? session?.user?.name : validatedData.userName,
        userEmail: isLoggedIn ? session?.user?.email : validatedData.userEmail,
        userPassword: isLoggedIn ? undefined : validatedData.userPassword,
        userPhone: validatedData.userPhone,
        userId: isLoggedIn ? session?.user?.id : undefined,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        district: validatedData.district,
        capacitySeated: parseInt(validatedData.capacitySeated, 10),
        capacityStanding: parseInt(validatedData.capacityStanding, 10),
        venueType: validatedData.venueType,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        websiteUrl: validatedData.websiteUrl,
        instagramUrl: validatedData.instagramUrl,
        videoUrl: validatedData.videoUrl,
        musicAfter10: validatedData.musicAfter10,
        amenities,
        images: uploadedImageUrls,
        mode,
        existingVenueId: existingVenueMatch?.id ?? null,
        existingVenueName: existingVenueMatch?.name ?? null,
        existingVenueSlug: existingVenueMatch?.slug ?? null,
        existingManagerEmail: existingVenueMatch?.manager?.email ?? null,
      }

      setSubmissionMode(mode)
      setClaimInfo(existingVenueMatch)
      setFormData(submitData)
      setCurrentStep('payment')
    } catch (error) {
      console.error('Error preparing venue data:', error)
      alert('Došlo k chybě při přípravě dat. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClaimCancel = () => {
    setShowClaimDialog(false)
    setPendingSubmission(null)
    setSubmissionMode('new')
    setClaimInfo(null)
  }

  const handleClaimConfirm = async () => {
    if (!pendingSubmission) return

    const { validatedData, existingVenueMatch } = pendingSubmission
    setShowClaimDialog(false)
    setPendingSubmission(null)
    setIsSubmitting(true)
    await proceedToPayment(validatedData, 'claim', existingVenueMatch)
  }

  const onSubmit = async (data: VenueFormInputs) => {
    if (data.videoUrl && !isYouTubeUrlValid) {
      alert("Zadejte prosím platnou YouTube URL")
      return
    }

    setIsSubmitting(true)

    try {
      const validatedData = createVenueFormSchema(isLoggedIn).parse(data)

      const { mode, existingVenueMatch } = await checkExistingVenue(
        validatedData.name,
        validatedData.address
      )

      if (mode === 'claim' && existingVenueMatch) {
        setSubmissionMode('claim')
        setClaimInfo(existingVenueMatch)
        setPendingSubmission({ validatedData, existingVenueMatch })
        setShowClaimDialog(true)
        setIsSubmitting(false)
        return
      }

      await proceedToPayment(validatedData, 'new', null)
    } catch (error) {
      console.error("Error preparing venue data:", error)
      alert("Došlo k chybě při přípravě dat. Zkuste to prosím znovu.")
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    setCurrentStep('success')
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  const goBackToForm = () => {
    setCurrentStep('form')
    setPaymentError(null)
  }

  // Success step
  if (currentStep === 'success') {
    const isClaimSubmission = formData?.mode === 'claim'
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">
              {isClaimSubmission ? 'Žádost o převzetí byla odeslána!' : 'Platba úspěšně dokončena!'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isClaimSubmission
                ? `Děkujeme za platbu. Vaše žádost o převzetí listingu "${formData?.name}" čeká na potvrzení administrátorem.`
                : `Děkujeme za platbu. Váš prostor "${formData?.name}" byl přidán a čeká na schválení administrátorem.`}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Co se stane dále?</h3>
              {isClaimSubmission ? (
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>✅ Váš účet byl úspěšně vytvořen (nebo aktualizován)</li>
                  <li>⏳ Tým Prostormat potvrdí, že jste oprávněný správce listingu</li>
                  <li>📧 Po schválení vám odešleme potvrzení emailem</li>
                  <li>🛠️ Následně získáte plnou správu existujícího profilu</li>
                  <li>🎯 Poté můžete prostor upravovat a přijímat rezervace</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>✅ Váš účet byl úspěšně vytvořen</li>
                  <li>⏳ Prostor nyní čeká na schválení</li>
                  <li>📧 Po schválení vám zašleme emailové oznámení</li>
                  <li>✏️ Po přihlášení můžete prostor ihned upravovat v administraci</li>
                  <li>🎯 Poté můžete začít přijímat rezervace</li>
                </ul>
              )}
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/prihlaseni')}
                className="w-full"
              >
                Přihlásit se do účtu
              </Button>
              {isClaimSubmission && formData?.existingVenueSlug && (
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/prostory/${formData.existingVenueSlug}`)}
                  className="w-full"
                >
                  Zobrazit existující listing
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Návrat na hlavní stránku
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Payment step
  if (currentStep === 'payment' && formData) {
    const isClaimSubmission = formData.mode === 'claim'
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-6">
            <button
              onClick={goBackToForm}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět k formuláři
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              Dokončit platbu
            </h1>
            <p className="text-gray-600">
              {isClaimSubmission
                ? `Platba 12,000 CZK odešle žádost o převzetí listingu "${formData.name}".`
                : `Dokončete platbu 12,000 CZK pro přidání prostoru "${formData.name}" na platformu.`}
            </p>
          </div>

          {isClaimSubmission && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 space-y-1">
                  <p className="font-semibold">Našli jsme shodný prostor na Prostormatu.</p>
                  <p>
                    Po zaplacení vytvoříme žádost o převzetí listingu a náš tým ji zkontroluje.
                    Jakmile bude schválena, získáte plnou správu existujícího profilu.
                  </p>
                  {formData.existingManagerEmail && (
                    <p className="text-xs">
                      Aktuální správce listingu: {formData.existingManagerEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Chyba při platbě</h3>
                  <p className="text-sm text-red-800">{paymentError}</p>
                </div>
              </div>
            </div>
          )}

          <StripeCheckout
            venueData={formData}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      </div>
    )
  }

  // Form step
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-title-1 text-black mb-3 sm:mb-2 leading-tight">
            Přidat prostor na Prostormat
          </h1>
          <p className="text-base sm:text-body text-gray-600 leading-relaxed">
            Vytvořte si účet a přidejte svůj event prostor. Staňte se součástí největší platformy 
            pro event prostory v Praze a začněte přijímat rezervace ještě dnes.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mt-4">
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-callout text-orange-800 font-medium mb-1">
                  Poplatek za přidání prostoru: 12,000 CZK
                </p>
                <p className="text-sm text-orange-700">
                  Po vyplnění formuláře budete přesměrováni na bezpečnou platbu kartou.
                </p>
              </div>
            </div>
          </div>
          {claimInfo && submissionMode === 'claim' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm sm:text-callout text-yellow-800 font-medium mb-1">
                    Prostor &quot;{claimInfo.name}&quot; již na platformě máme.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Pokračováním odešlete žádost o převzetí existujícího listingu. Po schválení vám prostor přiřadíme k úpravám.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Prostor už na Prostormatu máme</DialogTitle>
                <DialogDescription>
                  Zdá se, že prostor „{claimInfo?.name}“ už existuje v našem katalogu. Pokud jste jeho
                  správce, můžete požádat o převzetí listingu a pokračovat k platbě.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900">Co se stane po zaplacení?</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Žádost ověří náš tým a potvrdí, že jste oprávněný správce.</li>
                  <li>Po schválení vám přiřadíme správu existujícího listingu.</li>
                  <li>Následně můžete upravit fotografie, popis i kontaktní údaje.</li>
                </ul>
              </div>
              <DialogFooter className="sm:justify-end">
                <Button type="button" variant="outline" onClick={handleClaimCancel}>
                  Upravit údaje
                </Button>
                <Button type="button" onClick={handleClaimConfirm} disabled={isSubmitting}>
                  Pokračovat k platbě
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Account Creation - Only show if not logged in */}
          {!isLoggedIn && (
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 flex-shrink-0" />
                Vytvořit účet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-4 pt-0">
              <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Vaše jméno *
                  </label>
                  <Input
                    {...register("userName")}
                    placeholder="Jan Novák"
                    className="h-11 sm:h-12"
                  />
                  {errors.userName && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.userName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                    Váš telefon *
                  </label>
                  <Input
                    type="tel"
                    {...register("userPhone")}
                    placeholder="+420 123 456 789"
                    className="h-11 sm:h-12"
                  />
                  {errors.userPhone && (
                    <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.userPhone.message}</p>
                  )}
                  <p className="text-xs sm:text-caption text-gray-500 mt-1">
                    Toto číslo není zobrazeno ve veřejném profilu - používáme ho pouze pro komunikaci s vámi
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Váš e-mail *
                </label>
                <Input
                  type="email"
                  {...register("userEmail")}
                  placeholder="jan@email.cz"
                  className="h-11 sm:h-12"
                />
                {errors.userEmail && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.userEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  Heslo *
                </label>
                <Input
                  type="password"
                  {...register("userPassword")}
                  placeholder="Minimálně 6 znaků"
                  className="h-11 sm:h-12"
                />
                {errors.userPassword && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.userPassword.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Logged in user info */}
          {isLoggedIn && (
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  Přihlášený uživatel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">
                        Jste přihlášeni jako: {session?.user?.name || session?.user?.email}
                      </p>
                      <p className="text-sm text-green-800">
                        Prostor bude přiřazen k vašemu účtu. Nemusíte vyplňovat účtové údaje.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  placeholder="Název vašeho prostoru"
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
                  placeholder="Popište váš prostor, jeho atmosféru a možnosti využití..."
                  rows={4}
                  className="min-h-[88px] sm:min-h-[96px] resize-y"
                />
                {errors.description && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">{errors.description.message}</p>
                )}
                <p className="text-xs sm:text-caption text-gray-500 mt-1">
                  Dobrý popis pomůže klientům lépe pochopit, zda je váš prostor vhodný pro jejich akci.
                </p>
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
                    {LOCATION_OPTIONS.map((district) => (
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
                <Palette className="h-5 w-5 flex-shrink-0" />
                Vybavení a služby
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-body text-gray-600 mb-4">
                Vyberte vybavení a služby, které váš prostor nabízí:
              </p>
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
                <Palette className="h-5 w-5 flex-shrink-0" />
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
                <p className="text-xs sm:text-caption text-gray-500 mt-1">
                  Instagram odkaz bude zobrazen ve veřejném profilu vašeho prostoru
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Upload className="h-5 w-5 flex-shrink-0" />
                Fotografie (max. 10)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center min-h-[120px] sm:min-h-[140px] flex items-center justify-center">
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
                    className={`cursor-pointer w-full ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm sm:text-body text-gray-600 mb-1">
                      {images.length >= 10 
                        ? "Dosáhli jste maximálního počtu obrázků (10)"
                        : "Klikněte pro výběr obrázků"
                      }
                    </p>
                    <p className="text-xs sm:text-caption text-gray-500">
                      Max. 5MB na obrázek • JPG, PNG, WEBP
                    </p>
                  </label>
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm sm:text-callout font-medium text-black">
                      Náhled obrázků ({imageUrls.length}/10):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={url}
                            alt={`Náhled obrázku ${index + 1}`}
                            width={400}
                            height={300}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors min-h-[28px] min-w-[28px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center"
                            aria-label={`Odstranit obrázek ${index + 1}`}
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
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
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Video className="h-5 w-5 flex-shrink-0" />
                Video (YouTube)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <label className="block text-sm sm:text-callout font-medium text-black mb-2">
                  YouTube URL
                </label>
                <div className="relative">
                  <Input
                    {...register("videoUrl")}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="h-11 sm:h-12 pr-10"
                  />
                  {videoUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isYouTubeUrlValid ? (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-caption text-gray-500 mt-1 leading-relaxed">
                  Přidejte YouTube video pro lepší prezentaci vašeho prostoru. 
                  Podporované formáty: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
                </p>
                {videoUrl && !isYouTubeUrlValid && (
                  <p className="text-xs sm:text-caption text-red-600 mt-1">
                    Neplatná YouTube URL. Zkontrolujte prosím formát.
                  </p>
                )}
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
              {isSubmitting ? "Připravuji platbu..." : "Pokračovat k platbě (12,000 CZK)"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 
