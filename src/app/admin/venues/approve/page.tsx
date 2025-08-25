"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface VenueOwner {
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Payment {
  amount: number;
  currency: string;
  payment_completed_at: string;
  stripe_payment_intent_id: string;
}

interface PendingVenue {
  id: string;
  name: string;
  slug: string;
  address: string;
  description?: string;
  capacitySeated?: number;
  capacityStanding?: number;
  venueType?: string;
  amenities: string[];
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  images: string[];
  videoUrl?: string;
  createdAt: string;
  prostormat_users: VenueOwner;
  payment: Payment | null;
}

export default function VenueApprovalPage() {
  const [venues, setVenues] = useState<PendingVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingVenueId, setApprovingVenueId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVenues();
  }, []);

  const fetchPendingVenues = async () => {
    try {
      const response = await fetch('/api/admin/venues/approve');
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

  const approveVenue = async (venueId: string) => {
    setApprovingVenueId(venueId);
    try {
      const response = await fetch('/api/admin/venues/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venueId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Remove approved venue from list
        setVenues(prev => prev.filter(v => v.id !== venueId));
        alert('Prostor byl úspěšně schválen a uživatel byl informován emailem.');
      } else {
        alert(`Chyba při schvalování: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving venue:', error);
      alert('Došlo k chybě při schvalování prostoru.');
    } finally {
      setApprovingVenueId(null);
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

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Načítání prostorů čekających na schválení...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Schválení prostorů
          </h1>
          <p className="text-gray-600">
            Prostory čekající na schválení administrátorem ({venues.length})
          </p>
        </div>

        {venues.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Žádné prostory čekající na schválení
              </h3>
              <p className="text-gray-600 text-center">
                Všechny nově přidané prostory byly schváleny.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {venues.map((venue) => (
              <Card key={venue.id} className="overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-900 mb-1">
                        {venue.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{venue.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Čeká na schválení
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Přidáno {formatDate(venue.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => approveVenue(venue.id)}
                      disabled={approvingVenueId === venue.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {approvingVenueId === venue.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Schvaluji...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Schválit prostor
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Venue Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Informace o prostoru</h3>
                      
                      {venue.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Popis</h4>
                          <p className="text-sm text-gray-600">{venue.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {venue.capacitySeated && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Kapacita (sedící)</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {venue.capacitySeated}
                            </div>
                          </div>
                        )}

                        {venue.capacityStanding && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Kapacita (stojící)</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {venue.capacityStanding}
                            </div>
                          </div>
                        )}
                      </div>

                      {venue.venueType && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Typ prostoru</h4>
                          <Badge variant="outline">{venue.venueType}</Badge>
                        </div>
                      )}

                      {venue.amenities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Vybavení</h4>
                          <div className="flex flex-wrap gap-1">
                            {venue.amenities.map((amenity) => (
                              <Badge key={amenity} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {venue.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Fotografie ({venue.images.length})</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {venue.images.slice(0, 4).map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${venue.name} ${index + 1}`}
                                className="w-full h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Owner & Payment Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Majitel a platba</h3>
                      
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-gray-900">Kontaktní údaje majitele</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Jméno:</span>
                            <span>{venue.prostormat_users.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a 
                              href={`mailto:${venue.prostormat_users.email}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {venue.prostormat_users.email}
                            </a>
                          </div>
                          {venue.prostormat_users.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{venue.prostormat_users.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Registrován {formatDate(venue.prostormat_users.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {venue.payment ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <h4 className="font-medium text-green-900">Platba potvrzena</h4>
                          </div>
                          <div className="space-y-1 text-sm text-green-800">
                            <div className="flex justify-between">
                              <span>Částka:</span>
                              <span className="font-medium">
                                {formatPrice(venue.payment.amount, venue.payment.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Zaplaceno:</span>
                              <span>{formatDate(venue.payment.payment_completed_at)}</span>
                            </div>
                            <div className="pt-1 border-t border-green-200">
                              <span className="text-xs text-green-600">
                                Stripe ID: {venue.payment.stripe_payment_intent_id}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-900 font-medium">Platba nebyla nalezena</span>
                          </div>
                        </div>
                      )}

                      {venue.websiteUrl && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Webové stránky</h4>
                          <a
                            href={venue.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            {venue.websiteUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
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