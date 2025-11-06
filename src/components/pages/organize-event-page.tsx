'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EVENT_TYPES, PRAGUE_DISTRICTS, BUDGET_RANGES } from '@/types'
import { CheckCircle, ClipboardList, Clock } from 'lucide-react'
import { PageHero } from '@/components/layout/page-hero'
import { trackGA4OrganizaceSubmit } from '@/lib/ga4-tracking'
import { createTrackingContext } from '@/lib/tracking-utils'

const formSchema = z.object({
  name: z.string().min(2, 'Zadejte vaše jméno'),
  email: z.string().email('Zadejte platný email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().min(30, 'Aktuálně přijímáme pouze akce pro 30+ osob'),
  budgetRange: z.string().optional(),
  locationPreference: z.string().optional(),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function OrganizeEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [today, setToday] = useState<string | undefined>(undefined)

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestCount: 30,
    }
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const tracking = createTrackingContext()
      const res = await fetch('/api/organize-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          tracking,
        })
      })

      if (res.ok) {
        // Track organize event form submission in GA4
        trackGA4OrganizaceSubmit({
          event_type: values.eventType,
          guest_count: values.guestCount,
          budget_range: values.budgetRange,
          location: values.locationPreference,
          tracking,
        })

        setIsSuccess(true)
        reset({ guestCount: 30 })
      } else {
        const data = await res.json()
        alert(data.error || 'Nepodařilo se odeslat formulář')
      }
    } catch (e) {
      console.error(e)
      alert('Došlo k chybě. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hero = (
    <PageHero
      eyebrow="Full-service"
      title="Organizaci zajistíme za vás"
      subtitle="Nemáte čas hledat prostory ani koordinovat dodavatele? Zadejte nám parametry a náš tým celý event připraví na klíč."
      variant="plain"
      className="bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-16"
      tone="amber"
      size="md"
      containerClassName="max-w-5xl mx-auto"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/90 px-6 py-4 text-center shadow-md">
          <span className="text-sm font-medium text-amber-900">
            Rádi pomůžeme s organizací vaší akce! V tuto chvíli se zaměřujeme na akce od 50 osob.
          </span>
        </div>
      </div>
    </PageHero>
  )

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">Děkujeme! Ozveme se co nejdříve</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Vaši poptávku jsme přijali. Náš tým se vám brzy ozve s návrhem prostorů a kompletní organizací akce.
          </p>
          <Button onClick={() => setIsSuccess(false)} className="bg-black text-white hover:bg-gray-800 rounded-xl">Odeslat další poptávku</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {hero}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-10 sm:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Benefits */}
        <div className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Co zařídíme</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Výběr a rezervace ideálního prostoru</li>
                <li>Catering, technika, výzdoba a produkce</li>
                <li>Vyjednání lepších cenových podmínek</li>
                <li>Koordinace dodavatelů a harmonogramu</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Proč s námi</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>Šetříme čas – vše řešíte s jedním partnerem</li>
                <li>Známé prostory a prověření dodavatelé</li>
                <li>Transparentní rozpočet a jasné termíny</li>
                <li>Podpora zkušeného produkčního týmu</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Form */}
        <Card>
          <CardHeader>
            <CardTitle>Řekněte nám o akci</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Jméno a příjmení *</Label>
                  <Input placeholder="Jan Novák" autoComplete="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>E‑mail *</Label>
                  <Input type="email" placeholder="jan.novak@email.cz" autoComplete="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input placeholder="+420 123 456 789" autoComplete="tel" {...register('phone')} />
                </div>
                <div>
                  <Label>Společnost</Label>
                  <Input placeholder="Název společnosti (volitelné)" autoComplete="organization" {...register('company')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Typ akce</Label>
                  <Select onValueChange={(v) => setValue('eventType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Datum akce</Label>
                  <Input type="date" {...register('eventDate')} min={today} autoComplete="off" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Počet hostů *</Label>
                  <Input type="number" min={100} autoComplete="off" {...register('guestCount', { valueAsNumber: true })} />
                  {errors.guestCount && <p className="text-sm text-red-600 mt-1">{errors.guestCount.message}</p>}
                </div>
                <div>
                  <Label>Rozpočet</Label>
                  <Select onValueChange={(v) => setValue('budgetRange', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte rozpočet (volitelné)" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Lokalita preference</Label>
                  <Select onValueChange={(v) => setValue('locationPreference', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte lokalitu" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRAGUE_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Speciální požadavky</Label>
                  <Textarea rows={4} autoComplete="off" {...register('message')} placeholder="Scéna, catering, program, technika..." />
                </div>
              </div>

              <div>
                <Label>Co byste rádi zažili?</Label>
                <Textarea rows={5} autoComplete="off" {...register('message')} placeholder="Popište vaši ideální akci a důležité detaily." />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white hover:bg-gray-800 rounded-xl"
              >
                {isSubmitting ? 'Odesílání...' : 'Odeslat poptávku'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
