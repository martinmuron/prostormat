'use client'

import { useState } from 'react'
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
import { CheckCircle, ClipboardList, Clock, Sparkles } from 'lucide-react'

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

export default function OrganizeEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestCount: 30,
    }
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/organize-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (res.ok) {
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
      {/* Header */}
      <div className="bg-white border-b border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-black font-semibold tracking-tight">Organizaci zajistíme za vás</h1>
            </div>
            <p className="text-sm sm:text-body text-gray-600 mb-6 sm:mb-8">
              Nechcete hledat prostory? Nemáte čas organizovat akci? Chcete lepší podmínky? Postaráme se o všechno – od prostoru přes catering až po techniku.
            </p>
            <div className="mx-auto max-w-xl bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
              <strong>Vzhledem k vysoké poptávce</strong> aktuálně přijímáme pouze akce pro <strong>30+ osob</strong>.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                  <Input placeholder="Jan Novák" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>E‑mail *</Label>
                  <Input type="email" placeholder="jan.novak@email.cz" {...register('email')} />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input placeholder="+420 123 456 789" {...register('phone')} />
                </div>
                <div>
                  <Label>Společnost</Label>
                  <Input placeholder="Název společnosti (volitelné)" {...register('company')} />
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
                  <Input type="date" {...register('eventDate')} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Počet hostů *</Label>
                  <Input type="number" min={100} {...register('guestCount', { valueAsNumber: true })} />
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

              <div>
                <Label>Lokalita</Label>
                <Select onValueChange={(v) => setValue('locationPreference', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte lokalitu (volitelné)" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAGUE_DISTRICTS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                    <SelectItem value="Mimo Prahu">Mimo Prahu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Co je důležité zmínit?</Label>
                <Textarea rows={4} placeholder="Technika, catering, program, časový rámec…" {...register('message')} />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full bg-black text-white hover:bg-gray-800 rounded-xl">
                  {isSubmitting ? 'Odesílám…' : 'Zařídit akci za mě'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">Odesláním souhlasíte se zpracováním osobních údajů pro účely kontaktování ohledně vaší akce.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
