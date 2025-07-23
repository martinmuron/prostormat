"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { VENUE_TYPES } from "@/types"

const formSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  address: z.string().min(5, "Zadejte platnou adresu"),
  district: z.string().min(3, "Zadejte městskou část"),
  venueType: z.string().optional().nullable(),
  contactEmail: z.string().email("Zadejte platný e-mail").optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  status: z.enum(["draft", "active", "expired", "suspended"]),
})

type VenueFormProps = {
  venue: z.infer<typeof formSchema> & { id: string }
}

export function VenueForm({ venue }: VenueFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: venue,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Nepodařilo se uložit změny")
      toast.success("Změny byly úspěšně uloženy")
      router.refresh()
    } catch (error) {
      console.error("Error updating venue:", error)
      toast.error("Nepodařilo se uložit změny")
    }
  }

  return (
    <Form {...form}>
      <form id="venue-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Název prostoru</FormLabel>
                <FormControl>
                  <Input placeholder="Název prostoru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="venueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typ prostoru</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="">Vyberte typ prostoru</option>
                    {Object.entries(VENUE_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresa</FormLabel>
                <FormControl>
                  <Input placeholder="Ulice a číslo popisné" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Městská část</FormLabel>
                <FormControl>
                  <Input placeholder="Např. Praha 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kontaktní e-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="kontakt@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefonní číslo</FormLabel>
                <FormControl>
                  <Input placeholder="+420 123 456 789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stav</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="draft">Koncept</option>
                    <option value="active">Aktivní</option>
                    <option value="expired">Expirovaný</option>
                    <option value="suspended">Pozastavený</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Popis prostoru</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Podrobný popis prostoru, vybavení, kapacity, atd."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
