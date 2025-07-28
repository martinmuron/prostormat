"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  MessageSquare,
  UserCheck,
  Settings,
  Mail,
  Phone
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
    id: string
    name: string
    email: string
  }
  _count: {
    inquiries: number
  }
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  company?: string
  createdAt: string
  _count: {
    venues: number
    eventRequests: number
    venueInquiries: number
  }
}

interface AdminInquiry {
  id: string
  name: string
  email: string
  phone?: string
  eventDate?: string
  guestCount?: number
  message?: string
  createdAt: string
  venue: {
    name: string
    slug: string
  }
  user?: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [venues, setVenues] = useState<AdminVenue[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [editingVenue, setEditingVenue] = useState<AdminVenue | null>(null)

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

      // Load users
      const usersRes = await fetch("/api/admin/users", { headers })
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      // Load inquiries
      const inquiriesRes = await fetch("/api/admin/inquiries", { headers })
      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json()
        setInquiries(inquiriesData)
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

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "112233"
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        loadData()
      } else {
        alert("Chyba při aktualizaci role uživatele")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Chyba při aktualizaci role uživatele")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Opravdu chcete smazat tohoto uživatele? Tato akce je nevratná.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": "112233"
        }
      })

      if (response.ok) {
        loadData()
      } else {
        alert("Chyba při mazání uživatele")
      }
    } catch (error) {
      console.error("Error deleting user:", error)  
      alert("Chyba při mazání uživatele")
    }
  }

  const assignVenueManager = async (venueId: string, managerId: string) => {
    try {
      const response = await fetch("/api/admin/venues/assign-manager", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "112233"
        },
        body: JSON.stringify({ venueId, managerId }),
      })

      if (response.ok) {
        loadData()
        setEditingVenue(null)
      } else {
        alert("Chyba při přiřazování správce prostoru")
      }
    } catch (error) {
      console.error("Error assigning venue manager:", error)
      alert("Chyba při přiřazování správce prostoru")
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

  // Get venue managers for assignment dropdown
  const venueManagers = users.filter(user => user.role === "venue_manager")
  
  // Get role counts
  const adminUsers = users.filter(user => user.role === "admin")
  const managerUsers = users.filter(user => user.role === "venue_manager")
  const regularUsers = users.filter(user => user.role === "user")

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
                Prostormat Admin Dashboard
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
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: "overview", label: "Přehled", icon: BarChart3 },
                  { id: "venues", label: "Prostory", icon: Building },
                  { id: "users", label: "Uživatelé", icon: Users },
                  { id: "inquiries", label: "Dotazy", icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && stats && (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
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
                          <p className="text-sm text-gray-500 mb-1">Správci prostorů</p>
                          <p className="text-2xl font-bold text-black">{stats.venueManagers}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-indigo-600" />
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
                          <p className="text-sm text-gray-500 mb-1">Koncepty</p>
                          <p className="text-2xl font-bold text-black">{stats.draftVenues}</p>
                        </div>
                        <EyeOff className="h-8 w-8 text-gray-600" />
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


                  <Card>
                    <CardHeader>
                      <CardTitle>Přehled uživatelů podle rolí</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Administrátoři</span>
                          <Badge variant="destructive">{adminUsers.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Správci prostorů</span>
                          <Badge variant="secondary">{managerUsers.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Běžní uživatelé</span>
                          <Badge variant="outline">{regularUsers.length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Venues Tab */}
            {activeTab === "venues" && (
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
                        onValueChange={(value) => setFilter(value)}
                      >
                        <SelectTrigger className="w-auto">
                          <SelectValue placeholder="Filtr prostorů" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Všechny prostory</SelectItem>
                          <SelectItem value="active">Aktivní</SelectItem>
                          <SelectItem value="draft">Návrhy</SelectItem>
                        </SelectContent>
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
                            Kapacita
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stav
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dotazy
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
                                <div className="text-xs text-gray-400 mt-1">
                                  {venue.venueType && `${venue.venueType} • `}
                                  {new Date(venue.createdAt).toLocaleDateString("cs-CZ")}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">{venue.manager.name}</div>
                              <div className="text-sm text-gray-500">{venue.manager.email}</div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingVenue(venue)}
                                className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                              >
                                Změnit správce
                              </Button>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {venue.capacitySeated && venue.capacityStanding ? (
                                <div>
                                  <div>{venue.capacitySeated} sed.</div>
                                  <div>{venue.capacityStanding} stoj.</div>
                                </div>
                              ) : venue.capacitySeated ? (
                                `${venue.capacitySeated} sedících`
                              ) : venue.capacityStanding ? (
                                `${venue.capacityStanding} stojících`
                              ) : (
                                "Neuvedeno"
                              )}
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
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(`/prostory/${venue.slug}`, '_blank')}
                                  className="h-8 px-2"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
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
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Správa uživatelů ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uživatel
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kontakt
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aktivita
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registrace
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akce
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                                {user.company && (
                                  <div className="text-xs text-gray-400">
                                    {user.company}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2">
                                <Badge 
                                  variant={user.role === "admin" ? "destructive" : user.role === "venue_manager" ? "secondary" : "outline"}
                                  className="text-xs w-fit"
                                >
                                  {user.role === "admin" ? "Admin" : user.role === "venue_manager" ? "Správce" : "Uživatel"}
                                </Badge>
                                <Select 
                                  value={user.role} 
                                  onValueChange={(value) => updateUserRole(user.id, value)}
                                >
                                  <SelectTrigger className="w-auto h-6 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">Uživatel</SelectItem>
                                    <SelectItem value="venue_manager">Správce prostorů</SelectItem>
                                    <SelectItem value="admin">Administrátor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-500">
                                {user.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {user.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              <div className="space-y-1">
                                <div>{user._count.venues} prostorů</div>
                                <div>{user._count.eventRequests} požadavků</div>
                                <div>{user._count.venueInquiries} dotazů</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString("cs-CZ")}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => deleteUser(user.id)}
                                className="h-8 px-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inquiries Tab */}
            {activeTab === "inquiries" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Dotazy na prostory ({inquiries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kontakt
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prostor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akce
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Zpráva
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Datum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inquiries.map((inquiry) => (
                          <tr key={inquiry.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {inquiry.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {inquiry.email}
                                </div>
                                {inquiry.phone && (
                                  <div className="text-sm text-gray-500">
                                    {inquiry.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {inquiry.venue.name}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(`/prostory/${inquiry.venue.slug}`, '_blank')}
                                className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                              >
                                Zobrazit prostor
                              </Button>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {inquiry.eventDate && (
                                <div>{new Date(inquiry.eventDate).toLocaleDateString("cs-CZ")}</div>
                              )}
                              {inquiry.guestCount && (
                                <div>{inquiry.guestCount} hostů</div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {inquiry.message || "Bez zprávy"}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {new Date(inquiry.createdAt).toLocaleDateString("cs-CZ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {inquiries.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Žádné dotazy nenalezeny</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Manager Assignment Modal */}
            {editingVenue && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Přiřadit správce prostoru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{editingVenue.name}</p>
                        <p className="text-sm text-gray-500">Současný správce: {editingVenue.manager.name}</p>
                      </div>
                      
                      <Select 
                        defaultValue={editingVenue.manager.id}
                        onValueChange={(value) => assignVenueManager(editingVenue.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte správce" />
                        </SelectTrigger>
                        <SelectContent>
                          {venueManagers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => setEditingVenue(null)} variant="secondary" className="flex-1">
                          Zrušit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 