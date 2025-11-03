"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, ClipboardList, Loader2, Mail, Phone, X } from "lucide-react"
import { createTrackingContext, type TrackingContext } from "@/lib/tracking-utils"
import { trackGA4VenueLead } from "@/lib/ga4-tracking"
import { fireGoogleAdsVenueSubmissionConversion } from "@/lib/google-ads"

const submissionSchema = z.object({
  companyName: z.string().min(2, "Název společnosti musí mít alespoň 2 znaky"),
  locationTitle: z.string().min(2, "Název prostoru musí mít alespoň 2 znaky"),
  ico: z.string().min(4, "IČO musí mít alespoň 4 znaky"),
  contactName: z.string().min(2, "Jméno je povinné"),
  contactPhone: z.string().min(5, "Telefon je povinný"),
  contactEmail: z.string().email("Neplatný email"),
  additionalInfo: z.string().max(2000, "Zpráva je příliš dlouhá").optional(),
})

type SubmissionFormValues = z.infer<typeof submissionSchema>

type SubmissionType = "new" | "claim" | "priority_interest"

type NameLookupStatus = "idle" | "checking" | "match" | "suggestions" | "none" | "error"

interface InlineVenueMatch {
  id: string
  name: string
  slug: string
  status: string
  manager?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

interface NameLookupResult {
  status: NameLookupStatus
  match: InlineVenueMatch | null
  suggestions: InlineVenueMatch[]
  error?: string
}

interface SubmissionState {
  type: SubmissionType
  venueName: string
}

function AddVenuePageInner() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()

  const venueSlugParam = searchParams?.get("venue") ?? null
  const inquiryIdParam = searchParams?.get("inquiry") ?? null
  const comingFromInquiry = Boolean(inquiryIdParam)

  const [claimInfo, setClaimInfo] = useState<InlineVenueMatch | null>(null)
  const [nameLookupResult, setNameLookupResult] = useState<NameLookupResult>({
    status: "idle",
    match: null,
    suggestions: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submissionState, setSubmissionState] = useState<SubmissionState | null>(null)

  const prefilledVenueName = useMemo(() => {
    if (claimInfo?.name) {
      return claimInfo.name
    }
    if (!venueSlugParam) {
      return null
    }
    try {
      const decoded = decodeURIComponent(venueSlugParam)
      const withSpaces = decoded.replace(/-/g, " ").trim()
      return withSpaces.length > 0 ? withSpaces : decoded
    } catch {
      const fallback = venueSlugParam.replace(/-/g, " ").trim()
      return fallback.length > 0 ? fallback : venueSlugParam
    }
  }, [claimInfo, venueSlugParam])

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      companyName: "",
      locationTitle: "",
      ico: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      additionalInfo: "",
    },
  })

  const watchedLocationTitle = watch("locationTitle")

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (session?.user?.email) {
      const currentContactEmail = (getValues("contactEmail") ?? "").trim()
      if (currentContactEmail.length === 0) {
        setValue("contactEmail", session.user.email)
      }
    }

    if (session?.user?.name) {
      const currentName = (getValues("contactName") ?? "").trim()
      if (currentName.length === 0) {
        setValue("contactName", session.user.name)
      }
    }
  }, [session, status, setValue, getValues])

  const selectClaim = useCallback((match: InlineVenueMatch) => {
    setClaimInfo(match)
    setSubmissionState(null)
  }, [])

  const clearClaim = useCallback(() => {
    setClaimInfo(null)
  }, [])

  const fetchClaimVenueSummary = useCallback(async (venueId: string) => {
    try {
      const response = await fetch(`/api/venues/claim-data/${venueId}`, { cache: "no-store" })
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (!data?.name) {
        return null
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        status: data.status,
        manager: data.manager ?? null,
      } satisfies InlineVenueMatch
    } catch (error) {
      console.error("Failed to load claim venue summary:", error)
      return null
    }
  }, [])

  const fetchClaimVenueSummaryBySlug = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/venues/claim-data/by-slug/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      })
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      if (!data?.id || !data?.name) {
        return null
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        status: data.status,
        manager: data.manager ?? null,
      } satisfies InlineVenueMatch
    } catch (error) {
      console.error("Failed to load claim venue summary by slug:", error)
      return null
    }
  }, [])

  const tryPreselectClaimVenue = useCallback(async () => {
    const claimIdParam = searchParams?.get("claimVenueId")
    const currentTitle = (getValues("locationTitle") ?? "").trim()

    if (claimIdParam && claimInfo && claimInfo.id === claimIdParam) {
      if (currentTitle.length === 0 && claimInfo.name) {
        setValue("locationTitle", claimInfo.name, { shouldValidate: true })
      }
      return
    }

    if (!claimIdParam && venueSlugParam && claimInfo && claimInfo.slug === venueSlugParam) {
      if (currentTitle.length === 0 && claimInfo.name) {
        setValue("locationTitle", claimInfo.name, { shouldValidate: true })
      }
      return
    }

    if (claimIdParam) {
      const summary = await fetchClaimVenueSummary(claimIdParam)
      if (summary) {
        if (!claimInfo || claimInfo.id !== summary.id) {
          setClaimInfo(summary)
        }
        if (currentTitle.length === 0) {
          setValue("locationTitle", summary.name, { shouldValidate: true })
        }
      }
      return
    }

    if (venueSlugParam) {
      const summary = await fetchClaimVenueSummaryBySlug(venueSlugParam)
      if (summary) {
        if (!claimInfo || claimInfo.id !== summary.id) {
          setClaimInfo(summary)
        }
        if (currentTitle.length === 0) {
          setValue("locationTitle", summary.name, { shouldValidate: true })
        }
      } else if (currentTitle.length === 0 && prefilledVenueName) {
        setValue("locationTitle", prefilledVenueName, { shouldValidate: true })
      }
    }
  }, [
    fetchClaimVenueSummary,
    fetchClaimVenueSummaryBySlug,
    getValues,
    claimInfo,
    prefilledVenueName,
    searchParams,
    setValue,
    venueSlugParam,
  ])

  useEffect(() => {
    void tryPreselectClaimVenue()
  }, [tryPreselectClaimVenue])

  useEffect(() => {
    const name = (watchedLocationTitle ?? "").trim()
    if (name.length < 2) {
      setNameLookupResult({ status: "idle", match: null, suggestions: [] })
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setNameLookupResult((prev) => ({ ...prev, status: "checking" }))

      try {
        const response = await fetch('/api/venues/check-existing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to verify venue name')
        }

        const data = await response.json()

        const suggestions: InlineVenueMatch[] = Array.isArray(data.suggestions)
          ? data.suggestions
          : []

        if (data.exists && data.venue) {
          setNameLookupResult({
            status: "match",
            match: data.venue as InlineVenueMatch,
            suggestions,
          })
        } else if (suggestions.length > 0) {
          setNameLookupResult({
            status: "suggestions",
            match: null,
            suggestions,
          })
        } else {
          setNameLookupResult({ status: "none", match: null, suggestions: [] })
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        console.error('Failed to lookup venue name:', error)
        setNameLookupResult({ status: "error", match: null, suggestions: [], error: 'Nepodařilo se ověřit existující prostory. Zkuste to prosím znovu.' })
      }
    }, 500)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [watchedLocationTitle])

  const currentSubmissionType: SubmissionType = claimInfo ? "claim" : "new"

  const onSubmit = useCallback(async (values: SubmissionFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const tracking: TrackingContext | undefined = typeof window !== "undefined" ? createTrackingContext() : undefined

      const payload = {
        submissionType: currentSubmissionType,
        companyName: values.companyName,
        locationTitle: values.locationTitle,
        ico: values.ico,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        additionalInfo: values.additionalInfo,
        existingVenueId: claimInfo?.id,
        venueId: claimInfo?.id,
        venueName: claimInfo?.name ?? values.locationTitle,
        tracking,
      }

      const response = await fetch('/api/venue-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Došlo k chybě při odesílání formuláře.')
      }

      trackGA4VenueLead({
        submissionType: currentSubmissionType,
        venueName: payload.venueName,
        tracking,
      })

      if (currentSubmissionType === 'claim' || currentSubmissionType === 'new') {
        fireGoogleAdsVenueSubmissionConversion()
      }

      setSubmissionState({
        type: currentSubmissionType,
        venueName: payload.venueName ?? values.locationTitle,
      })
    } catch (error) {
      console.error('Failed to submit venue request:', error)
      setSubmitError(error instanceof Error ? error.message : 'Došlo k chybě při odesílání formuláře.')
    } finally {
      setIsSubmitting(false)
    }
  }, [claimInfo, currentSubmissionType])

  const heading = useMemo(() => {
    if (submissionState?.type === 'claim') {
      return 'Žádost o převzetí listingu odeslána'
    }
    if (submissionState?.type === 'new') {
      return 'Žádost o přidání prostoru odeslána'
    }
    return 'Přidat prostor na Prostormat'
  }, [submissionState])

  if (submissionState) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">{heading}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-green-900">
              <p>
                Děkujeme! Vaši žádost jsme úspěšně přijali. Ozveme se vám do 24 hodin na uvedený kontakt s dalšími kroky. Prostor: <strong>{submissionState.venueName}</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">Přidat nebo převzít prostor</h1>
          <p className="text-base text-gray-600">
            Vyplňte krátký formulář a náš tým se vám do 24 hodin ozve ohledně zveřejnění listingu nebo převzetí existujícího profilu.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-[2fr,1fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" />
                Základní informace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {comingFromInquiry && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertTitle>Prostor zatím nemá aktivní správu</AlertTitle>
                    <AlertDescription>
                      {prefilledVenueName ? (
                        <span>
                          Poptávka je propojena s prostorem <strong>{prefilledVenueName}</strong>. Vyplňte formulář
                          níže a náš tým vám pomůže převzít listing.
                        </span>
                      ) : (
                        "Poptávka je propojena s vaším prostorem. Vyplňte formulář níže a náš tým vám pomůže převzít listing."
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Společnost (s.r.o. / provozovatel) *</label>
                    <Input placeholder="Název společnosti" {...register('companyName')} />
                    {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Název prostoru *</label>
                    <Input placeholder="Název, pod kterým je prostor vedený" {...register('locationTitle')} />
                    {errors.locationTitle && <p className="mt-1 text-xs text-red-600">{errors.locationTitle.message}</p>}
                    {nameLookupResult.status !== 'idle' && (
                      <div className="mt-3 space-y-3">
                        {nameLookupResult.status === 'checking' && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Ověřujeme, jestli už prostor existuje…
                          </div>
                        )}

                        {nameLookupResult.match && !claimInfo && (
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertTitle>Našli jsme shodný prostor</AlertTitle>
                            <AlertDescription>
                              <div className="mt-2 flex flex-col gap-2">
                                <div className="text-sm text-yellow-800">
                                  Zdá se, že prostor &quot;{nameLookupResult.match.name}&quot; už v Prostormatu existuje. Pokud jste jeho správcem, můžete požádat o převzetí listingu.
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => selectClaim(nameLookupResult.match!)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                  >
                                    Chci převzít listing
                                  </Button>
                                  <Link href={`/prostory/${nameLookupResult.match.slug}`} target="_blank" rel="noopener noreferrer">
                                    <Button type="button" size="sm" variant="outline">Zobrazit detail</Button>
                                  </Link>
                                </div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {nameLookupResult.suggestions.length > 0 && !claimInfo && (
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <p className="mb-3 text-sm font-medium text-gray-700">Podobné prostory v databázi</p>
                            <div className="space-y-3">
                              {nameLookupResult.suggestions.map((suggestion) => (
                                <div
                                  key={suggestion.id}
                                  className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{suggestion.name}</p>
                                    {suggestion.manager?.email && (
                                      <p className="text-xs text-gray-500">Aktuální správce: {suggestion.manager.email}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => selectClaim(suggestion)}>
                                      Chci převzít
                                    </Button>
                                    <Link href={`/prostory/${suggestion.slug}`} target="_blank" rel="noopener noreferrer">
                                      <Button type="button" size="sm" variant="ghost">Detail</Button>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {nameLookupResult.status === 'error' && (
                          <Alert variant="destructive">
                            <AlertTitle>Ověření se nezdařilo</AlertTitle>
                            <AlertDescription>{nameLookupResult.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IČO *</label>
                    <Input placeholder="12345678" {...register('ico')} />
                    {errors.ico && <p className="mt-1 text-xs text-red-600">{errors.ico.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktní osoba *</label>
                    <Input placeholder="Jméno a příjmení" {...register('contactName')} />
                    {errors.contactName && <p className="mt-1 text-xs text-red-600">{errors.contactName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                    <Input placeholder="+420 123 456 789" {...register('contactPhone')} />
                    {errors.contactPhone && <p className="mt-1 text-xs text-red-600">{errors.contactPhone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <Input placeholder="kontakt@spolecnost.cz" {...register('contactEmail')} />
                    {errors.contactEmail && <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka (nepovinné)</label>
                    <Textarea placeholder="Například jaké služby hledáte nebo odkaz na fotky." rows={4} {...register('additionalInfo')} />
                    {errors.additionalInfo && <p className="mt-1 text-xs text-red-600">{errors.additionalInfo.message}</p>}
                  </div>
                </div>
                {claimInfo && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertTitle>Převzetí existujícího prostoru</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="text-sm text-blue-800">
                          Pošleme žádost o převzetí listingu „{claimInfo.name}“. Po ověření vám udělíme správu profilu.
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={clearClaim} className="text-blue-700">
                            <X className="mr-1 h-4 w-4" />Zrušit převzetí
                          </Button>
                          <Link href={`/prostory/${claimInfo.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Zobrazit listing</Button>
                          </Link>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

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
                  ) : claimInfo ? (
                    'Odeslat žádost o převzetí'
                  ) : (
                    'Odeslat žádost'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Mail className="h-5 w-5" />
                  Potřebujete konzultaci?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  Preferujete osobní konzultaci nebo fakturaci předem? Ozvěte se nám a připravíme vám individuální postup.
                </p>
                <div className="space-y-2">
                  <a href="mailto:info@prostormat.cz" className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Mail className="h-4 w-4" /> info@prostormat.cz
                  </a>
                  <a href="tel:+420775654639" className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Phone className="h-4 w-4" /> 775-654-639
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddVenuePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AddVenuePageInner />
    </Suspense>
  )
}
