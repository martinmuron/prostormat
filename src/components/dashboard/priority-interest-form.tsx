"use client"

import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createTrackingContext } from "@/lib/tracking-utils"
import { trackGA4VenueLead } from "@/lib/ga4-tracking"
import { CheckCircle, Loader2 } from "lucide-react"

const prioritySchema = z.object({
  venueId: z.string().optional(),
  packageType: z.enum(["priority", "top_priority"], {
    errorMap: () => ({ message: "Vyberte balíček" })
  }),
  contactName: z.string().min(2, "Jméno je povinné"),
  contactEmail: z.string().email("Neplatný email"),
  contactPhone: z.string().min(5, "Telefon je povinný"),
  companyName: z.string().optional(),
  additionalInfo: z.string().max(2000, "Zpráva je příliš dlouhá").optional(),
})

type PriorityFormValues = z.infer<typeof prioritySchema>

type VenueOption = {
  id: string
  name: string
  status: string
  slug: string
  priority: number | null
  prioritySource: string | null
  paid: boolean
}

interface PriorityInterestFormProps {
  venues: VenueOption[]
  defaultContact: {
    name: string
    email: string
    phone: string
    company: string
  }
}

export function PriorityInterestForm({ venues, defaultContact }: PriorityInterestFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PriorityFormValues>({
    resolver: zodResolver(prioritySchema),
    defaultValues: {
      venueId: venues.length === 1 ? venues[0].id : undefined,
      packageType: "priority",
      contactName: defaultContact.name,
      contactEmail: defaultContact.email,
      contactPhone: defaultContact.phone,
      companyName: defaultContact.company,
      additionalInfo: "",
    },
  })

  const onSubmit = useCallback(async (values: PriorityFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const tracking = typeof window !== "undefined" ? createTrackingContext() : undefined

      const selectedVenue = values.venueId ? venues.find((venue) => venue.id === values.venueId) : null

      const response = await fetch('/api/venue-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'priority_interest',
          packageType: values.packageType,
          venueId: values.venueId,
          venueName: selectedVenue?.name,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          companyName: values.companyName,
          additionalInfo: values.additionalInfo,
          tracking,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Došlo k chybě při odesílání žádosti.')
      }

      trackGA4VenueLead({
        submissionType: 'priority_interest',
        venueName: selectedVenue?.name,
        packageType: values.packageType,
        tracking,
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit priority interest:', error)
      setSubmitError(error instanceof Error ? error.message : 'Došlo k chybě při odesílání žádosti.')
    } finally {
      setIsSubmitting(false)
    }
  }, [venues])

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">Žádost o Priority odeslána</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-green-900">
          <p>Obdrželi jsme vaši žádost. Ozveme se vám do 48 hodin s přehledem možností a domluvíme další postup.</p>
          <p className="text-sm text-green-800">Děkujeme, že chcete zvýšit viditelnost svého prostoru na Prostormatu.</p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>Odeslat další žádost</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Žádost o Priority / Top Priority</CardTitle>
        <p className="mt-2 text-sm text-gray-600">
          Vyplňte údaje a náš tým se vám ozve s dostupností a dalším postupem. Aktivaci provádíme ručně, abychom zajistili férové pořadí ve vyhledávání.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vyberte prostor</label>
              <Select value={watch('venueId') ?? ''} onValueChange={(value) => setValue('venueId', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder={venues.length ? 'Zvolit prostor' : 'Zatím nemáte prostor'} />
                </SelectTrigger>
                <SelectContent>
                  {venues.length > 0 ? (
                    <>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="">
                        Jiný prostor (uvedu v poznámce)
                      </SelectItem>
                    </>
                  ) : (
                    <SelectItem value="">Nemám zatím prostor</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balíček *</label>
              <Select value={watch('packageType')} onValueChange={(value) => setValue('packageType', value as PriorityFormValues['packageType'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority – přednostní pozice ve vyhledávání</SelectItem>
                  <SelectItem value="top_priority">Top Priority – homepage + top výsledky (limit 12)</SelectItem>
                </SelectContent>
              </Select>
              {errors.packageType && <p className="mt-1 text-xs text-red-600">{errors.packageType.message}</p>}
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktní osoba *</label>
                <Input {...register('contactName')} placeholder="Jméno a příjmení" />
                {errors.contactName && <p className="mt-1 text-xs text-red-600">{errors.contactName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <Input {...register('contactEmail')} placeholder="kontakt@společnost.cz" />
                {errors.contactEmail && <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                <Input {...register('contactPhone')} placeholder="+420 123 456 789" />
                {errors.contactPhone && <p className="mt-1 text-xs text-red-600">{errors.contactPhone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Společnost</label>
                <Input {...register('companyName')} placeholder="Název společnosti" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka</label>
              <Textarea rows={4} placeholder="Např. od kdy potřebujete priority, informace o marketingu, atd." {...register('additionalInfo')} />
              {errors.additionalInfo && <p className="mt-1 text-xs text-red-600">{errors.additionalInfo.message}</p>}
            </div>

            {submitError && (
              <Alert variant="destructive">
                <AlertTitle>Odeslání se nezdařilo</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Odesíláme…
                </span>
              ) : (
                'Odeslat žádost'
              )}
            </Button>
        </form>
      </CardContent>
    </Card>
  )
}
