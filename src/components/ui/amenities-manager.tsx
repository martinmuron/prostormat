"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Plus, 
  X, 
  Wifi, 
  Car, 
  Wind, 
  Monitor, 
  Coffee,
  Wine,
  TreePine,
  Building,
  Accessibility,
  Volume2,
  Presentation,
  Projector,
  Shield,
  Shirt,
  ChefHat,
  Settings
} from 'lucide-react';

interface AmenitiesManagerProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

// Predefined amenities with icons
const AMENITIES_WITH_ICONS = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parkování', icon: Car },
  { id: 'air-conditioning', label: 'Klimatizace', icon: Wind },
  { id: 'multimedia', label: 'Multimediální vybavení', icon: Monitor },
  { id: 'catering', label: 'Catering možnosti', icon: Coffee },
  { id: 'bar', label: 'Bar', icon: Wine },
  { id: 'terrace', label: 'Terasa', icon: TreePine },
  { id: 'elevator', label: 'Výtah', icon: Building },
  { id: 'wheelchair-access', label: 'Bezbariérový přístup', icon: Accessibility },
  { id: 'sound-system', label: 'Zvuková technika', icon: Volume2 },
  { id: 'stage', label: 'Scéna/pódium', icon: Presentation },
  { id: 'projectors', label: 'Projektory', icon: Projector },
  { id: 'security', label: 'Bezpečnostní systém', icon: Shield },
  { id: 'cloakroom', label: 'Šatna', icon: Shirt },
  { id: 'kitchen', label: 'Kuchyně', icon: ChefHat },
];

export function AmenitiesManager({ selectedAmenities, onAmenitiesChange }: AmenitiesManagerProps) {
  const [customAmenity, setCustomAmenity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Separate predefined and custom amenities
  const predefinedIds = AMENITIES_WITH_ICONS.map(a => a.id);
  const customAmenities = selectedAmenities.filter(a => !predefinedIds.includes(a));

  const toggleAmenity = (amenityId: string) => {
    const isSelected = selectedAmenities.includes(amenityId);
    if (isSelected) {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    
    if (selectedAmenities.includes(trimmed)) {
      alert('Toto vybavení již bylo přidáno');
      return;
    }

    onAmenitiesChange([...selectedAmenities, trimmed]);
    setCustomAmenity('');
    setShowCustomInput(false);
  };

  const removeCustomAmenity = (amenity: string) => {
    onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
  };

  const getAmenityLabel = (amenityId: string) => {
    const predefined = AMENITIES_WITH_ICONS.find(a => a.id === amenityId);
    return predefined ? predefined.label : amenityId;
  };

  const selectedCount = selectedAmenities.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Vybavení a služby</h3>
          <p className="text-sm text-gray-600">
            Vyberte vybavení a služby, které váš prostor nabízí ({selectedCount} vybráno)
          </p>
        </div>
      </div>

      {/* Predefined Amenities Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Standardní vybavení
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AMENITIES_WITH_ICONS.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              const Icon = amenity.icon;
              
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-md ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Amenities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Vlastní vybavení
            </CardTitle>
            {!showCustomInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Přidat vlastní
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Custom Input */}
          {showCustomInput && (
            <div className="flex gap-2 mb-4">
              <Input
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Napište vlastní vybavení..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAmenity();
                  } else if (e.key === 'Escape') {
                    setShowCustomInput(false);
                    setCustomAmenity('');
                  }
                }}
              />
              <Button
                type="button"
                onClick={addCustomAmenity}
                disabled={!customAmenity.trim()}
                size="sm"
              >
                Přidat
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomAmenity('');
                }}
                size="sm"
              >
                Zrušit
              </Button>
            </div>
          )}

          {/* Custom Amenities List */}
          {customAmenities.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">Vlastní vybavení:</p>
              <div className="flex flex-wrap gap-2">
                {customAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(amenity)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            !showCustomInput && (
              <div className="text-center py-4 text-gray-500">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Zatím žádné vlastní vybavení</p>
                <p className="text-xs">Klikněte na "Přidat vlastní" pro přidání specifického vybavení</p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {selectedCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  Vybrané vybavení ({selectedCount})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAmenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      className="bg-blue-100 text-blue-800 border-blue-300"
                    >
                      {getAmenityLabel(amenity)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex gap-2">
          <div className="text-amber-600 mt-0.5">💡</div>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Tipy pro lepší prezentaci:</p>
            <ul className="text-xs space-y-0.5 list-disc list-inside ml-2">
              <li>Vyberte pouze vybavení, které skutečně máte k dispozici</li>
              <li>Více vybavení = lepší pozice ve vyhledávání</li>
              <li>Uveďte specifické vlastnosti ve vlastním vybavení</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}