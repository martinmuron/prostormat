"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function ServicesForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      website: formData.get("website") as string,
      serviceType: formData.get("serviceType") as string,
      message: formData.get("message") as string,
    }

    try {
      const response = await fetch("/api/services-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Něco se pokazilo")
      }

      setSubmitStatus("success")
      e.currentTarget.reset()
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Něco se pokazilo")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Děkujeme za registraci!
        </h3>
        <p className="text-green-700">
          Ozveme se vám před spuštěním platformy 1. 12. 2025.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      {submitStatus === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-gray-700 font-medium">
              Jméno a příjmení *
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Jan Novák"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="companyName" className="text-gray-700 font-medium">
              Název firmy *
            </Label>
            <Input
              id="companyName"
              name="companyName"
              required
              placeholder="Catering s.r.o."
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jan@firma.cz"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Telefon *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="+420 123 456 789"
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="website" className="text-gray-700 font-medium">
            Web
          </Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://www.firma.cz"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="serviceType" className="text-gray-700 font-medium">
            Typ služby *
          </Label>
          <Input
            id="serviceType"
            name="serviceType"
            required
            placeholder="Catering, fotografování, DJ..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="message" className="text-gray-700 font-medium">
            Poznámka
          </Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Něco o vaší firmě nebo službách..."
            rows={3}
            className="mt-1.5"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Odesílám...
            </>
          ) : (
            "Odeslat registraci"
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Odesláním souhlasíte se zpracováním osobních údajů pro účely registrace.
        </p>
      </div>
    </form>
  )
}
