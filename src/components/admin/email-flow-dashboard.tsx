"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, XCircle, Clock, RefreshCw, Users, Building } from "lucide-react"

interface EmailLog {
  id: string
  emailType: string
  recipient: string
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error?: string | null
  recipientType?: string | null
  createdAt: string
  prostormat_users_sent_by?: {
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

const EMAIL_TYPE_LABELS: Record<string, string> = {
  'welcome_user': 'Vítací email (uživatel)',
  'welcome_location_owner': 'Vítací email (majitel prostoru)',
  'custom_admin': 'Vlastní admin email',
  'venue_broadcast': 'Broadcast prostorům',
  'password_reset': 'Reset hesla',
  'contact_form_thank_you': 'Poděkování za kontakt'
}

const STATUS_LABELS: Record<string, string> = {
  'sent': 'Odesláno',
  'failed': 'Chyba',
  'pending': 'Čekající'
}

export function EmailFlowDashboard() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEmailFlow = async () => {
    try {
      const response = await fetch('/api/admin/email-flow')
      if (response.ok) {
        const data = await response.json()
        setEmailLogs(data.logs || [])
        setStats(data.stats || [])
      }
    } catch (error) {
      console.error('Error fetching email flow:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEmailFlow()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchEmailFlow()
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
          <p>Načítání email flow...</p>
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
                        {log.prostormat_users_sent_by?.name || 'System'}
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
  )
}