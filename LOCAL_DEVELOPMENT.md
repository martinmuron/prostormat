# Local Development Setup

This project uses SQLite for local development and PostgreSQL for production.

## Quick Start

1. **Setup local environment:**
   ```bash
   npm run dev:local
   ```
   This will:
   - Switch to SQLite schema
   - Reset and setup local database
   - Seed with test data
   - Start development server

2. **Test user credentials:**
   - Email: `test@test.com`
   - Password: `12345`

## Manual Setup (if needed)

1. **Switch to local SQLite database:**
   ```bash
   npm run db:setup:local
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Commands

- `npm run db:setup:local` - Setup SQLite for local development
- `npm run db:setup:production` - Setup PostgreSQL for production
- `npm run db:seed` - Seed database with test data
- `npm run db:push` - Push schema changes to database

## Environment Files

- `.env.local` - Local development (SQLite)
- `.env.example` - Production template (PostgreSQL)

## Key Differences

- **Local**: Uses SQLite with JSON strings for arrays
- **Production**: Uses PostgreSQL with native arrays

The application automatically handles these differences.