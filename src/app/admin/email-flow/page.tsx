"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  BarChart3,
  Calendar,
  Users
} from "lucide-react"

interface EmailFlowStats {
  totalEmails: number
  sentEmails: number
  deliveredEmails: number
  failedEmails: number
  pendingEmails: number
  today: number
  thisWeek: number
  thisMonth: number
}

interface EmailFlowEntry {
  id: string
  type: string // venue-broadcast, quick-request, etc.
  recipient: string
  recipientName?: string
  subject: string
  status: 'sent' | 'delivered' | 'failed' | 'pending' | 'bounced'
  error?: string
  sentAt: string
  deliveredAt?: string
  metadata?: {
    broadcastId?: string
    venueId?: string
    campaignName?: string
  }
}

export default function EmailFlowPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<EmailFlowStats | null>(null)
  const [emails, setEmails] = useState<EmailFlowEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth")
    if (auth === "authenticated") {
      setIsAuthenticated(true)
      loadData()
    } else {
      // Redirect to main admin page
      window.location.href = "/admin"
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const headers = {
        "x-admin-password": "112233"
      }

      // Load email flow statistics
      const statsRes = await fetch("/api/admin/email-flow/stats", { headers })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Load email flow entries
      const emailsRes = await fetch("/api/admin/email-flow", { headers })
      if (emailsRes.ok) {
        const emailsData = await emailsRes.json()
        setEmails(emailsData)
      }
    } catch (error) {
      console.error("Error loading email flow data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Mail className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="text-blue-600">Odesláno</Badge>
      case 'delivered':
        return <Badge variant="default" className="bg-green-600">Doručeno</Badge>
      case 'failed':
        return <Badge variant="destructive">Chyba</Badge>
      case 'bounced':
        return <Badge variant="destructive">Vráceno</Badge>
      case 'pending':
        return <Badge variant="secondary">Čeká</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'venue-broadcast':
        return 'Rozesílka prostorům'
      case 'quick-request':
        return 'Rychlá poptávka'
      case 'inquiry-notification':
        return 'Notifikace dotazu'
      case 'welcome-email':
        return 'Uvítací email'
      default:
        return type
    }
  }

  // Filter emails
  const filteredEmails = emails.filter(email => {
    if (filter === "all") return true
    return email.status === filter
  })

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/admin'}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Mail className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-black">
                Email Flow Dashboard
              </h1>
            </div>
            <Button onClick={loadData} variant="secondary" size="sm">
              Obnovit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p>Načítání email flow dat...</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Celkem emailů</p>
                        <p className="text-2xl font-bold text-black">{stats.totalEmails}</p>
                      </div>
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Úspěšně doručeno</p>
                        <p className="text-2xl font-bold text-black">{stats.deliveredEmails}</p>
                        <p className="text-xs text-green-600">
                          {stats.totalEmails > 0 ? Math.round((stats.deliveredEmails / stats.totalEmails) * 100) : 0}% úspěšnost
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Chyby</p>
                        <p className="text-2xl font-bold text-black">{stats.failedEmails}</p>
                        <p className="text-xs text-red-600">
                          {stats.totalEmails > 0 ? Math.round((stats.failedEmails / stats.totalEmails) * 100) : 0}% neúspěch
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Dnes</p>
                        <p className="text-2xl font-bold text-black">{stats.today}</p>
                        <p className="text-xs text-gray-500">
                          Tento týden: {stats.thisWeek}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Email Flow Entries */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Email Flow Historie ({filteredEmails.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">Všechny stavy</option>
                      <option value="sent">Odesláno</option>
                      <option value="delivered">Doručeno</option>
                      <option value="failed">Chyby</option>
                      <option value="pending">Čekající</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Typ emailu
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Příjemce
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Předmět
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Odesláno
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detaily
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(email.status)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {getEmailTypeLabel(email.type)}
                                </div>
                                {email.metadata?.campaignName && (
                                  <div className="text-xs text-gray-500">
                                    {email.metadata.campaignName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {email.recipientName || email.recipient}
                              </div>
                              <div className="text-sm text-gray-500">
                                {email.recipient}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {email.subject}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {getStatusBadge(email.status)}
                            {email.error && (
                              <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={email.error}>
                                {email.error}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            <div>{new Date(email.sentAt).toLocaleDateString("cs-CZ")}</div>
                            <div className="text-xs">
                              {new Date(email.sentAt).toLocaleTimeString("cs-CZ")}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {email.metadata?.broadcastId && (
                              <div className="text-xs">
                                Broadcast: {email.metadata.broadcastId.substring(0, 8)}...
                              </div>
                            )}
                            {email.metadata?.venueId && (
                              <div className="text-xs">
                                Venue: {email.metadata.venueId.substring(0, 8)}...
                              </div>
                            )}
                            {email.deliveredAt && (
                              <div className="text-xs text-green-600">
                                Doručeno: {new Date(email.deliveredAt).toLocaleString("cs-CZ")}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredEmails.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {filter === "all" 
                        ? "Žádné emaily nenalezeny" 
                        : `Žádné emaily se stavem "${filter}" nenalezeny`
                      }
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Všechny emaily odeslané přes Resend budou zobrazeny zde
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}