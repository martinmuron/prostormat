'use client'

import { useState, useEffect } from 'react'

export default function DebugApiPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/event-requests')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-8">
      <h1>Debug API Test</h1>
      
      <h2>Event Requests API:</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {data && (
        <pre style={{background: '#f0f0f0', padding: '1rem', overflow: 'auto'}}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}