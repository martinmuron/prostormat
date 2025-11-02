"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, XCircle, Clock, RefreshCw, Users, Building, MousePointerClick, Eye, AlertTriangle, ShieldAlert } from "lucide-react"

interface EmailLog {
  id: string
  emailType: string
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error?: string | null
  recipientType?: string | null
  createdAt: string
  prostormat_users?: {
    name: string
    email: string
  }
}

interface EmailStats {
  emailType: string
  status: string
  _count: {
    id: number
  }
}

interface BroadcastTrackingStats {
  totalEmails: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complained: number
  totalOpens: number
  totalClicks: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  complaintRate: number
}

interface BroadcastSummary {
  id: string
  title: string
  eventType: string
  createdAt: string
  sentBy: string
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  totalOpens: number
  totalClicks: number
  openRate: number
  clickRate: number
}

const EMAIL_TYPE_LABELS: Record<string, string> = {
  'welcome_user': 'Vítací email (uživatel)',
  'welcome_location_owner': 'Vítací email (majitel prostoru)',
  'custom_admin': 'Vlastní admin email',
  'venue_broadcast': 'Broadcast prostorům',
  'password_reset': 'Reset hesla',
  'contact_form_thank_you': 'Poděkování za kontakt',
  'add_venue_thank_you': 'Poděkování za přidání prostoru',
  'quick_request_venue_notification': 'Rychlá poptávka - notifikace prostoru',
  'venue_inquiry_paid': 'Poptávka prostoru (placené)',
  'venue_inquiry_unpaid': 'Poptávka prostoru (neplacené)'
}

const STATUS_LABELS: Record<string, string> = {
  'sent': 'Odesláno',
  'failed': 'Chyba',
  'pending': 'Čekající'
}

export function EmailFlowDashboard() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats[]>([])
  const [broadcastStats, setBroadcastStats] = useState<BroadcastTrackingStats | null>(null)
  const [broadcasts, setBroadcasts] = useState<BroadcastSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchEmailFlow = useCallback(async (page: number = 1) => {
    try {
      const response = await fetch(`/api/admin/email-flow?page=${page}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setEmailLogs(data.logs || [])
        setStats(data.stats || [])
        if (data.pagination) {
          setPagination(data.pagination)
          setCurrentPage(data.pagination.page)
        }
      }
    } catch (error) {
      console.error('Error fetching email statistics:', error)
    }
  }, [])

  const fetchBroadcastTracking = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/broadcast-tracking')
      if (response.ok) {
        const data = await response.json()
        setBroadcastStats(data.stats || null)
        setBroadcasts(data.broadcasts || [])
      }
    } catch (error) {
      console.error('Error fetching broadcast tracking:', error)
    }
  }, [])

  const fetchAll = useCallback(async (page: number = 1) => {
    setLoading(true)
    await Promise.all([fetchEmailFlow(page), fetchBroadcastTracking()])
    setLoading(false)
    setRefreshing(false)
  }, [fetchBroadcastTracking, fetchEmailFlow])

  useEffect(() => {
    fetchAll(currentPage)
  }, [fetchAll, currentPage])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAll(currentPage)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'sent' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'
    return (
      <Badge variant={variant}>
        {STATUS_LABELS[status] || status}
      </Badge>
    )
  }

  // Calculate summary stats
  const totalEmails = stats.reduce((sum, stat) => sum + stat._count.id, 0)
  const sentEmails = stats.filter(s => s.status === 'sent').reduce((sum, stat) => sum + stat._count.id, 0)
  const failedEmails = stats.filter(s => s.status === 'failed').reduce((sum, stat) => sum + stat._count.id, 0)
  const successRate = totalEmails > 0 ? Math.round((sentEmails / totalEmails) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Načítání emailových statistik...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Celkem emailů</p>
                <p className="text-title-2 text-black">{totalEmails}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Úspěšně odesláno</p>
                <p className="text-title-2 text-green-600">{sentEmails}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Chybné odeslání</p>
                <p className="text-title-2 text-red-600">{failedEmails}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-gray-500 mb-1">Úspěšnost</p>
                <p className="text-title-2 text-black">{successRate}%</p>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${successRate >= 95 ? 'bg-green-100' : successRate >= 80 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <span className={`text-sm font-bold ${successRate >= 95 ? 'text-green-600' : successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {successRate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email log</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {emailLogs.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Zatím nejsou k dispozici žádné email logy.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Typ emailu</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Příjemce</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Předmět</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Datum</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Odeslal</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {log.recipientType === 'venue_manager' ? (
                            <Building className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Users className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm">
                            {EMAIL_TYPE_LABELS[log.emailType] || log.emailType}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{log.recipient}</td>
                      <td className="py-3 px-4 text-sm max-w-xs truncate">{log.subject}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(log.createdAt).toLocaleString('cs-CZ')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {log.prostormat_users?.name || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-600">
                    Zobrazeno {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total} emailů
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrev}
                    >
                      První
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Předchozí
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Show 5 pages centered around current page
                        let pageNum: number
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Další
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNext}
                    >
                      Poslední
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Broadcast Tracking Section */}
      {broadcastStats && (
        <>
          <div className="border-t pt-8 mt-8">
            <h2 className="text-title-2 text-black mb-6">📊 Broadcast Email Tracking (Resend)</h2>

            {/* Broadcast Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Doručeno</p>
                      <p className="text-xl font-bold text-green-600">{broadcastStats.deliveryRate}%</p>
                      <p className="text-xs text-gray-400">{broadcastStats.delivered}/{broadcastStats.totalEmails}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Open Rate</p>
                      <p className="text-xl font-bold text-blue-600">{broadcastStats.openRate}%</p>
                      <p className="text-xs text-gray-400">{broadcastStats.totalOpens} otevření</p>
                    </div>
                    <Eye className="h-6 w-6 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Click Rate</p>
                      <p className="text-xl font-bold text-purple-600">{broadcastStats.clickRate}%</p>
                      <p className="text-xs text-gray-400">{broadcastStats.totalClicks} kliknutí</p>
                    </div>
                    <MousePointerClick className="h-6 w-6 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bounce Rate</p>
                      <p className="text-xl font-bold text-orange-600">{broadcastStats.bounceRate}%</p>
                      <p className="text-xs text-gray-400">{broadcastStats.bounced} bounced</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Spam Rate</p>
                      <p className="text-xl font-bold text-red-600">{broadcastStats.complaintRate}%</p>
                      <p className="text-xs text-gray-400">{broadcastStats.complained} stížností</p>
                    </div>
                    <ShieldAlert className="h-6 w-6 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Broadcasts Table */}
            <Card>
              <CardHeader>
                <CardTitle>Nedávné broadcasty</CardTitle>
              </CardHeader>
              <CardContent>
                {broadcasts.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Zatím nebyly odeslány žádné broadcasty.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Broadcast</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Odesláno</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Doručeno</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Otevřeno</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Kliknuto</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Open Rate</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Click Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {broadcasts.map((broadcast) => (
                          <tr key={broadcast.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="max-w-xs">
                                <p className="font-medium truncate">{broadcast.title}</p>
                                <p className="text-xs text-gray-500">{broadcast.sentBy}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">{broadcast.totalSent}</td>
                            <td className="py-3 px-4 text-green-600">{broadcast.delivered}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-blue-500" />
                                {broadcast.opened} ({broadcast.totalOpens}×)
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <MousePointerClick className="h-3 w-3 text-purple-500" />
                                {broadcast.clicked} ({broadcast.totalClicks}×)
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={broadcast.openRate >= 20 ? "default" : "secondary"}>
                                {broadcast.openRate}%
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={broadcast.clickRate >= 10 ? "default" : "secondary"}>
                                {broadcast.clickRate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
