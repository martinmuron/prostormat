"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App level error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-16 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">Něco se pokazilo</h1>
        <p className="text-gray-600">
          Omlouváme se, při načítání stránky došlo k chybě. Zkuste to prosím znovu.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            Zkusit znovu
          </Button>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link href="/">Zpět na homepage</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error?.message && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-white p-4 text-left text-sm text-red-600 shadow">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}
