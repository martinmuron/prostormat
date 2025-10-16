# Prostormat Development Guide

## Project Overview
Prostormat is a platform for finding and managing event spaces in Czech Republic. It connects venue owners with event organizers through a marketplace-style platform.

## 🔒 CRITICAL SECURITY REQUIREMENTS

**NEVER COMMIT SENSITIVE INFORMATION TO GIT**:
- ❌ **NO passwords, API keys, tokens, or credentials in code**
- ❌ **NO sensitive data in git commits or commit messages**
- ❌ **NO database credentials in repository files**
- ❌ **NO third-party service keys in source code**
- ❌ **NO API endpoints with embedded credentials**

**ALWAYS use environment variables**:
- ✅ Store all secrets in `.env.local` (never commit this file)
- ✅ Use `process.env.VARIABLE_NAME` in code
- ✅ Document required environment variables in `.env.example`
- ✅ Use placeholder values in examples (e.g., `your-api-key-here`)

**Git commit security**:
- ✅ Review all changes before committing with `git diff --cached`
- ✅ Never mention actual credentials in commit messages
- ✅ Use `.gitignore` to exclude sensitive files (`.env.local`, `.env`)
- ✅ Double-check staging area before pushing

**Deployment security**:
- ✅ Set environment variables in Vercel dashboard, not in code
- ✅ Use Vercel CLI `vercel env` commands for secure variable management
- ✅ Rotate credentials immediately if accidentally exposed
- ✅ Use different credentials for development and production

**If credentials are accidentally exposed**:
1. **IMMEDIATELY** rotate/regenerate all exposed credentials
2. Use `git reset --hard` or `git filter-branch` to remove from history
3. Update all affected services with new credentials
4. Review and strengthen security practices
5. Never push exposed credentials to remote repositories

## 🗄️ CRITICAL DATABASE INFORMATION

**Supabase Production Database**:
- **All tables use `prostormat_` prefix** (e.g., `prostormat_venues`, `prostormat_users`)
- **Never forget the prefix** when writing raw SQL queries or direct database operations
- **Prisma models map to prefixed tables** in production environment
- **Always reference correct table names** when debugging or managing data

**CRITICAL DATABASE CONNECTION**:
- **ALWAYS use port 5432 (direct connection)** for production database operations
- ❌ **DO NOT use port 6543 (pgbouncer)** - this is NOT the live database
- ✅ Correct: `DATABASE_URL="postgres://username:PASSWORD@host.supabase.com:5432/postgres"`
- ❌ Wrong: `DATABASE_URL="postgres://username:PASSWORD@host.supabase.com:6543/postgres"` (pgbouncer - not live)

**Production Scripts Template**:
```bash
# ALWAYS use this connection string for production scripts (get from .env.local):
DATABASE_URL="postgres://username:PASSWORD@host.supabase.com:5432/postgres" npx tsx scripts/your-script.ts
```

**Common Tables**:
- `prostormat_venues` - Venue listings
- `prostormat_users` - User accounts
- `prostormat_venue_inquiries` - Venue contact requests
- `prostormat_venue_broadcasts` - Email broadcast campaigns
- `prostormat_venue_broadcast_logs` - Email send tracking

**When working with database**:
- ✅ Use: `SELECT * FROM prostormat_venues`
- ❌ Never: `SELECT * FROM venues`
- ✅ Always check table names with: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`

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
**Trigger**: When a user submits a quick request form at `/rychla-poptavka`
**Recipients**: Matching venue owners/managers (sent to `venue.contactEmail`)
**Template**: `generateQuickRequestVenueNotificationEmail()` in `/src/lib/email-templates.ts`
**API**: `/api/quick-request`

**When emails are sent**:
- User submits quick request form (rapid venue inquiry)
- System finds venues matching: location preference + active status + has contactEmail
- Email sent to each venue's `contactEmail` (NOT manager email)
- Tracked in both `VenueBroadcastLog` and `EmailFlowLog` tables
- Resend email ID stored for delivery tracking

**Matching criteria**:
- Venue status = "active"
- Venue address contains location preference (case-insensitive)
- Venue has contactEmail (not null)
- Venue has capacity information (standing OR seated capacity > 0)

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