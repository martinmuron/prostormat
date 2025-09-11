# 🚀 Deployment Guide - Prostormat

## Vercel Deployment with prostormat.cz Domain

### Prerequisites
- Vercel account
- Forpsi domain (prostormat.cz)
- GitHub repository
- Supabase database

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

**⚠️ SECURITY WARNING: Never commit these variables to git!**

In your deployment environment, add these environment variables:

Use Vercel CLI to set environment variables:

```bash
vercel env add DATABASE_URL production
vercel env add POSTGRES_PRISMA_URL production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# ... add all other required variables
```

Required environment variables:
```env
# Database (Supabase)
DATABASE_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_URL=https://prostormat.cz
NEXTAUTH_SECRET=your-nextauth-secret-key

# Email (Resend)
RESEND_API_KEY=re_...

# Stripe (if using payments)
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 5: Deploy Application

1. **Deploy to Vercel**:
   ```bash
   vercel deploy --prod
   ```

2. **Vercel will automatically**:
   - Install dependencies
   - Run `npm run build`
   - Generate Prisma client
   - Deploy to CDN

### Step 6: Set Up Database Schema

1. **Push database schema** (if needed):
   ```bash
   # Connect to your project first
   vercel env pull .env.local
   npx prisma db push
   ```

### Step 7: Configure Custom Domain (prostormat.cz)

#### In Vercel Dashboard:

1. Go to your project settings
2. Click "Domains" tab
3. Add custom domain: `prostormat.cz`
4. Add another domain: `www.prostormat.cz`
5. Vercel will provide DNS instructions

#### In Forpsi DNS Management:

1. **Login to Forpsi** customer panel
2. **Go to DNS management** for prostormat.cz
3. **Add DNS records** as instructed by Vercel:

   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   TTL: 3600
   
   Type: A
   Name: @
   Target: 76.76.19.19 (or as provided by Vercel)
   TTL: 3600
   ```

4. **Save changes** - DNS propagation takes 5-60 minutes

### Step 8: Verify Deployment

1. **Check application**: https://prostormat.cz
2. **Test database connectivity**: Check venue listings
3. **Test authentication**: Create account and login
4. **Test functionality**: Browse venues, create requests

### Step 9: SSL Certificate

Vercel automatically provides SSL certificates for custom domains:
- https://prostormat.cz ✅
- https://www.prostormat.cz ✅

## Environment Management

### Adding New Environment Variables

```bash
# Add to production
vercel env add VARIABLE_NAME production

# Add to preview
vercel env add VARIABLE_NAME preview

# Add to development
vercel env add VARIABLE_NAME development
```

### Updating Environment Variables

```bash
# Remove old variable
vercel env rm OLD_VARIABLE_NAME production

# Add new variable
vercel env add NEW_VARIABLE_NAME production
```

## Troubleshooting

### Build Errors
- Check Vercel build logs in dashboard
- Ensure all environment variables are set
- Verify TypeScript compilation locally

### Database Issues
- Confirm DATABASE_URL is correct
- Check Supabase project status
- Verify table names use `prostormat_` prefix

### Domain Issues
- Verify DNS records in Forpsi
- Wait for DNS propagation (up to 24 hours)
- Check Vercel domain configuration

### SSL Issues
- Ensure domain is properly configured in Vercel
- SSL certificates are automatic
- May take up to 1 hour to provision

## Monitoring

- **Vercel Dashboard**: Monitor deployments and analytics
- **Supabase Dashboard**: Monitor database performance
- **Application Health**: Set up uptime monitoring
- **Error Tracking**: Consider adding Sentry integration

## Security Best Practices

- ✅ Never commit environment variables to git
- ✅ Use Vercel CLI for environment variable management
- ✅ Rotate API keys regularly
- ✅ Monitor for security vulnerabilities
- ✅ Use HTTPS for all communications

---

🎉 **Your Prostormat application should now be live at https://prostormat.cz!**