'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SeedDatabasePage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const seedDatabase = async () => {
    setIsSeeding(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch('/api/admin/seed-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': '112233'
        },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data)
      } else {
        setError(data.error || 'Failed to seed database')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🌱 Database Seeding Tool</CardTitle>
            <p className="text-gray-600">
              This tool will populate your production database with sample venues and event requests.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Button 
                onClick={seedDatabase} 
                disabled={isSeeding}
                className="w-full"
                size="lg"
              >
                {isSeeding ? 'Seeding Database...' : 'Seed Production Database'}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">❌ Error: {error}</p>
                </div>
              )}

              {results && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Database Seeded Successfully!</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <p>• Users created: {results.users?.length || 0}</p>
                    <p>• Venues created: {results.venues?.length || 0}</p>
                    <p>• Event requests created: {results.eventRequests?.length || 0}</p>
                  </div>
                  
                  {results.venues && (
                    <div className="mt-4">
                      <p className="font-medium text-green-800">Created Venues:</p>
                      <ul className="list-disc list-inside text-sm text-green-700">
                        {results.venues.map((venue: any) => (
                          <li key={venue.id}>{venue.name} ({venue.status})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-green-100 rounded">
                    <p className="text-sm text-green-800">
                      🎉 Your production site should now show venues in "doporučené prostory" 
                      and event requests in "poptávky na akce"!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 