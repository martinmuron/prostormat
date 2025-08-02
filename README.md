# Prostormat - Premium B2B Marketplace for Event Venues in Prague

A modern Next.js application for connecting event organizers with curated venue listings in Prague, Czech Republic.

## 🚀 Features

- **Apple-inspired Design System** - Clean, minimalist UI with Czech localization
- **Venue Listings** - Search, filter, and browse premium event spaces
- **Event Request Board** - Public requests with direct contact information
- **User Dashboards** - Different views for users, venue managers, and admins
- **Authentication** - Email/password and Google OAuth with NextAuth.js
- **Direct Communication** - No middleman, direct contact between parties
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom Apple design system
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Radix UI primitives
- **Payments**: Stripe (for venue subscriptions)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd prostormat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/prostormat"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   
   # Stripe
   STRIPE_PUBLISHABLE_KEY=""
   STRIPE_SECRET_KEY=""
   ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

**IMPORTANT**: All database tables MUST use the `prostormat_` prefix to ensure multi-tenancy support when sharing Supabase databases with other projects.

The application includes the following main entities:

- **Users** (`prostormat_users`) - Event organizers, venue managers, and admins
- **Venues** (`prostormat_venues`) - Event spaces with details, images, and pricing
- **Event Requests** (`prostormat_event_requests`) - Public requests with contact information
- **Venue Inquiries** (`prostormat_venue_inquiries`) - Direct contact forms to venues
- **Subscriptions** (`prostormat_subscriptions`) - Stripe subscriptions for venue listings

All Prisma models use the `@@map()` directive to enforce the `prostormat_` table prefix.

## 🔐 User Roles

- **User** - Event organizers who create requests and contact venues
- **Venue Manager** - Venue owners who manage listings and receive inquiries
- **Admin** - Platform administrators with full access

## 📱 Pages Structure

### Public Pages
- `/` - Homepage with hero and featured venues
- `/prostory` - Venue listings with search and filters
- `/prostory/[slug]` - Individual venue detail pages
- `/pozadavky` - Veřejné zakázky board
- `/pozadavky/novy` - Create new Veřejné zakázky (auth required)

### Authentication
- `/prihlaseni` - Sign in page
- `/registrace` - Registration page

### Dashboard (Auth Required)
- `/dashboard` - Role-based dashboard
- Various role-specific dashboard pages

## 🌐 Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard or via CLI:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   ```

### Domain Setup (prostormat.cz with Forpsi)

1. **Configure DNS in Forpsi**:
   - Add CNAME record: `www` → `your-vercel-domain.vercel.app`
   - Add A record: `@` → Vercel IP (or use CNAME flattening)

2. **Configure custom domain in Vercel**:
   - Go to your Vercel project dashboard
   - Add custom domain: `prostormat.cz` and `www.prostormat.cz`
   - Update `NEXTAUTH_URL` to `https://prostormat.cz`

## 🎨 Design System

The application uses an Apple-inspired design system with:

- **Typography**: SF Pro Display equivalent fonts
- **Colors**: Grayscale palette with black/white primary colors
- **Components**: Rounded corners, subtle shadows, clean layouts
- **Responsive**: Mobile-first approach

## 📊 Sample Data

The seed script creates:
- Admin user: `admin@prostormat.cz` / `admin123`
- 3 venue managers with sample venues
- Sample event requests
- Regular user account

## 🛡️ Security

- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Input validation with Zod
- SQL injection protection with Prisma

## 📈 Future Enhancements

- Stripe payment integration for venue subscriptions
- Email notifications with Resend
- Advanced analytics dashboard
- Multi-language support
- Content management system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary software for Prostormat.

---

Built with ❤️ for the Prague event community# Database fixed - venues now showing on production
