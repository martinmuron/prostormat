"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const billingSchema = z.object({
  billingEmail: z.string().email("Zadejte platný e-mail").optional().or(z.literal('')),
  billingName: z.string().optional(),
  billingAddress: z.string().optional(),
  taxId: z.string().optional(),
  vatId: z.string().optional(),
  subscriptionStatus: z.enum(["active", "past_due", "canceled", "unpaid"]).optional(),
  expiresAt: z.string().optional(),
})

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
  }
}

export function VenueBilling({ venue }: VenueBillingProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof billingSchema>>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      billingEmail: venue.billingEmail || "",
      billingName: venue.billingName || "",
      billingAddress: venue.billingAddress || "",
      taxId: venue.taxId || "",
      vatId: venue.vatId || "",
      subscriptionStatus: venue.subscriptionStatus as any || "",
      expiresAt: venue.expiresAt ? new Date(venue.expiresAt).toISOString().split('T')[0] : "",
    },
  })

  async function onSubmit(values: z.infer<typeof billingSchema>) {
    try {
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
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
                    {...field}
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

        <div className="flex justify-end">
          <Button type="submit">Uložit změny</Button>
        </div>
      </form>
    </Form>
  )
}
