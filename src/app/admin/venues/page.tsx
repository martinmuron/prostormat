"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Eye,
  EyeOff,
  MapPin,
  Users,
  Calendar,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Edit,
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
  isRecommended: boolean;
  views: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    let filtered = venues;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.prostormat_users.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const toggleVenueStatus = async (venueId: string, currentStatus: string) => {
    setUpdatingVenueId(venueId);
    
    // Handle both old status values (active) and new ones (published/hidden)
    const isVisible = currentStatus === 'published' || currentStatus === 'active';
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Správa prostorů
          </h1>
          <p className="text-gray-600">
            Spravujte viditelnost a stav všech prostorů na platformě ({venues.length} celkem)
          </p>
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
        <div className="mb-4">
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
                            {venue.isRecommended && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Doporučený
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
                            <span className="text-sm text-gray-900">{venue.prostormat_users.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({venue.prostormat_users.email})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Vytvořeno {formatDate(venue.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-3 min-w-fit">
                      {/* Visibility Toggle */}
                      {(venue.status === 'published' || venue.status === 'active' || venue.status === 'hidden') && (
                        <div className="flex flex-col items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 text-center">
                            Viditelnost
                          </label>
                          <div className="flex items-center gap-2">
                            <EyeOff className={`h-4 w-4 ${venue.status === 'hidden' ? 'text-red-600' : 'text-gray-400'}`} />
                            <Switch
                              checked={venue.status === 'published' || venue.status === 'active'}
                              onCheckedChange={() => toggleVenueStatus(venue.id, venue.status)}
                              disabled={updatingVenueId === venue.id}
                            />
                            <Eye className={`h-4 w-4 ${venue.status === 'published' || venue.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          {updatingVenueId === venue.id && (
                            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                          )}
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-2">
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
                            Zobrazit
                          </a>
                        </Button>
                        
                        {venue.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <a href={`/admin/venues/approve`}>
                              Schválit
                            </a>
                          </Button>
                        )}
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