"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Heart,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  X
} from 'lucide-react';
import { VenueGallery } from '@/components/venue/venue-gallery';

interface VenuePreviewProps {
  venue: {
    id?: string;
    name: string;
    description?: string;
    address: string;
    capacitySeated?: number | string;
    capacityStanding?: number | string;
    venueType?: string;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    youtubeUrl?: string;
    images?: string[];
    amenities?: string[];
    slug?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const VENUE_TYPES: { [key: string]: string } = {
  'conference-hall': 'Konferenční sál',
  'wedding-venue': 'Svatební prostor',
  'corporate-space': 'Firemní prostor',
  'gallery': 'Galerie',
  'restaurant': 'Restaurace',
  'hotel': 'Hotel',
  'outdoor-space': 'Venkovní prostor',
  'theater': 'Divadlo',
  'other': 'Jiné'
};

export function VenuePreview({ venue, isOpen, onClose }: VenuePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString('cs-CZ'));
  }, []);

  if (!isOpen) return null;

  const venueTypeLabel = venue.venueType ? VENUE_TYPES[venue.venueType] || venue.venueType : null;
  const maxCapacity = Math.max(
    Number(venue.capacitySeated) || 0, 
    Number(venue.capacityStanding) || 0
  );

  const getPreviewDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
      default:
        return 'max-w-6xl mx-auto';
    }
  };

  const getPreviewScale = () => {
    switch (viewMode) {
      case 'mobile':
        return 'scale-75';
      case 'tablet':
        return 'scale-85';
      case 'desktop':
      default:
        return 'scale-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="min-h-screen p-4">
        {/* Preview Header */}
        <div className="bg-white rounded-t-lg border-b px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Náhled profilu</h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {venue.name}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Desktop náhled"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('tablet')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Tablet náhled"
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  title="Mobilní náhled"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              {venue.slug && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/prostory/${venue.slug}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Otevřít živě
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="bg-gray-100 min-h-screen">
          <div className={`transition-all duration-300 ${getPreviewDimensions()} ${getPreviewScale()}`}>
            <div className="bg-white min-h-screen">
              {/* Venue Content - Mimicking the actual venue page */}
              <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    {/* Gallery */}
                    {venue.images && venue.images.length > 0 ? (
                      <VenueGallery images={venue.images} venueName={venue.name} />
                    ) : (
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-8">
                        <div className="text-center text-gray-500">
                          <Eye className="h-12 w-12 mx-auto mb-2" />
                          <p>Žádné fotografie</p>
                        </div>
                      </div>
                    )}

                    {/* YouTube Video */}
                    {venue.youtubeUrl && (
                      <div className="mt-8">
                        <h2 className="text-2xl font-bold text-black mb-4">Video prezentace</h2>
                        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            src={venue.youtubeUrl.includes('embed') ? venue.youtubeUrl : 
                                 venue.youtubeUrl.replace('watch?v=', 'embed/')}
                            title={`${venue.name} - Video prezentace`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Venue Info */}
                    <div className="mt-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h1 className="text-4xl font-bold text-black mb-2">{venue.name}</h1>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="h-5 w-5" />
                            <span>{venue.address}</span>
                          </div>
                          {venueTypeLabel && (
                            <Badge variant="secondary" className="mb-4">
                              {venueTypeLabel}
                            </Badge>
                          )}
                        </div>
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="h-6 w-6" />
                        </button>
                      </div>

                      {venue.description && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-black mb-4">O prostoru</h2>
                          <p className="text-gray-700 leading-relaxed">
                            {venue.description}
                          </p>
                        </div>
                      )}

                      {/* Capacity */}
                      {maxCapacity > 0 && (
                        <div className="mb-8">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Kapacita
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">
                                  {maxCapacity} osob
                                </span>
                              </div>
                              {venue.capacitySeated && venue.capacityStanding && (
                                <div className="mt-3 text-sm text-gray-600">
                                  <div>Sedící: {venue.capacitySeated} osob</div>
                                  <div>Stojící: {venue.capacityStanding} osob</div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Amenities */}
                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-black mb-4">Vybavení a služby</h2>
                          <div className="flex flex-wrap gap-2">
                            {venue.amenities.map((amenity: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-black mb-4">Kontaktní informace</h2>
                        <div className="space-y-3">
                          {venue.contactEmail && (
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-gray-500" />
                              <span className="text-blue-600">{venue.contactEmail}</span>
                            </div>
                          )}
                          {venue.contactPhone && (
                            <div className="flex items-center gap-3">
                              <Phone className="h-5 w-5 text-gray-500" />
                              <span className="text-blue-600">{venue.contactPhone}</span>
                            </div>
                          )}
                          {venue.websiteUrl && (
                            <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5 text-gray-500" />
                              <span className="text-blue-600">Webové stránky</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - Contact Form */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24">
                      <Card>
                        <CardHeader>
                          <CardTitle>Pošlete dotaz</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Vaše jméno</label>
                            <div className="h-10 bg-gray-100 rounded border"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">E-mail</label>
                            <div className="h-10 bg-gray-100 rounded border"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Telefon</label>
                            <div className="h-10 bg-gray-100 rounded border"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Datum akce</label>
                            <div className="h-10 bg-gray-100 rounded border"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Počet hostů</label>
                            <div className="h-10 bg-gray-100 rounded border"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Zpráva</label>
                            <div className="h-24 bg-gray-100 rounded border"></div>
                          </div>
                          <Button className="w-full" disabled>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Odeslat dotaz
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Footer */}
        <div className="bg-white rounded-b-lg border-t px-6 py-3 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Náhled profilu - {viewMode === 'desktop' ? 'Desktop' : viewMode === 'tablet' ? 'Tablet' : 'Mobil'}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">
                Aktualizováno: {lastUpdated || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
