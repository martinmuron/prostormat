"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { 
  Users, 
  Building, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  BarChart3,
  Shield,
  Calendar,
  MessageSquare
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalVenues: number
  activeVenues: number
  draftVenues: number
  totalInquiries: number
  venueManagers: number
}

interface AdminVenue {
  id: string
  name: string
  slug: string
  address: string
  status: string
  venueType?: string
  capacitySeated?: number
  capacityStanding?: number
  createdAt: string
  manager: {
    name: string
    email: string
  }
  _count: {
    inquiries: number
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [venues, setVenues] = useState<AdminVenue[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")

  // Check if already authenticated on mount
  useEffect(() => {
    const auth = localStorage.getItem("admin_auth")
    if (auth === "authenticated") {
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "112233") {
      setIsAuthenticated(true)
      setAuthError("")
      localStorage.setItem("admin_auth", "authenticated")
      loadData()
    } else {
      setAuthError("Nesprávné heslo")
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const headers = {
        "x-admin-password": "112233"
      }

      // Load statistics
      const statsRes = await fetch("/api/admin/stats", { headers })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Load venues
      const venuesRes = await fetch("/api/admin/venues", { headers })
      if (venuesRes.ok) {
        const venuesData = await venuesRes.json()
        setVenues(venuesData)
      }
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateVenueStatus = async (venueId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "112233"
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Reload data
        loadData()
      } else {
        alert("Chyba při aktualizaci stavu prostoru")
      }
    } catch (error) {
      console.error("Error updating venue status:", error)
      alert("Chyba při aktualizaci stavu prostoru")
    }
  }

  const deleteVenue = async (venueId: string) => {
    if (!confirm("Opravdu chcete smazat tento prostor? Tato akce je nevratná.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": "112233"
        }
      })

      if (response.ok) {
        loadData()
      } else {
        alert("Chyba při mazání prostoru")
      }
    } catch (error) {
      console.error("Error deleting venue:", error)
      alert("Chyba při mazání prostoru")
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_auth")
    setPassword("")
  }

  // Filter venues
  const filteredVenues = venues.filter(venue => {
    if (filter === "all") return true
    return venue.status === filter
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-2">Admin přístup</h1>
            <p className="text-gray-600">Zadejte heslo pro přístup k administraci</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Heslo
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Zadejte admin heslo"
                    required
                    className="h-12"
                  />
                  {authError && (
                    <p className="text-sm text-red-600 mt-1">{authError}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12">
                  Přihlásit se
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-black">
                Prostormat Admin
              </h1>
            </div>
            <Button variant="secondary" onClick={logout} size="sm">
              Odhlásit se
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p>Načítání...</p>
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
                        <p className="text-sm text-gray-500 mb-1">Celkem uživatelů</p>
                        <p className="text-2xl font-bold text-black">{stats.totalUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Celkem prostorů</p>
                        <p className="text-2xl font-bold text-black">{stats.totalVenues}</p>
                      </div>
                      <Building className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Aktivní prostory</p>
                        <p className="text-2xl font-bold text-black">{stats.activeVenues}</p>
                      </div>
                      <Eye className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Celkem dotazů</p>
                        <p className="text-2xl font-bold text-black">{stats.totalInquiries}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Venue Management */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Správa prostorů ({filteredVenues.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-auto"
                    >
                      <option value="all">Všechny prostory</option>
                      <option value="active">Aktivní</option>
                      <option value="draft">Návrhy</option>
                    </Select>
                    <Button onClick={loadData} variant="secondary" size="sm">
                      Obnovit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prostor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Správce
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dotazy
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vytvořeno
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akce
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVenues.map((venue) => (
                        <tr key={venue.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {venue.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {venue.address}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">{venue.manager.name}</div>
                            <div className="text-sm text-gray-500">{venue.manager.email}</div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge 
                              variant={venue.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {venue.status === "active" ? "Aktivní" : venue.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {venue._count.inquiries}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {new Date(venue.createdAt).toLocaleDateString("cs-CZ")}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {venue.status === "active" ? (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => updateVenueStatus(venue.id, "draft")}
                                  className="h-8 px-2"
                                >
                                  <EyeOff className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => updateVenueStatus(venue.id, "active")}
                                  className="h-8 px-2"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => deleteVenue(venue.id)}
                                className="h-8 px-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredVenues.length === 0 && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Žádné prostory nenalezeny</p>
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