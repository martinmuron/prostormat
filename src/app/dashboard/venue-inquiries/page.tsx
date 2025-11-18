"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Phone, Users, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface InquiryItem {
  id: string
  type: "inquiry" | "broadcast"
  name: string
  email: string
  phone: string | null
  message: string | null
  eventDate: Date | null
  guestCount: number | null
  status: string
  createdAt: Date
  venueName: string
  venueSlug: string
  broadcastId?: string
  broadcastTitle?: string
}

const STATUS_OPTIONS = [
  { value: "all", label: "Vše" },
  { value: "new", label: "Nové" },
  { value: "answered", label: "Odpovězeno" },
  { value: "completed", label: "Dokončeno" },
]

const STATUS_BADGE_STYLES = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  answered: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
}

export default function VenueManagerInquiriesPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/venue-manager/inquiries?${params}`)
      if (!response.ok) throw new Error("Failed to fetch inquiries")

      const data = await response.json()
      setInquiries(data.inquiries)
      setTotalPages(data.pagination.totalPages)
      setTotalCount(data.pagination.totalCount)
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.role === "venue_manager") {
      fetchInquiries()
    }
  }, [sessionStatus, session, fetchInquiries])

  const handleStatusChange = async (inquiryId: string, type: "inquiry" | "broadcast", newStatus: string) => {
    setUpdatingStatus(inquiryId)
    try {
      const response = await fetch(`/api/venue-manager/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, type }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      // Update local state
      setInquiries(prev =>
        prev.map(inq =>
          inq.id === inquiryId ? { ...inq, status: newStatus } : inq
        )
      )
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Nepodařilo se aktualizovat stav")
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (sessionStatus === "loading") {
    return <div className="p-8">Načítání...</div>
  }

  if (sessionStatus !== "authenticated" || session?.user?.role !== "venue_manager") {
    return <div className="p-8">Přístup odepřen</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Všechny poptávky</h1>
          <p className="text-gray-600">
            Celkem {totalCount} poptávek od zákazníků
          </p>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrovat podle stavu" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries List */}
        {loading ? (
          <div className="text-center py-12">Načítání poptávek...</div>
        ) : inquiries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Žádné poptávky nenalezeny
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inquiries.map(inquiry => (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                        <Badge variant="outline" className={inquiry.type === "broadcast" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {inquiry.type === "broadcast" ? "Rychlá poptávka" : "Standardní"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{inquiry.venueName}</p>
                    </div>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) => handleStatusChange(inquiry.id, inquiry.type, value)}
                      disabled={updatingStatus === inquiry.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">
                          <Badge variant="outline" className={STATUS_BADGE_STYLES.new}>Nové</Badge>
                        </SelectItem>
                        <SelectItem value="answered">
                          <Badge variant="outline" className={STATUS_BADGE_STYLES.answered}>Odpovězeno</Badge>
                        </SelectItem>
                        <SelectItem value="completed">
                          <Badge variant="outline" className={STATUS_BADGE_STYLES.completed}>Dokončeno</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${inquiry.email}`} className="hover:text-blue-600">
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${inquiry.phone}`} className="hover:text-blue-600">
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                      {inquiry.guestCount && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="h-4 w-4" />
                          {inquiry.guestCount} hostů
                        </div>
                      )}
                      {inquiry.eventDate && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          {new Date(inquiry.eventDate).toLocaleDateString("cs-CZ")}
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    {inquiry.message && (
                      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                        {inquiry.message}
                      </div>
                    )}

                    {/* Quick Request Title */}
                    {inquiry.type === "broadcast" && inquiry.broadcastTitle && (
                      <div className="text-sm text-gray-600">
                        <strong>Poptávka:</strong> {inquiry.broadcastTitle}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {inquiry.type === "broadcast" && inquiry.broadcastId && (
                        <Link href={`/poptavka/${inquiry.broadcastId}?venue=${inquiry.venueSlug}`}>
                          <Button variant="outline" size="sm">
                            Zobrazit detail
                          </Button>
                        </Link>
                      )}
                      <span className="text-xs text-gray-500 self-center ml-auto">
                        {new Date(inquiry.createdAt).toLocaleDateString("cs-CZ")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Předchozí
            </Button>
            <span className="text-sm text-gray-600">
              Stránka {page} z {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Další
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
