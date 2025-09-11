# 🚀 Deployment Guide - Prostormat

## Supabase Deployment with prostormat.cz Domain

### Prerequisites
- Supabase account
- Forpsi domain (prostormat.cz)
- GitHub repository

### Step 1: Set Up Supabase Project

1. **Create Supabase project**:
   - Go to supabase.com
   - Create new project
   - Choose region and database password

2. **Get database credentials**:
   - Go to Project Settings → Database
   - Copy connection string and credentials

### Step 2: Configure Database

**IMPORTANT: Supabase Database Schema**
- All tables use the `prostormat_` prefix (e.g., `prostormat_venues`, `prostormat_users`)
- When working with the database directly, always reference the correct table names
- The Prisma schema models map to these prefixed tables in production

### Step 3: Set Up Database Schema

1. **Run migrations**:
   ```bash
   npx prisma db push
   ```

2. **Seed with real venues**:
   ```bash
   npx prisma db seed
   ```

### Step 4: Configure Environment Variables

In your deployment environment, add these environment variables:

```env
# Database (from Supabase project settings)
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=https://prostormat.cz
NEXTAUTH_SECRET=your-nextauth-secret-key

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (for future payments)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
RESEND_API_KEY=re_...
```

### Step 5: Deploy Application

1. **Deploy to your hosting platform** (Vercel, Netlify, etc.)
2. **Configure build settings**:
   - Build command: `npm run build`
   - Output directory: `.next`

### Step 6: Database Management

**Remember: Supabase uses `prostormat_` table prefixes**

1. **Check database structure**:
   ```bash
   npx prisma db pull
   ```

2. **Run migrations**:
   ```bash
   npx prisma db push
   ```

### Step 7: Configure Custom Domain (prostormat.cz)

#### In your hosting platform:

1. Go to your project settings
2. Add custom domain: `prostormat.cz`
3. Add another domain: `www.prostormat.cz`
4. Copy the provided CNAME target

#### In Forpsi DNS Management:

1. **Login to Forpsi** customer panel
2. **Go to DNS management** for prostormat.cz
3. **Add DNS records**:

   ```
   Type: CNAME
   Name: www
   Target: your-deployment-url
   TTL: 3600
   
   Type: A (or CNAME if supported)
   Name: @
   Target: your-deployment-url
   TTL: 3600
   ```

4. **Save changes** - DNS propagation takes 5-60 minutes

### Step 8: Update Environment Variables

Once domain is working, update:
```env
NEXTAUTH_URL=https://prostormat.cz
```

### Step 9: Verify Deployment

1. **Check application**: https://prostormat.cz
2. **Test authentication**: Create account and login
3. **Test functionality**: Browse venues, create requests
4. **Check admin access**: Login with `admin@prostormat.cz` / `admin123`

### Step 10: SSL Certificate

Most hosting platforms automatically provide SSL certificates for custom domains. Once DNS propagates:
- https://prostormat.cz ✅
- https://www.prostormat.cz ✅

## Sample Accounts Created by Seed

After running the seed script, you'll have these test accounts:

### Admin Account
- **Email**: admin@prostormat.cz
- **Password**: admin123
- **Role**: admin

### Venue Manager Accounts
- **Email**: terasa@example.com
- **Password**: manager123
- **Role**: venue_manager

- **Email**: galerie@example.com  
- **Password**: manager123
- **Role**: venue_manager

- **Email**: skybar@example.com
- **Password**: manager123
- **Role**: venue_manager

### Regular User Account
- **Email**: user@example.com
- **Password**: user123
- **Role**: user

## Post-Deployment Tasks

1. **Change default passwords** for all sample accounts
2. **Add real venue content** and images
3. **Configure Google OAuth** (optional)
4. **Set up Stripe** for payments (future feature)
5. **Monitor application** with Railway metrics

## Troubleshooting

### Build Errors
- Check Railway build logs
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Database Issues
- Confirm DATABASE_URL is correct
- Run `npx prisma db push` to sync schema
- Check Supabase project status and connection

### Domain Issues
- Verify DNS records in Forpsi
- Wait for DNS propagation (up to 24 hours)
- Check hosting platform domain configuration

### SSL Issues
- Ensure domain is properly configured
- SSL certificates are automatic via most hosting platforms
- May take up to 1 hour to provision

## Monitoring

- **Hosting Dashboard**: Monitor deployments and logs
- **Application Health**: Set up uptime monitoring
- **Error Tracking**: Consider adding Sentry integration

---

🎉 **Your Prostormat application should now be live at https://prostormat.cz!**