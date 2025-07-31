# Prostormat Development Guide

## Project Overview
Prostormat is a platform for finding and managing event spaces in Czech Republic. It connects venue owners with event organizers through a marketplace-style platform.

## Email Flow Admin Section

**CRITICAL REQUIREMENT**: Every email sent programmatically with Resend MUST be tracked in the "Email Flow" admin section.

**Admin Dashboard Location**: `/admin/email-flow`

**Purpose**: 
- Track all programmatic emails sent via Resend
- Never forget any email flows in the system
- Centralized monitoring of all email activities
- Debug email delivery issues

**Requirements for ALL new email implementations**:
1. **ALWAYS** add email tracking to the Email Flow system
2. Log email sends, deliveries, failures, and bounces
3. Include email type, recipient, timestamp, status
4. Update Email Flow admin dashboard to show new email types

## Mailing System

### Overview
The platform includes a comprehensive mailing system that automatically sends emails to venues when new event requests are created. This system uses Resend for email delivery and tracks all email communications.

### Email Types & Triggers

#### 1. Venue Broadcast Emails
**Trigger**: When a user creates an event request through the platform
**Recipients**: Matching venue owners/managers
**Template**: `generateVenueBroadcastEmail()` in `/src/lib/email-templates.ts`
**API**: `/api/venue-broadcast`

**When emails are sent**:
- User submits event request form
- System finds matching venues based on location, capacity, and event type
- Email sent to each matching venue's contact email
- All sends are logged in `VenueBroadcastLog` table

#### 2. Quick Request Emails  
**Trigger**: When a user submits a quick request form
**Recipients**: Matching venue owners/managers  
**API**: `/api/quick-request`

**When emails are sent**:
- User submits quick request form (rapid venue inquiry)
- System matches venues based on criteria
- Emails sent to matching venues
- Sends are tracked in broadcast system

### Database Tables

#### VenueBroadcast
Stores the main broadcast/campaign data:
- `id`, `userId`, `title`, `description`
- `eventType`, `eventDate`, `guestCount`
- `budgetRange`, `locationPreference`, `requirements` 
- `contactName`, `contactEmail`, `contactPhone`
- `sentVenues` (array of venue IDs)
- `createdAt`, `updatedAt`

#### VenueBroadcastLog
Tracks individual email sends:
- `id`, `broadcastId`, `venueId`
- `emailStatus` ('sent', 'failed', 'skipped', 'pending')
- `emailError` (error message if failed)
- `createdAt`

### Admin Dashboard Integration

The mailing system is integrated into the admin dashboard at `/admin/mailing` with:

**Statistics displayed**:
- Total broadcast campaigns (`totalBroadcasts`)
- Total emails sent (`totalEmailsSent`) 
- Email success rates and status breakdown
- Recent campaign timeline
- Daily email statistics (last 30 days)

**Admin dashboard cards updated**:
- Added mailing stats to main dashboard
- New "Mailing systém" management card
- Quick action button for mailing section

### Important Development Notes

**When adding new email triggers**:
1. Update this documentation with the new email type
2. Add tracking to `VenueBroadcast`/`VenueBroadcastLog` tables
3. **ADD TO EMAIL FLOW ADMIN SECTION** - This is mandatory!
4. Update admin dashboard stats API (`/api/admin/stats`)
5. Update mailing dashboard API (`/api/admin/mailing`)
6. Update Email Flow API (`/api/admin/email-flow`)
7. Test email delivery and tracking
8. Update admin UI to show new email types

**Email Service Configuration**:
- Uses Resend API (configured via `RESEND_API_KEY`)
- From address: `Prostormat <noreply@prostormat.cz>`
- Reply-to: `info@prostormat.cz`
- Email templates include HTML and plain text versions

### Testing
Always test email functionality in development:
- Check email templates render correctly
- Verify tracking logs are created
- Test both successful and failed scenarios
- Ensure admin dashboard reflects changes
- **Verify Email Flow admin section updates**

### File Locations
- Email templates: `/src/lib/email-templates.ts`
- Resend config: `/src/lib/resend.ts`
- Admin mailing page: `/src/app/admin/mailing/page.tsx`
- Mailing API: `/src/app/api/admin/mailing/route.ts`
- **Email Flow admin page: `/src/app/admin/email-flow/page.tsx`**
- **Email Flow API: `/src/app/api/admin/email-flow/route.ts`**
- Admin dashboard: `/src/components/dashboard/admin-dashboard.tsx`