"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
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

export function EventRequestForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventRequestFormData>({
    resolver: zodResolver(eventRequestSchema),
    defaultValues: {
      contactName: session?.user?.name || "",
      contactEmail: session?.user?.email || "",
    },
  })

  const onSubmit = async (data: EventRequestFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/event-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          eventDate: data.eventDate ? new Date(data.eventDate) : null,
        }),
      })

      if (response.ok) {
        router.push("/pozadavky?success=true")
      } else {
        throw new Error("Failed to create event request")
      }
    } catch (error) {
      console.error("Error creating event request:", error)
      alert("Došlo k chybě při vytváření požadavku. Zkuste to prosím znovu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-callout font-medium text-black mb-2">
          Název akce *
        </label>
        <Input
          {...register("title")}
          placeholder="např. Firemní vánoční večírek"
        />
        {errors.title && (
          <p className="text-caption text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-callout font-medium text-black mb-2">
          Popis akce
        </label>
        <Textarea
          {...register("description")}
          placeholder="Popište svou akci, atmosféru, požadavky..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Typ akce *
          </label>
          <Select {...register("eventType")}>
            <option value="">Vyberte typ akce</option>
            {Object.entries(EVENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          {errors.eventType && (
            <p className="text-caption text-red-600 mt-1">{errors.eventType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Datum akce
          </label>
          <Input
            type="date"
            {...register("eventDate")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Počet hostů
          </label>
          <Input
            type="number"
            {...register("guestCount")}
            placeholder="50"
            min="1"
          />
          {errors.guestCount && (
            <p className="text-caption text-red-600 mt-1">{errors.guestCount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Rozpočet
          </label>
          <Select {...register("budgetRange")}>
            <option value="">Vyberte rozpočet</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-callout font-medium text-black mb-2">
          Preferovaná lokalita
        </label>
        <Select {...register("locationPreference")}>
          <option value="">Všechny lokality</option>
          {PRAGUE_DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-callout font-medium text-black mb-2">
          Speciální požadavky
        </label>
        <Textarea
          {...register("requirements")}
          placeholder="Parkovací místa, catering, technika, přístupnost..."
          rows={3}
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-headline font-semibold text-black mb-4">
          Kontaktní údaje
        </h3>
        <p className="text-callout text-gray-600 mb-4">
          Tyto údaje budou veřejně zobrazeny, aby vás mohli provozovatelé kontaktovat.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-callout font-medium text-black mb-2">
              Jméno *
            </label>
            <Input
              {...register("contactName")}
              placeholder="Vaše jméno"
            />
            {errors.contactName && (
              <p className="text-caption text-red-600 mt-1">{errors.contactName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-callout font-medium text-black mb-2">
                E-mail *
              </label>
              <Input
                type="email"
                {...register("contactEmail")}
                placeholder="vas@email.cz"
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
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1"
        >
          Zpět
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Vytvářím..." : "Vytvořit požadavek"}
        </Button>
      </div>

      <p className="text-caption text-gray-500 text-center">
        Požadavek bude aktivní 30 dní a poté bude automaticky odstraněn.
      </p>
    </form>
  )
}