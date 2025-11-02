"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye,
  EyeOff,
  MapPin,
  Users,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Edit,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  description?: string;
  capacitySeated?: string;
  capacityStanding?: string;
  venueType?: string;
  status: string;
  paid: boolean;
  isRecommended: boolean;
  views: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
  priority?: number | null;
  prioritySource?: string | null;
  claims?: {
    id: string;
    status: string;
    createdAt: string;
    claimant?: {
      name?: string | null;
      email?: string | null;
    } | null;
  }[];
  prostormat_users: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function VenueManagementPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState<string>('all');
const [updatingVenueId, setUpdatingVenueId] = useState<string | null>(null);
const [updatingPriorityId, setUpdatingPriorityId] = useState<string | null>(null);
const [updatingPaidId, setUpdatingPaidId] = useState<string | null>(null);
  const HOMEPAGE_SLOT_COUNT = 12;
  const [homepageSlots, setHomepageSlots] = useState<(string | null)[]>(() =>
    Array.from({ length: HOMEPAGE_SLOT_COUNT }, () => null)
  );
  const [homepageLoading, setHomepageLoading] = useState(true);
  const [homepageSaving, setHomepageSaving] = useState(false);
  const [homepageError, setHomepageError] = useState<string | null>(null);
  const [homepageSuccess, setHomepageSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchVenues();
    fetchHomepageVenues();
  }, []);

  useEffect(() => {
    let filtered = venues;

    // Apply search filter
    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((venue) => {
        const nameMatch = venue.name?.toLowerCase().includes(normalizedSearch);
        const addressMatch = venue.address?.toLowerCase().includes(normalizedSearch);
        const managerMatch = venue.prostormat_users?.name?.toLowerCase().includes(normalizedSearch);
        return Boolean(nameMatch || addressMatch || managerMatch);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(venue => venue.status === statusFilter);
    }

    setFilteredVenues(filtered);
  }, [venues, searchTerm, statusFilter]);

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/admin/venues');
      const data = await response.json();
      if (response.ok) {
        setVenues(data.venues);
      } else {
        console.error('Failed to fetch venues:', data.error);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomepageVenues = async () => {
    try {
      setHomepageLoading(true);
      setHomepageError(null);
      const response = await fetch('/api/admin/homepage-venues');
      const data = await response.json();

      if (response.ok && Array.isArray(data.slots)) {
        const nextSlots = data.slots
          .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
          .map((slot: { venue?: { id: string } | null }) => slot.venue?.id ?? null);

        setHomepageSlots(() => {
          const filled = [...nextSlots];
          while (filled.length < HOMEPAGE_SLOT_COUNT) {
            filled.push(null);
          }
          return filled.slice(0, HOMEPAGE_SLOT_COUNT);
        });
      } else {
        setHomepageError(data.error || 'Nepodařilo se načíst seznam pro homepage');
      }
    } catch (error) {
      console.error('Error fetching homepage venues:', error);
      setHomepageError('Nepodařilo se načíst seznam pro homepage');
    } finally {
      setHomepageLoading(false);
    }
  };

  const handleHomepageSlotChange = (index: number, value: string) => {
    setHomepageSlots((prev) => {
      const next = [...prev];
      next[index] = value === 'none' ? null : value;
      return next;
    });
  };

  const saveHomepageSlots = async () => {
    setHomepageError(null);
    setHomepageSuccess(null);

    const missing = homepageSlots.some((id) => !id);
    if (missing) {
      setHomepageError('Vyplňte všech 12 pozic na homepage.');
      return;
    }

    const ids = homepageSlots.filter((id): id is string => Boolean(id));
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      setHomepageError('Každý prostor může být na homepage pouze jednou.');
      return;
    }

    setHomepageSaving(true);

    try {
      const response = await fetch('/api/admin/homepage-venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slots: homepageSlots.map((venueId, index) => ({
            position: index + 1,
            venueId: venueId!,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHomepageSuccess('Homepage byla úspěšně aktualizována.');
      } else {
        setHomepageError(data.error || 'Nepodařilo se uložit nastavení homepage.');
      }
    } catch (error) {
      console.error('Error saving homepage venues:', error);
      setHomepageError('Nepodařilo se uložit nastavení homepage.');
    } finally {
      setHomepageSaving(false);
    }
  };

  const homepageSelectionCounts = homepageSlots.reduce<Record<string, number>>((acc, id) => {
    if (id) {
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {});

  const orderedVenueOptions = useMemo(() => {
    return venues
      .map((venue) => ({
        id: venue.id,
        name: venue.name || venue.slug || 'Bez názvu',
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'cs-CZ', { sensitivity: 'base' }));
  }, [venues]);

  const venueNameMap = useMemo(() => {
    const map = new Map<string, string>();
    venues.forEach((venue) => {
      if (venue?.id) {
        map.set(venue.id, venue.name || venue.slug || 'Bez názvu');
      }
    });
    return map;
  }, [venues]);

  const toggleVenueStatus = async (venueId: string, currentStatus: string) => {
    setUpdatingVenueId(venueId);

    // Toggle between published and hidden
    const isVisible = currentStatus === 'published';
    const newStatus = isVisible ? 'hidden' : 'published';
    
    try {
      const response = await fetch('/api/admin/venues/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venueId, status: newStatus }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update the venue in state
        setVenues(prev => prev.map(venue => 
          venue.id === venueId 
            ? { ...venue, status: newStatus }
            : venue
        ));
      } else {
        alert(`Chyba při změně stavu: ${data.error}`);
      }
    } catch (error) {
      console.error('Error toggling venue status:', error);
      alert('Došlo k chybě při změně stavu prostoru.');
    } finally {
      setUpdatingVenueId(null);
    }
  };

  const updateVenuePriority = async (venueId: string, priority: number | null) => {
    setUpdatingPriorityId(venueId);

    try {
      const response = await fetch('/api/admin/venues/update-priority', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venueId, priority }),
      });

      const data = await response.json();

      if (response.ok) {
        setVenues(prev => prev.map(venue =>
          venue.id === venueId
            ? { ...venue, priority: data.priority, prioritySource: data.prioritySource }
            : venue
        ));
      } else {
        alert(`Chyba při změně priority: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error updating venue priority:', error);
      alert('Došlo k chybě při změně priority prostoru.');
    } finally {
      setUpdatingPriorityId(null);
    }
  };

  const toggleVenuePaid = async (venueId: string, currentPaid: boolean) => {
    setUpdatingPaidId(venueId);

    try {
      const response = await fetch('/api/admin/venues/toggle-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venueId, paid: !currentPaid }),
      });

      const data = await response.json();

      if (response.ok) {
        setVenues(prev => prev.map(venue =>
          venue.id === venueId
            ? { ...venue, paid: data.paid }
            : venue
        ));
      } else {
        alert(`Chyba při změně platby: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error updating venue paid status:', error);
      alert('Došlo k chybě při změně stavu platby.');
    } finally {
      setUpdatingPaidId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: 'Zveřejněno', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      active: { label: 'Zveřejněno', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      hidden: { label: 'Skryto', variant: 'secondary' as const, color: 'bg-red-100 text-red-800' },
      draft: { label: 'Koncept', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Čeká na schválení', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Načítání prostorů...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6" id="homepage">
          <CardHeader>
            <CardTitle>Homepage prostory</CardTitle>
            <p className="text-sm text-gray-600">
              Vyberte 12 prostorů a jejich pořadí pro hlavní stránku. Sloty jsou zobrazovány od pozice #1 (vlevo nahoře) po #12.
            </p>
          </CardHeader>
          <CardContent>
            {homepageError && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{homepageError}</span>
              </div>
            )}
            {homepageSuccess && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>{homepageSuccess}</span>
              </div>
            )}

            {homepageLoading ? (
              <div className="flex justify-center py-8 text-gray-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Načítám data…</span>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {homepageSlots.map((value, index) => {
                    const position = index + 1
                    const isDuplicate = value ? homepageSelectionCounts[value] > 1 : false
                    const triggerClass = `w-full ${isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`

                    return (
                      <div key={position} className="flex items-start gap-3">
                        <div className="mt-2 text-sm font-semibold text-gray-600 w-10">#{position}</div>
                        <div className="flex-1">
                          <Select
                            value={value ?? 'none'}
                            onValueChange={(selected) => handleHomepageSlotChange(index, selected)}
                          >
                            <SelectTrigger className={triggerClass}>
                              <SelectValue placeholder="Vyberte prostor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nevybráno</SelectItem>
                              {orderedVenueOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {value && !venueNameMap.has(value) && (
                            <p className="mt-1 text-xs text-yellow-600">
                              Tento prostor není v současném seznamu (možná skrytý), ale zůstane na homepage.
                            </p>
                          )}
                          {isDuplicate && (
                            <p className="mt-1 text-xs text-red-600">
                              Tento prostor je již přiřazen na jiné pozici.
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-gray-500">
                    Pořadí se projeví okamžitě po uložení. Pro dosažení nejlepšího dojmu doporučujeme upravit fotografie a popisky vybraných prostor.
                  </p>
                  <Button onClick={saveHomepageSlots} disabled={homepageSaving} className="md:w-auto w-full">
                    {homepageSaving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ukládám…
                      </span>
                    ) : (
                      'Uložit homepage'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Správa prostorů
            </h1>
            <p className="text-gray-600">
              Spravujte viditelnost a stav všech prostorů na platformě ({venues.length} celkem)
            </p>
          </div>
          <Button
            onClick={() => window.open('/admin/venues/manual-add', '_blank')}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Přidat prostor manuálně
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Hledat podle názvu, adresy nebo majitele..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Všechny stavy</option>
                  <option value="published">Zveřejněné</option>
                  <option value="active">Aktivní</option>
                  <option value="hidden">Skryté</option>
                  <option value="draft">Koncepty</option>
                  <option value="pending">Čekající na schválení</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4" id="priority">
          <p className="text-sm text-gray-600">
            Zobrazeno: {filteredVenues.length} z {venues.length} prostorů
          </p>
        </div>

        {/* Venues List */}
        {filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Žádné prostory nenalezeny
              </h3>
              <p className="text-gray-600 text-center">
                Zkuste změnit vyhledávací kritéria nebo filtry.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVenues.map((venue) => (
              <Card key={venue.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-6">
                    {/* Venue Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {venue.name}
                            </h3>
                            {venue.paid && (
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                Zaplaceno
                              </Badge>
                            )}
                            {!venue.paid && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                                Nezaplaceno
                              </Badge>
                            )}
                            {venue.isRecommended && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Doporučený
                              </Badge>
                            )}
                            {(venue.claims?.length || 0) > 0 && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {venue.claims!.length === 1 ? '1 žádost o převzetí' : `${venue.claims!.length} žádosti o převzetí`}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{venue.address}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {venue.capacitySeated && `Sedící: ${venue.capacitySeated}`}
                                {venue.capacitySeated && venue.capacityStanding && ', '}
                                {venue.capacityStanding && `Stojící: ${venue.capacityStanding}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{venue.totalViews} zobrazení</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(venue.status)}
                          <span className="text-xs text-gray-500">
                            Aktualizováno {formatDate(venue.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Majitel: </span>
                            <span className="text-sm text-gray-900">{venue.prostormat_users?.name || 'Neuvedeno'}</span>
                            <span className="text-sm text-gray-500 ml-2">({venue.prostormat_users?.email || 'bez emailu'})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Vytvořeno {formatDate(venue.createdAt)}
                          </div>
                        </div>
                        {(venue.claims?.length || 0) > 0 && (
                          <div className="mt-2 rounded bg-purple-50 border border-purple-200 px-3 py-2 text-xs text-purple-800">
                            <p className="font-medium">Čeká žádost o převzetí:</p>
                            <ul className="mt-1 space-y-1">
                              {venue.claims!.map((claim) => (
                                <li key={claim.id}>
                                  {claim.claimant?.name || 'Neuvedeno'} ({claim.claimant?.email || 'bez emailu'})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-3 min-w-fit">
                      {/* Visibility Toggle */}
                      {(venue.status === 'published' || venue.status === 'hidden') && (
                        <div className="flex flex-col items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 text-center">
                            Viditelnost
                          </label>
                          <div className="flex items-center gap-2">
                            <EyeOff className={`h-4 w-4 ${venue.status === 'hidden' ? 'text-red-600' : 'text-gray-400'}`} />
                            <Switch
                              checked={venue.status === 'published'}
                              onCheckedChange={() => toggleVenueStatus(venue.id, venue.status)}
                              disabled={updatingVenueId === venue.id}
                            />
                            <Eye className={`h-4 w-4 ${venue.status === 'published' ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          {updatingVenueId === venue.id && (
                            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm font-medium text-gray-700 text-center">Priorita</label>
                        <Select
                          value={typeof venue.priority === 'number' ? venue.priority.toString() : 'none'}
                          onValueChange={(value) =>
                            updateVenuePriority(
                              venue.id,
                              value === 'none' ? null : Number.parseInt(value, 10)
                            )
                          }
                          disabled={updatingPriorityId === venue.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Bez priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Bez priority</SelectItem>
                            <SelectItem value="1">1 – vždy první</SelectItem>
                            <SelectItem value="2">2 – po prioritě 1</SelectItem>
                            <SelectItem value="3">3 – po prioritě 1 a 2</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingPriorityId === venue.id && (
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Ukládám…
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <a
                            href={`/admin/venues/${venue.id}/edit`}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Upravit
                          </a>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <a
                            href={`/prostory/${venue.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Zobrazit jako zákazník
                          </a>
                        </Button>

                        <Button
                          variant={venue.paid ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleVenuePaid(venue.id, venue.paid)}
                          disabled={updatingPaidId === venue.id}
                          className={`w-full ${venue.paid ? '' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                          {updatingPaidId === venue.id ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Ukládám...
                            </span>
                          ) : venue.paid ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Zrušit platbu
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Označit jako zaplaceno
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
