"use client"

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  BarChart3,
  Activity,
  Star,
  MapPin
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface VenueInfoProps {
  venue: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    views?: number;
    favorites?: number;
    inquiries?: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      message: string;
      eventDate?: string;
      guestCount?: number;
      createdAt: string;
    }>;
  };
}

export function VenueInfo({ venue }: VenueInfoProps) {
  const basicInfo = useMemo(() => {
    const now = new Date();
    const createdDate = new Date(venue.createdAt);
    const updatedDate = new Date(venue.updatedAt);
    const daysOnline = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceUpdate = Math.ceil((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const inquiriesCount = venue.inquiries?.length || 0;

    // Recent inquiries (last 7 days)
    const recentInquiries = venue.inquiries?.filter(inquiry => {
      const inquiryDate = new Date(inquiry.createdAt);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return inquiryDate >= sevenDaysAgo;
    }) || [];

    return {
      inquiries: inquiriesCount,
      recentInquiries: recentInquiries.length,
      daysOnline,
      daysSinceUpdate,
    };
  }, [venue]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Zveřejněno';
      case 'active':
        return 'Aktivní';
      case 'pending':
        return 'Čeká na schválení';
      case 'draft':
        return 'Koncept';
      default:
        return 'Neaktivní';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Přehled prostoru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className={getStatusColor(venue.status)}>
              {getStatusText(venue.status)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Online od:</span>
            <span className="text-sm font-medium">
              {formatDate(new Date(venue.createdAt))} ({basicInfo.daysOnline} dní)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Poslední úprava:</span>
            <span className="text-sm font-medium">
              {basicInfo.daysSinceUpdate === 0 ? 'Dnes' : 
               basicInfo.daysSinceUpdate === 1 ? 'Včera' : 
               `Před ${basicInfo.daysSinceUpdate} dny`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information Only */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Celkem dotazů</p>
              <p className="text-2xl font-bold text-gray-900">{basicInfo.inquiries}</p>
              <p className="text-xs text-gray-500 mt-1">
                {basicInfo.recentInquiries} za posledních 7 dní
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {venue.inquiries && venue.inquiries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Nedávná aktivita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {venue.inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{inquiry.name}</p>
                      {inquiry.eventDate && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(new Date(inquiry.eventDate))}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {inquiry.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(new Date(inquiry.createdAt))}
                      </span>
                      {inquiry.guestCount && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {inquiry.guestCount} hostů
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {inquiry.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => window.open(`mailto:${inquiry.email}`, '_blank')}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    )}
                    {inquiry.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => window.open(`tel:${inquiry.phone}`, '_blank')}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}