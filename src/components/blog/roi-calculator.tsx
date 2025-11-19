"use client"

import { useState } from "react"
import { TrendingUp, Calculator, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function RoiCalculator() {
  const [rentalPrice, setRentalPrice] = useState(15000)
  const [currentInquiries, setCurrentInquiries] = useState(2)

  const monthlyFee = 1000
  const estimatedIncrease = 3 // 3x increase based on testimonial
  const potentialInquiries = currentInquiries * estimatedIncrease
  const additionalInquiries = potentialInquiries - currentInquiries

  // Conservative conversion rate (30% of inquiries convert to bookings)
  const conversionRate = 0.3
  const potentialBookings = additionalInquiries * conversionRate
  const potentialRevenue = potentialBookings * rentalPrice
  const roi = ((potentialRevenue - monthlyFee) / monthlyFee) * 100
  const breakEvenBookings = Math.ceil(monthlyFee / rentalPrice)

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 shadow-xl my-8">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Kalkulačka Návratnosti</h3>
            <p className="text-sm text-gray-600">Vypočítejte svůj potenciální ROI</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Průměrná cena pronájmu
            </label>
            <div className="relative">
              <Input
                type="number"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(Number(e.target.value))}
                className="text-lg font-semibold pr-12"
                min={1000}
                step={1000}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Kč
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Současné měsíční poptávky
            </label>
            <div className="relative">
              <Input
                type="number"
                value={currentInquiries}
                onChange={(e) => setCurrentInquiries(Number(e.target.value))}
                className="text-lg font-semibold"
                min={0}
                step={1}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Měsíční investice</span>
              <span className="text-2xl font-bold text-gray-900">{monthlyFee.toLocaleString('cs-CZ')} Kč</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 w-1/12"></div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-100">Potenciální měsíční příjem</span>
              <span className="text-2xl font-bold">{potentialRevenue.toLocaleString('cs-CZ')} Kč</span>
            </div>
            <div className="h-2 bg-blue-500/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-full"></div>
            </div>
            <div className="mt-3 text-xs text-blue-100">
              {potentialInquiries} poptávek × {(conversionRate * 100).toFixed(0)}% konverze = ~{potentialBookings.toFixed(1)} rezervací
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              <div className="flex-1">
                <div className="text-sm font-medium text-green-100">Návratnost investice (ROI)</div>
                <div className="text-3xl font-bold">{roi > 0 ? '+' : ''}{roi.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <strong className="text-gray-900">Stačí {breakEvenBookings} rezervace</strong> za měsíc,
              aby se investice vrátila. Každá další rezervace je čistý zisk!
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            asChild
          >
            <a href="/pridat-prostor">
              Aktivovat můj prostor
            </a>
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 py-6 rounded-xl font-semibold"
            asChild
          >
            <a href="/kontakt">
              Mám dotazy
            </a>
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          * Výpočty jsou orientační a vycházejí z průměrných hodnot. Skutečné výsledky se mohou lišit.
        </p>
      </CardContent>
    </Card>
  )
}
