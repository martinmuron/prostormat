"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EVENT_TYPES, PRAGUE_DISTRICTS, BUDGET_RANGES } from "@/types"

const eventRequestSchema = z.object({
  title: z.string().min(5, "Název akce musí mít alespoň 5 znaků"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Vyberte typ akce"),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().min(1, "Počet hostů musí být alespoň 1").optional(),
  budgetRange: z.string().optional(),
  locationPreference: z.string().optional(),
  requirements: z.string().optional(),
  contactName: z.string().min(2, "Jméno je povinné"),
  contactEmail: z.string().email("Neplatná e-mailová adresa"),
  contactPhone: z.string().optional(),
})

type EventRequestFormData = z.infer<typeof eventRequestSchema>

interface EventRequestFormProps {
  mode?: "create" | "edit"
  initialValues?: Partial<EventRequestFormData>
  eventRequestId?: string
  successRedirect?: string
}

export function EventRequestForm({
  mode = "create",
  initialValues,
  eventRequestId,
  successRedirect,
}: EventRequestFormProps = {}) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues = useMemo<EventRequestFormData>(() => ({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    eventType: initialValues?.eventType ?? "",
    eventDate: initialValues?.eventDate ?? "",
    guestCount: typeof initialValues?.guestCount === "number" ? initialValues.guestCount : undefined,
    budgetRange: initialValues?.budgetRange ?? "",
    locationPreference: initialValues?.locationPreference ?? "",
    requirements: initialValues?.requirements ?? "",
    contactName: initialValues?.contactName ?? session?.user?.name ?? "",
    contactEmail: initialValues?.contactEmail ?? session?.user?.email ?? "",
    contactPhone: initialValues?.contactPhone ?? "",
  }), [initialValues, session?.user?.email, session?.user?.name])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventRequestFormData>({
    resolver: zodResolver(eventRequestSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    register("eventType")
    register("budgetRange")
    register("locationPreference")
  }, [register])

  const eventTypeValue = watch("eventType") || ""
  const budgetRangeValue = watch("budgetRange") || ""
  const locationPreferenceValue = watch("locationPreference") || ""

  const redirectTarget =
    successRedirect ??
    (mode === "edit" ? "/dashboard" : "/event-board?success=true")

  const submitLabel = mode === "edit" ? "Uložit změny" : "Vytvořit poptávku"
  const submittingLabel = mode === "edit" ? "Ukládám..." : "Vytvářím..."

  const onSubmit = async (data: EventRequestFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === "edit" && !eventRequestId) {
        throw new Error("Chybí ID poptávky pro úpravu.")
      }

      const payload: Record<string, unknown> = {
        title: data.title.trim(),
        eventType: data.eventType,
        contactName: data.contactName.trim(),
        contactEmail: data.contactEmail.trim(),
      }

      const trimmedDescription = data.description?.trim()
      if (trimmedDescription) {
        payload.description = trimmedDescription
      } else if (mode === "edit") {
        payload.description = null
      }

      if (data.eventDate) {
        payload.eventDate = data.eventDate
      } else if (mode === "edit") {
        payload.eventDate = null
      }

      if (typeof data.guestCount === "number" && !Number.isNaN(data.guestCount)) {
        payload.guestCount = data.guestCount
      } else if (mode === "edit") {
        payload.guestCount = null
      }

      if (data.budgetRange) {
        payload.budgetRange = data.budgetRange
      } else if (mode === "edit") {
        payload.budgetRange = null
      }

      if (data.locationPreference) {
        payload.locationPreference = data.locationPreference
      } else if (mode === "edit") {
        payload.locationPreference = null
      }

      const trimmedRequirements = data.requirements?.trim()
      if (trimmedRequirements) {
        payload.requirements = trimmedRequirements
      } else if (mode === "edit") {
        payload.requirements = null
      }

      const trimmedPhone = data.contactPhone?.trim()
      if (trimmedPhone) {
        payload.contactPhone = trimmedPhone
      } else if (mode === "edit") {
        payload.contactPhone = null
      }

      const endpoint =
        mode === "edit" ? `/api/event-requests/${eventRequestId}` : "/api/event-requests"

      const response = await fetch(endpoint, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push(redirectTarget)
      } else {
        throw new Error("Failed to submit event request")
      }
    } catch (error) {
      console.error("Error submitting event request:", error)
      alert("Došlo k chybě při ukládání poptávky. Zkuste to prosím znovu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label className="block text-headline font-semibold text-black mb-3">
          Název akce *
        </label>
        <Input
          {...register("title")}
          placeholder="např. Firemní vánoční večírek"
          className="text-body"
        />
        {errors.title && (
          <p className="text-callout text-red-600 mt-2 font-medium">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-headline font-semibold text-black mb-3">
          Popis akce
        </label>
        <Textarea
          {...register("description")}
          placeholder="Popište svou akci, atmosféru, požadavky..."
          rows={4}
          className="text-body rounded-2xl border-2 min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-headline font-semibold text-black mb-3">
            Typ akce *
          </label>
          <Select
            value={eventTypeValue}
            onValueChange={(value) =>
              setValue("eventType", value, { shouldDirty: true, shouldValidate: true })
            }
          >
            <SelectTrigger className="text-body">
              <SelectValue placeholder="Vyberte typ akce" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.eventType && (
            <p className="text-callout text-red-600 mt-2 font-medium">{errors.eventType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-headline font-semibold text-black mb-3">
            Datum akce
          </label>
          <Input
            type="date"
            {...register("eventDate")}
            className="text-body"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-headline font-semibold text-black mb-3">
            Počet hostů
          </label>
          <Input
            type="number"
            {...register("guestCount")}
            placeholder="50"
            min="1"
            className="text-body"
          />
          {errors.guestCount && (
            <p className="text-callout text-red-600 mt-2 font-medium">{errors.guestCount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-headline font-semibold text-black mb-3">
            Rozpočet
          </label>
          <Select
            value={budgetRangeValue}
            onValueChange={(value) =>
              setValue("budgetRange", value, { shouldDirty: true, shouldValidate: true })
            }
          >
            <SelectTrigger className="text-body">
              <SelectValue placeholder="Vyberte rozpočet" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-headline font-semibold text-black mb-3">
          Preferovaná lokalita
        </label>
        <Select
          value={locationPreferenceValue}
          onValueChange={(value) =>
            setValue("locationPreference", value, { shouldDirty: true, shouldValidate: true })
          }
        >
          <SelectTrigger className="text-body">
            <SelectValue placeholder="Všechny lokality" />
          </SelectTrigger>
          <SelectContent>
            {PRAGUE_DISTRICTS.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-headline font-semibold text-black mb-3">
          Speciální požadavky
        </label>
        <Textarea
          {...register("requirements")}
          placeholder="Parkovací místa, catering, technika, přístupnost..."
          rows={3}
          className="text-body rounded-2xl border-2 min-h-[100px]"
        />
      </div>

      <div className="border-t-2 border-gray-100 pt-8">
        <h3 className="text-title-2 font-bold text-black mb-4">
          Kontaktní údaje
        </h3>
        <p className="text-body text-gray-600 mb-6 leading-relaxed">
          Tyto údaje budou veřejně zobrazeny, aby vás mohli provozovatelé kontaktovat.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-headline font-semibold text-black mb-3">
              Jméno *
            </label>
            <Input
              {...register("contactName")}
              placeholder="Vaše jméno"
              className="text-body"
            />
            {errors.contactName && (
              <p className="text-callout text-red-600 mt-2 font-medium">{errors.contactName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-headline font-semibold text-black mb-3">
                E-mail *
              </label>
              <Input
                type="email"
                {...register("contactEmail")}
                placeholder="vas@email.cz"
                className="text-body"
              />
              {errors.contactEmail && (
                <p className="text-callout text-red-600 mt-2 font-medium">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-headline font-semibold text-black mb-3">
                Telefon
              </label>
              <Input
                type="tel"
                {...register("contactPhone")}
                placeholder="+420 123 456 789"
                className="text-body"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1 py-4 text-body font-semibold rounded-2xl"
        >
          Zpět
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 py-4 text-body font-semibold rounded-2xl bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>

      <p className="text-callout text-gray-500 text-center mt-6 leading-relaxed">
        Požadavek bude aktivní 30 dní a poté bude automaticky odstraněn.
      </p>
    </form>
  )
}
