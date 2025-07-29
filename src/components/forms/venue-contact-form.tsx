"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import Link from "next/link"

const contactFormSchema = z.object({
  name: z.string().min(2, "Jméno je povinné"),
  email: z.string().email("Neplatná e-mailová adresa"),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().optional(),
  message: z.string().min(10, "Zpráva musí mít alespoň 10 znaků"),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface VenueContactFormProps {
  venueId: string
  venueName: string
}

export function VenueContactForm({ venueId, venueName }: VenueContactFormProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/venues/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          venueId,
          eventDate: data.eventDate ? new Date(data.eventDate) : null,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        reset()
      } else {
        throw new Error("Failed to send inquiry")
      }
    } catch (error) {
      console.error("Error sending inquiry:", error)
      alert("Došlo k chybě při odesílání dotazu. Zkuste to prosím znovu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-title-3 text-black mb-2">Dotaz odeslán!</h3>
          <p className="text-body text-gray-600 mb-4">
            Váš dotaz byl úspěšně odeslán. Provozovatel prostoru {venueName} vás bude kontaktovat v nejbližší době.
          </p>
          <Button 
            variant="secondary" 
            onClick={() => setIsSubmitted(false)}
          >
            Odeslat další dotaz
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${!session ? 'blur-sm pointer-events-none' : ''}`}>
        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Jméno *
          </label>
          <Input
            {...register("name")}
            placeholder="Vaše jméno"
          />
          {errors.name && (
            <p className="text-caption text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-callout font-medium text-black mb-2">
            E-mail *
          </label>
          <Input
            type="email"
            {...register("email")}
            placeholder="vas@email.cz"
          />
          {errors.email && (
            <p className="text-caption text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Telefon
          </label>
          <Input
            type="tel"
            {...register("phone")}
            placeholder="+420 123 456 789"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-callout font-medium text-black mb-2">
              Datum akce
            </label>
            <Input
              type="date"
              {...register("eventDate")}
            />
          </div>

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
          </div>
        </div>

        <div>
          <label className="block text-callout font-medium text-black mb-2">
            Zpráva *
          </label>
          <Textarea
            {...register("message")}
            placeholder="Popište svou akci a požadavky..."
            rows={4}
          />
          {errors.message && (
            <p className="text-caption text-red-600 mt-1">{errors.message.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Odesílám..." : "Odeslat dotaz"}
        </Button>

        <p className="text-caption text-gray-500">
          Odesláním souhlasíte s předáním vašich kontaktních údajů provozovateli prostoru.
        </p>
      </form>

      {!session && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg border-2 border-black max-w-sm">
            <h3 className="text-lg font-bold text-black mb-4">
              Přihlaste se pro odeslání dotazu
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Pro kontaktování majitele prostoru se musíte nejprve přihlásit nebo zaregistrovat.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/prihlaseni">
                <Button className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-200 font-medium rounded-xl">
                  Přihlásit se
                </Button>
              </Link>
              <Link href="/registrace">
                <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-200 font-medium rounded-xl">
                  Zaregistrovat se
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}