import type { Prisma } from '@prisma/client'

export type DashboardUser = Prisma.UserGetPayload<{
  select: {
    id: true
    name: true
    email: true
    role: true
    company: true
    phone: true
  }
}>

export type VenueManagerVenue = Prisma.VenueGetPayload<{
  include: {
    inquiries: {
      orderBy: { createdAt: 'desc' }
      take: 5
    }
    broadcastLogs: {
      where: { emailStatus: 'sent' }
      include: {
        broadcast: {
          select: {
            id: true
            title: true
            description: true
            eventType: true
            eventDate: true
            guestCount: true
            locationPreference: true
            contactName: true
            contactEmail: true
            contactPhone: true
            createdAt: true
          }
        }
      }
      orderBy: { sentAt: 'desc' }
      take: 10
    }
    _count: {
      select: {
        inquiries: true
        broadcastLogs: true
      }
    }
  }
}>

export type EventRequestSummary = Prisma.EventRequestGetPayload<Prisma.EventRequestDefaultArgs>

export type VenueInquirySummary = Prisma.VenueInquiryGetPayload<{
  include: {
    venue: {
      select: {
        id: true
        name: true
        slug: true
      }
    }
  }
}>

export type VenueBroadcastSummary = Prisma.VenueBroadcastGetPayload<{
  include: {
    logs: {
      include: {
        venue: {
          select: {
            id: true
            name: true
            slug: true
            contactEmail: true
          }
        }
      }
    }
  }
}>

export interface DashboardBaseData {
  user: DashboardUser
}

export interface VenueManagerDashboardData extends DashboardBaseData {
  kind: 'venue_manager'
  venues: VenueManagerVenue[]
  favoritedEventRequests: EventRequestSummary[]
  stats: {
    totalVenues: number
    activeVenues: number
    totalInquiries: number
    totalFavorites: number
    totalInquiryGuests: number
  }
}

export interface AdminDashboardData extends DashboardBaseData {
  kind: 'admin'
  stats: {
    totalUsers: number
    totalPaidVenues: number
    newPaidVenues30: number
    totalEventRequests: number
    totalInquiries: number
  }
}

export interface UserDashboardData extends DashboardBaseData {
  kind: 'user'
  eventRequests: EventRequestSummary[]
  venueInquiries: VenueInquirySummary[]
  broadcasts: VenueBroadcastSummary[]
  stats: {
    activeRequests: number
    totalRequests: number
    totalInquiries: number
    totalBroadcasts: number
  }
}

export type DashboardData =
  | VenueManagerDashboardData
  | AdminDashboardData
  | UserDashboardData

export type DashboardUserDetail = Prisma.UserGetPayload<{
  include: {
    venues: {
      include: {
        _count: {
          select: {
            inquiries: true
            broadcastLogs: true
          }
        }
      }
    }
    eventRequests: { orderBy: { createdAt: "desc" }; take: 5 }
    venueInquiries: {
      orderBy: { createdAt: "desc" }
      take: 5
      include: {
        venue: {
          select: {
            name: true
            slug: true
          }
        }
      }
    }
  }
}>
