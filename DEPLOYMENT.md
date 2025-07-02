# 🚀 Deployment Guide - Prostormat

## Railway Deployment with prostormat.cz Domain

### Prerequisites
- Railway account
- Forpsi domain (prostormat.cz)
- GitHub repository

### Step 1: Prepare Repository

1. **Initialize Git and push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Prostormat MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/prostormat.git
   git push -u origin main
   ```

### Step 2: Create Railway Project

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and create project**:
   ```bash
   railway login
   railway init
   ```

3. **Connect GitHub repository** in Railway dashboard:
   - Go to railway.app
   - Create new project
   - Connect GitHub repository

### Step 3: Set Up PostgreSQL Database

1. **Add PostgreSQL service**:
   - In Railway dashboard, click "Add Service"
   - Select "PostgreSQL"
   - Railway will automatically create DATABASE_URL

2. **Copy DATABASE_URL** from Railway environment variables

### Step 4: Configure Environment Variables

In Railway project settings, add these environment variables:

```env
# Database (automatically provided by Railway PostgreSQL service)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://prostormat.cz
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars

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

1. **Trigger deployment**:
   ```bash
   railway up
   ```

2. **Wait for build** - Railway will:
   - Install dependencies
   - Run `npm run build`
   - Generate Prisma client
   - Deploy application

### Step 6: Set Up Database

1. **Run database migrations**:
   ```bash
   railway run npx prisma db push
   ```

2. **Seed with sample data**:
   ```bash
   railway run npx prisma db seed
   ```

### Step 7: Configure Custom Domain (prostormat.cz)

#### In Railway Dashboard:

1. Go to your project settings
2. Click "Domains" tab
3. Add custom domain: `prostormat.cz`
4. Add another domain: `www.prostormat.cz`
5. Copy the provided CNAME target (e.g., `your-project.railway.app`)

#### In Forpsi DNS Management:

1. **Login to Forpsi** customer panel
2. **Go to DNS management** for prostormat.cz
3. **Add DNS records**:

   ```
   Type: CNAME
   Name: www
   Target: your-project.railway.app
   TTL: 3600
   
   Type: A (or CNAME if supported)
   Name: @
   Target: your-project.railway.app (or Railway IP)
   TTL: 3600
   ```

4. **Save changes** - DNS propagation takes 5-60 minutes

### Step 8: Update Environment Variables

Once domain is working, update in Railway:
```env
NEXTAUTH_URL=https://prostormat.cz
```

### Step 9: Verify Deployment

1. **Check application**: https://prostormat.cz
2. **Test authentication**: Create account and login
3. **Test functionality**: Browse venues, create requests
4. **Check admin access**: Login with `admin@prostormat.cz` / `admin123`

### Step 10: SSL Certificate

Railway automatically provides SSL certificates for custom domains. Once DNS propagates:
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
- Run `railway run npx prisma db push` to sync schema
- Check PostgreSQL service status in Railway

### Domain Issues
- Verify DNS records in Forpsi
- Wait for DNS propagation (up to 24 hours)
- Check Railway domain configuration

### SSL Issues
- Ensure domain is properly configured
- SSL certificates are automatic via Railway
- May take up to 1 hour to provision

## Monitoring

- **Railway Dashboard**: Monitor deployments and logs
- **Application Health**: Set up uptime monitoring
- **Error Tracking**: Consider adding Sentry integration

---

🎉 **Your Prostormat application should now be live at https://prostormat.cz!**