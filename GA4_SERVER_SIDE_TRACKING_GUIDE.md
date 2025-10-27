# GA4 Server-Side Tracking Implementation Guide

## Overview

This guide explains how to implement server-side Google Analytics 4 tracking using the **Measurement Protocol API**, which is Google's equivalent to Meta's Conversions API.

---

## ✅ Benefits of Server-Side GA4 Tracking

1. **Ad Blocker Bypass**: Events are sent from your server, not the client browser
2. **More Accurate**: Not affected by client-side issues (network, JavaScript errors)
3. **Enhanced Data**: Can include server-only data (user IDs, transaction details)
4. **Privacy Compliant**: You control what data is sent
5. **Duplicate Prevention**: Combine with client-side tracking for best results

---

## 🔑 Step 1: Get GA4 API Credentials

### What You Need:
- **Measurement ID**: `G-5KYL3YYZL2` ✅ (you already have this)
- **API Secret**: 🔴 **You need to generate this**

### How to Get API Secret:

1. Go to **Google Analytics**: https://analytics.google.com/
2. Select your property (the one with `G-5KYL3YYZL2`)
3. Click **Admin** (gear icon, bottom left)
4. Under **Data collection and modification** → Click **Data Streams**
5. Click your web stream (prostormat.cz)
6. Scroll down to **Measurement Protocol API secrets**
7. Click **Create**
8. Name it: `Prostormat Server Tracking`
9. **Copy the API Secret** (format: `abc123XYZ-def456`)

⚠️ **IMPORTANT**: Save this secret somewhere safe - you can't view it again!

---

## 📦 Step 2: Add Environment Variables

### Local Development (.env.local):
```bash
# Add this line to your .env.local file:
GA4_API_SECRET=your-api-secret-here
```

### Production (Vercel):
```bash
# Add to all environments (Production, Preview, Development)
vercel env add GA4_API_SECRET

# When prompted, paste your API secret
# Select: Production, Preview, Development (all three)
```

Or use `print` to avoid newline issues:
```bash
print -n "your-api-secret-here" | vercel env add GA4_API_SECRET production
print -n "your-api-secret-here" | vercel env add GA4_API_SECRET preview
print -n "your-api-secret-here" | vercel env add GA4_API_SECRET development
```

---

## 🛠️ Step 3: Implementation in API Routes

### Current Setup (Client + Meta):
```typescript
// You already have this:
✅ Client-side GA4 tracking (browser)
✅ Meta Conversions API (server)
```

### New Setup (Client + Meta + GA4 Server):
```typescript
✅ Client-side GA4 tracking (browser)
✅ Meta Conversions API (server)
🆕 GA4 Measurement Protocol (server)
```

---

## 📝 Implementation Examples

### Example 1: Registration Tracking

**File**: `/src/app/api/auth/register/route.ts`

```typescript
import { trackRegistration } from "@/lib/meta-conversions-api"
import { trackGA4ServerRegistration } from "@/lib/ga4-server-tracking"

// After creating user successfully:
const user = await db.user.create({ /* ... */ })

// Track in Meta (existing) ✅
try {
  const [firstName, ...lastNameParts] = validatedData.name.split(' ')
  await trackRegistration({
    email: user.email,
    firstName: firstName,
    lastName: lastNameParts.join(' ') || undefined,
  }, request)
} catch (metaError) {
  console.error('Failed to track Meta registration:', metaError)
}

// Track in GA4 Server (NEW) 🆕
try {
  await trackGA4ServerRegistration({
    userId: user.id,
    email: user.email,
    method: 'email',
    request,
  })
} catch (ga4Error) {
  console.error('Failed to track GA4 registration:', ga4Error)
}

return NextResponse.json({ success: true, user })
```

---

### Example 2: Quick Request Tracking

**File**: `/src/app/api/quick-request/route.ts`

```typescript
import { trackBulkFormSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"

// After successful quick request submission:

// Track in Meta ✅
try {
  await trackBulkFormSubmit({
    email: validatedData.contactEmail,
    phone: validatedData.contactPhone,
    firstName: firstName,
    lastName: lastNameParts.join(' ') || undefined,
  }, {
    eventType: validatedData.eventType,
    guestCount: typeof validatedData.guestCount === 'number' ? validatedData.guestCount : Number(validatedData.guestCount) || undefined,
    locationPreference: validatedData.locationPreference,
    budgetRange: validatedData.budgetRange,
  }, request)
} catch (metaError) {
  console.error('Failed to track Meta bulk form submit:', metaError)
}

// Track in GA4 Server (NEW) 🆕
try {
  await trackGA4ServerLead({
    userId: session?.user?.id,
    formType: 'bulk_request',
    eventType: validatedData.eventType,
    guestCount: validatedData.guestCount,
    location: validatedData.locationPreference,
    budgetRange: validatedData.budgetRange,
    email: validatedData.contactEmail,
    request,
  })
} catch (ga4Error) {
  console.error('Failed to track GA4 lead:', ga4Error)
}

return NextResponse.json({
  success: true,
  broadcastId: broadcast.id,
  pendingCount: matchingVenues.length,
})
```

---

### Example 3: Payment Tracking

**File**: `/src/app/api/confirm-payment/route.ts`

```typescript
import { trackPayment, trackLocationRegistration } from "@/lib/meta-conversions-api"
import { trackGA4ServerPayment, trackGA4ServerLocationRegistration } from "@/lib/ga4-server-tracking"

// After successful payment:

// Track payment in Meta ✅
try {
  const [firstName, ...lastNameParts] = (normalizedName || '').split(' ')
  await trackPayment({
    email: venueData.userEmail,
    phone: normalizedPhone || undefined,
    firstName: firstName || undefined,
    lastName: lastNameParts.join(' ') || undefined,
  }, paymentIntent.amount / 100, 'CZK', request)
} catch (metaError) {
  console.error('Failed to track Meta payment:', metaError)
}

// Track payment in GA4 Server (NEW) 🆕
try {
  await trackGA4ServerPayment({
    userId: userId,
    transactionId: paymentIntentId,
    value: paymentIntent.amount / 100,
    currency: 'CZK',
    venueName: venueData.name,
    venueId: venueId,
    subscription: true,
    request,
  })
} catch (ga4Error) {
  console.error('Failed to track GA4 payment:', ga4Error)
}

// Track location registration in Meta ✅
try {
  await trackLocationRegistration({
    email: venueData.userEmail,
    phone: normalizedPhone || undefined,
    firstName: firstName || undefined,
    lastName: lastNameParts.join(' ') || undefined,
  }, venueData.name, request)
} catch (metaError) {
  console.error('Failed to track Meta location registration:', metaError)
}

// Track location registration in GA4 Server (NEW) 🆕
try {
  await trackGA4ServerLocationRegistration({
    userId: userId,
    venueName: venueData.name,
    venueId: venueId,
    mode: 'new',
    request,
  })
} catch (ga4Error) {
  console.error('Failed to track GA4 location registration:', ga4Error)
}
```

---

### Example 4: Venue Inquiry Tracking

**File**: `/src/app/api/venues/inquiries/route.ts`

```typescript
import { trackLokaceSubmit } from "@/lib/meta-conversions-api"
import { trackGA4ServerLead } from "@/lib/ga4-server-tracking"

// After creating inquiry:
const inquiry = await db.venueInquiry.create({ /* ... */ })

// Track in Meta ✅
try {
  const [firstName, ...lastNameParts] = validatedData.name.split(' ')
  await trackLokaceSubmit({
    email: validatedData.email,
    phone: validatedData.phone,
    firstName: firstName,
    lastName: lastNameParts.join(' ') || undefined,
  }, venue.name, request)
} catch (metaError) {
  console.error('Failed to track Meta lokace submit:', metaError)
}

// Track in GA4 Server (NEW) 🆕
try {
  await trackGA4ServerLead({
    userId: session?.user?.id,
    formType: 'venue_inquiry',
    venueName: venue.name,
    venueId: venue.id,
    guestCount: validatedData.guestCount || undefined,
    email: validatedData.email,
    request,
  })
} catch (ga4Error) {
  console.error('Failed to track GA4 venue inquiry:', ga4Error)
}
```

---

## 🧪 Step 4: Testing Your Implementation

### 1. Test Locally First

```bash
# Make sure you have GA4_API_SECRET in .env.local
npm run dev

# Submit a form (registration, quick request, etc.)
# Check your terminal for logs:
# ✅ "GA4 server event sent successfully: sign_up"
# ❌ "GA4_API_SECRET not configured" (if secret missing)
```

### 2. Use GA4 Validation API

```typescript
// In your API route (temporary for testing):
import { validateGA4Event } from "@/lib/ga4-server-tracking"

const validation = await validateGA4Event({
  client_id: 'test.123',
  user_id: 'user-123',
  events: [{
    name: 'sign_up',
    params: { method: 'email' }
  }]
})

console.log('Validation result:', validation)
// Shows validation errors without sending to GA4
```

### 3. Check GA4 Real-Time Reports

1. Go to **Google Analytics** → Your property
2. Click **Reports** → **Realtime**
3. Submit a form on your site
4. Event should appear within **10-30 seconds**

---

## 📊 Tracking Summary

### Events Now Tracked:

| Event | Client-Side | Server-Side Meta | Server-Side GA4 |
|-------|-------------|------------------|-----------------|
| PageView | ✅ | ❌ | 🆕 Optional |
| Registration | ✅ | ✅ | 🆕 |
| Payment | ✅ | ✅ | 🆕 |
| LocationRegistration | ✅ | ✅ | 🆕 |
| BulkFormSubmit | ✅ | ✅ | 🆕 |
| OrganizaceSubmit | ✅ | ✅ | 🆕 |
| LokaceSubmit | ✅ | ✅ | 🆕 |

---

## 🎯 Client ID Management

### What is Client ID?

The `client_id` is a unique identifier for each user/browser. GA4 uses it to:
- Track user journeys across sessions
- Attribution (which marketing source brought the user)
- Deduplicate events between client and server

### How to Get Client ID:

#### Option 1: From GA4 Cookie (Recommended)
```typescript
// The library already does this for you!
import { extractClientIdFromCookie } from "@/lib/ga4-server-tracking"

const gaCookie = request.headers.get('cookie')?.match(/_ga=([^;]+)/)?.[1]
const clientId = extractClientIdFromCookie(gaCookie)
```

#### Option 2: Generate New (Fallback)
```typescript
import { generateClientId } from "@/lib/ga4-server-tracking"

const clientId = generateClientId()
// Returns: "1234567890.abc123xyz"
```

#### Option 3: From Request Headers
```typescript
// If you're setting client_id in a custom header:
const clientId = request.headers.get('x-ga-client-id') || generateClientId()
```

---

## ⚡ Best Practices

### 1. **Always Track Both Client and Server**
- Client-side: User interactions, page views, scrolls
- Server-side: Purchases, registrations, API events

### 2. **Use Same Client ID**
- Extract from `_ga` cookie when possible
- This ensures GA4 can match client and server events

### 3. **Don't Block on Failures**
```typescript
try {
  await trackGA4ServerEvent(/* ... */)
} catch (error) {
  console.error('Failed to track:', error)
  // Don't fail the user's request if tracking fails!
}
```

### 4. **Test with Validation API First**
```typescript
// Use validation endpoint during development
const result = await validateGA4Event(/* ... */)
console.log('Validation:', result)
```

### 5. **Monitor Your Logs**
```bash
# Check Vercel logs for tracking issues
vercel logs --prod --follow
```

---

## 🔍 Debugging

### Issue: Events not appearing in GA4

**Check:**
1. ✅ API Secret is correct (regenerate if needed)
2. ✅ Measurement ID is correct: `G-5KYL3YYZL2`
3. ✅ Environment variable is set in Vercel
4. ✅ Check Vercel logs for errors
5. ✅ Use validation API to test

### Issue: "GA4_API_SECRET not configured"

**Solution:**
```bash
# Check if variable exists
vercel env ls | grep GA4

# If missing, add it
vercel env add GA4_API_SECRET
```

### Issue: Events duplicated

**Cause**: Client-side and server-side both firing

**Solution**: Use same `client_id` for both - GA4 will deduplicate automatically

---

## 📚 Resources

- [GA4 Measurement Protocol Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference/events)
- [Validation Server](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events)

---

## ✅ Deployment Checklist

Before deploying server-side GA4 tracking:

- [ ] Generated GA4 API Secret
- [ ] Added `GA4_API_SECRET` to Vercel (all environments)
- [ ] Tested locally with validation API
- [ ] Added tracking to all API routes
- [ ] Checked for console errors
- [ ] Verified events in GA4 Real-Time
- [ ] Monitored for duplicates
- [ ] Documented any custom events

---

## 🎉 You're Done!

You now have **triple tracking**:
1. ✅ Client-side GA4 (browser events)
2. ✅ Server-side Meta (conversions)
3. 🆕 Server-side GA4 (conversions)

This gives you:
- **Maximum tracking coverage**
- **Ad blocker resistance**
- **Accurate conversion data**
- **Full attribution**

Deploy and watch your GA4 data quality improve! 🚀
