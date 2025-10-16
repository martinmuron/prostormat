"use client"

import { useMemo, type ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Video, 
  MapPin, 
  Users, 
  Phone, 
  Globe, 
  Settings,
  Star,
  TrendingUp,
  Search
} from 'lucide-react';

type IconComponent = ComponentType<{ className?: string }>

interface VenueData {
  name?: string;
  description?: string;
  address?: string;
  capacitySeated?: number | string;
  capacityStanding?: number | string;
  venueType?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  youtubeUrl?: string;
  images?: string[];
  amenities?: string[];
}

interface ProfileCompletionProps {
  venue: VenueData;
  onSectionFocus?: (section: string) => void;
}

interface CompletionItem {
  id: string;
  label: string;
  description: string;
  icon: IconComponent;
  completed: boolean;
  required: boolean;
  weight: number; // How much this contributes to completion percentage
  seoImpact: 'high' | 'medium' | 'low';
}

export function ProfileCompletion({ venue, onSectionFocus }: ProfileCompletionProps) {
  const completionItems: CompletionItem[] = useMemo(() => [
    {
      id: 'basic-info',
      label: 'Základní informace',
      description: 'Název, popis a adresa prostoru',
      icon: MapPin,
      completed: !!(venue.name && venue.description && venue.address),
      required: true,
      weight: 20,
      seoImpact: 'high'
    },
    {
      id: 'images',
      label: 'Fotografie',
      description: 'Minimálně 3 kvalitní fotografie',
      icon: Camera,
      completed: !!(venue.images && venue.images.length >= 3),
      required: true,
      weight: 25,
      seoImpact: 'high'
    },
    {
      id: 'capacity',
      label: 'Kapacita',
      description: 'Kapacita k sezení nebo ke stání',
      icon: Users,
      completed: !!(venue.capacitySeated || venue.capacityStanding),
      required: true,
      weight: 15,
      seoImpact: 'high'
    },
    {
      id: 'contact',
      label: 'Kontaktní údaje',
      description: 'Email a telefon pro komunikaci',
      icon: Phone,
      completed: !!(venue.contactEmail && venue.contactPhone),
      required: true,
      weight: 15,
      seoImpact: 'medium'
    },
    {
      id: 'venue-type',
      label: 'Typ prostoru',
      description: 'Kategorie vašeho prostoru',
      icon: Settings,
      completed: !!venue.venueType,
      required: false,
      weight: 10,
      seoImpact: 'high'
    },
    {
      id: 'amenities',
      label: 'Vybavení',
      description: 'Minimálně 3 položky vybavení',
      icon: Star,
      completed: !!(venue.amenities && venue.amenities.length >= 3),
      required: false,
      weight: 10,
      seoImpact: 'medium'
    },
    {
      id: 'website',
      label: 'Webové stránky',
      description: 'Odkaz na vaše webové stránky',
      icon: Globe,
      completed: !!venue.websiteUrl,
      required: false,
      weight: 3,
      seoImpact: 'low'
    },
    {
      id: 'video',
      label: 'Video prezentace',
      description: 'YouTube video vašeho prostoru',
      icon: Video,
      completed: !!venue.youtubeUrl,
      required: false,
      weight: 2,
      seoImpact: 'medium'
    }
  ], [venue]);

  const completedItems = completionItems.filter(item => item.completed);
  const requiredItems = completionItems.filter(item => item.required);
  const completedRequired = requiredItems.filter(item => item.completed);
  
  const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = completedItems.reduce((sum, item) => sum + item.weight, 0);
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

  const isProfileComplete = completedRequired.length === requiredItems.length;
  const missingRequired = requiredItems.filter(item => !item.completed);

  const getCompletionStatus = () => {
    if (completionPercentage >= 90) return { level: 'excellent', color: 'green', text: 'Vynikající' };
    if (completionPercentage >= 75) return { level: 'good', color: 'blue', text: 'Dobré' };
    if (completionPercentage >= 50) return { level: 'fair', color: 'yellow', text: 'Střední' };
    return { level: 'poor', color: 'red', text: 'Nedostatečné' };
  };

  const status = getCompletionStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Dokončenost profilu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Celkové skóre</span>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${
                  status.color === 'green' ? 'bg-green-100 text-green-800 border-green-300' :
                  status.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-red-100 text-red-800 border-red-300'
                }`}
              >
                {status.text}
              </Badge>
              <span className="text-sm font-bold">{completionPercentage}%</span>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-gray-600">
            {completedItems.length} z {completionItems.length} sekcí dokončeno
          </p>
        </div>

        {/* Required Items Status */}
        {!isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Chybějící povinné informace ({missingRequired.length})
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Pro zveřejnění prostoru dokončete všechny povinné sekce
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Kontrolní seznam</h4>
          <div className="space-y-2">
            {completionItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-2 rounded-lg border ${
                    item.completed 
                      ? 'bg-green-50 border-green-200' 
                      : item.required 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${
                        item.required ? 'border-red-400' : 'border-gray-400'
                      }`} />
                    )}
                  </div>
                  
                  <Icon className={`h-4 w-4 mt-0.5 ${
                    item.completed ? 'text-green-600' : 
                    item.required ? 'text-red-600' : 'text-gray-600'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      {item.required && (
                        <Badge variant="destructive" className="text-xs">
                          Povinné
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.seoImpact === 'high' ? 'border-green-300 text-green-700' :
                          item.seoImpact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-gray-300 text-gray-600'
                        }`}
                      >
                        <Search className="h-2 w-2 mr-1" />
                        {item.seoImpact === 'high' ? 'Vysoký SEO' : 
                         item.seoImpact === 'medium' ? 'Střední SEO' : 'Nízký SEO'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.description}
                    </p>
                    {!item.completed && onSectionFocus && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs h-7"
                        onClick={() => onSectionFocus(item.id)}
                      >
                        Dokončit
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 font-medium">
                    {item.weight}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEO Impact Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2">
            <Search className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                SEO & Vyhledatelnost
              </p>
              <p className="text-xs text-blue-800 mt-1">
                Vyšší dokončenost profilu = lepší pozice ve vyhledávání a více dotazů
              </p>
              <div className="mt-2 text-xs text-blue-700">
                <span className="font-medium">Doporučení:</span> Dokončete alespoň {Math.max(75, completionPercentage + 10)}% pro optimální výsledky
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rewards */}
        {isProfileComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  🎉 Profil je připraven k zveřejnění!
                </p>
                <p className="text-xs text-green-800 mt-1">
                  Všechny povinné informace jsou vyplněny. Váš prostor může být schválen administrátorem.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
