"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminPricingSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [soldOut, setSoldOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch("/api/admin/site-settings", { cache: "no-store" })
        if (!response.ok) {
          throw new Error("Nepodařilo se načíst nastavení")
        }
        const data = await response.json()
        setSoldOut(Boolean(data.topPrioritySoldOut))
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Nepodařilo se načíst aktuální stav. Zkuste to prosím znovu.")
      } finally {
        setLoading(false)
      }
    }

    fetchState()
  }, [])

  const handleToggle = async (value: boolean) => {
    setUpdating(true)
    setSoldOut(value)
    setError(null)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topPrioritySoldOut: value }),
      })

      if (!response.ok) {
        throw new Error("Nepodařilo se uložit změnu")
      }
    } catch (err) {
      console.error(err)
      setError("Nepodařilo se uložit změnu. Zkuste to prosím znovu.")
      setSoldOut((prev) => !prev)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nastavení prémiových balíčků</h1>
        <p className="text-muted-foreground">
          Spravujte dostupnost balíčků na stránce ceníku. Změny se projeví okamžitě na webu.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">Top Priority balíček</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ovládá, zda je balíček na stránce ceníku označen jako vyprodaný.
            </p>
          </div>
          <Badge variant={soldOut ? "destructive" : "secondary"}>
            {soldOut ? "Vyprodáno" : "Dostupné"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Zobrazit jako vyprodané</p>
              <p className="text-sm text-muted-foreground">
                Po zapnutí se na stránce ceníku zobrazí upozornění a štítek informující, že balíček je vyprodaný.
              </p>
            </div>
            <Switch
              checked={soldOut}
              disabled={loading || updating}
              onCheckedChange={handleToggle}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Chyba</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
