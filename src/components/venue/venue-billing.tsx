"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const billingSchema = z.object({
  billingEmail: z.string().email("Zadejte platný e-mail").optional().or(z.literal('')),
  billingName: z.string().optional(),
  billingAddress: z.string().optional(),
  taxId: z.string().optional(),
  vatId: z.string().optional(),
  subscriptionStatus: z.enum(["active", "past_due", "canceled", "unpaid"]).optional().or(z.literal("")),
  expiresAt: z.string().optional(),
  paid: z.boolean().default(false),
  paymentDate: z.string().optional(),
})

const SUBSCRIPTION_STATUSES = ["active", "past_due", "canceled", "unpaid"] as const

type SubscriptionStatusOption = (typeof SUBSCRIPTION_STATUSES)[number]

function isSubscriptionStatus(value: unknown): value is SubscriptionStatusOption {
  return typeof value === "string" && SUBSCRIPTION_STATUSES.includes(value as SubscriptionStatusOption)
}

type VenueBillingProps = {
  venue: {
    id: string
    billingEmail?: string | null
    billingName?: string | null
    billingAddress?: string | null
    taxId?: string | null
    vatId?: string | null
    subscriptionStatus?: string | null
    expiresAt?: Date | null
    paid?: boolean | null
    paymentDate?: Date | null
  }
}

type BillingFormValues = z.input<typeof billingSchema>

export function VenueBilling({ venue }: VenueBillingProps) {
  const router = useRouter()
  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingEmail: venue.billingEmail || "",
      billingName: venue.billingName || "",
      billingAddress: venue.billingAddress || "",
      taxId: venue.taxId || "",
      vatId: venue.vatId || "",
      subscriptionStatus: isSubscriptionStatus(venue.subscriptionStatus) ? venue.subscriptionStatus : "",
      expiresAt: venue.expiresAt ? new Date(venue.expiresAt).toISOString().split('T')[0] : "",
      paid: Boolean(venue.paid),
      paymentDate: venue.paymentDate ? new Date(venue.paymentDate).toISOString().split('T')[0] : "",
    },
  })

  const paid = form.watch("paid")
  const paymentDate = form.watch("paymentDate")

  useEffect(() => {
    const currentStatus = form.getValues("subscriptionStatus")
    if (paid && !currentStatus) {
      form.setValue("subscriptionStatus", "active", { shouldDirty: true })
    }
    if (!paid && currentStatus === "active") {
      form.setValue("subscriptionStatus", "", { shouldDirty: true })
    }
  }, [paid, form])

  useEffect(() => {
    if (!paymentDate) {
      return
    }
    const currentExpires = form.getValues("expiresAt")
    if (currentExpires) {
      return
    }
    const baseDate = new Date(paymentDate)
    if (Number.isNaN(baseDate.getTime())) {
      return
    }
    const plusYear = new Date(baseDate)
    plusYear.setFullYear(plusYear.getFullYear() + 1)
    form.setValue("expiresAt", plusYear.toISOString().split("T")[0], { shouldDirty: true })
  }, [paymentDate, form])

  async function onSubmit(values: BillingFormValues) {
    const paymentDateValue = values.paymentDate ? new Date(values.paymentDate) : null
    const expiresAtValue = values.expiresAt ? new Date(values.expiresAt) : null

    if (values.paymentDate && Number.isNaN(paymentDateValue?.getTime())) {
      toast.error("Datum zahájení předplatného není platné")
      return
    }

    if (values.expiresAt && Number.isNaN(expiresAtValue?.getTime())) {
      toast.error("Datum konce předplatného není platné")
      return
    }

    try {
      const subscriptionStatus =
        values.subscriptionStatus && values.subscriptionStatus.length > 0
          ? values.subscriptionStatus
          : values.paid
            ? "active"
            : null

      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          subscriptionStatus,
          expiresAt: expiresAtValue,
          paymentDate: paymentDateValue,
        }),
      })

      if (!response.ok) throw new Error("Nepodařilo se uložit změny")
      toast.success("Fakturační údaje byly aktualizovány")
      router.refresh()
    } catch (error) {
      console.error("Error updating billing:", error)
      toast.error("Nepodařilo se uložit změny")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="billingEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fakturační e-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="fakturace@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firma / Jméno</FormLabel>
                <FormControl>
                  <Input placeholder="Název společnosti nebo jméno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="billingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fakturační adresa</FormLabel>
                <FormControl>
                  <Input placeholder="Ulice, město, PSČ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IČO</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vatId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DIČ</FormLabel>
                <FormControl>
                  <Input placeholder="CZ12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subscriptionStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stav předplatného</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <option value="">Vyberte stav</option>
                    <option value="active">Aktivní</option>
                    <option value="past_due">Po splatnosti</option>
                    <option value="canceled">Zrušeno</option>
                    <option value="unpaid">Nezaplaceno</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platné do</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="paid"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel>Předplatné uhrazeno</FormLabel>
                    <FormDescription>
                      Označte, pokud má prostor aktivní roční členství.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datum zahájení</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Kdy klient zaplatil předplatné (offline nebo online).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platné do</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Pokud není vyplněno, doplníme rok od data zahájení.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit">Uložit změny</Button>
        </div>
      </form>
    </Form>
  )
}
