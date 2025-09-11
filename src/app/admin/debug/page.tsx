'use client'

import { useState } from 'react'

export default function AdminDebugPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'prostormat-seed-2025' })
      })
      const result = await response.json()
      setData(result)
    } catch (error) {
      setData({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const forceReset = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'prostormat-seed-2025', forceReset: true })
      })
      const result = await response.json()
      setData(result)
    } catch (error) {
      setData({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Debug</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Check Database'}
        </button>

        <button 
          onClick={forceReset}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Force Reset Database'}
        </button>

        {data && (
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Quick Links</h2>
        <div className="space-y-2">
          <div><a href="/prostory" className="text-blue-500 underline">View Venues</a></div>
          <div><a href="/prostory/restaurant-terasa" className="text-blue-500 underline">Test Venue Page</a></div>
        </div>
      </div>
    </div>
  )
} 