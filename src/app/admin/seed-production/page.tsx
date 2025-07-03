'use client'

import { useState } from 'react'

export default function SeedProductionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSeed = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'prostormat-seed-2025'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to seed database')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Seed Production Database
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Warning:</strong> This will seed the production database with test data including:
              </p>
              <ul className="list-disc pl-6 mt-2 text-yellow-800 text-sm">
                <li>Test user: test@test.com / 12345</li>
                <li>Sample user: user@example.com / user123</li>
                <li>Multiple venue managers</li>
                <li>Sample venues and event requests</li>
              </ul>
            </div>

            <button
              onClick={handleSeed}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Seeding Database...' : 'Seed Production Database'}
            </button>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 font-semibold">Error:</p>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-semibold mb-2">Success!</p>
                <pre className="text-green-700 text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <p className="text-green-800 font-semibold mb-2">Test Users Created:</p>
                  <ul className="text-green-700 text-sm">
                    <li>• test@test.com / 12345</li>
                    <li>• user@example.com / user123</li>
                  </ul>
                  <p className="text-green-600 text-sm mt-2">
                    You can now log in at <a href="/prihlaseni" className="underline">/prihlaseni</a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}