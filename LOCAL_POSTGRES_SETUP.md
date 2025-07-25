# Local PostgreSQL Development Setup

This guide helps you set up a local PostgreSQL database for development, so you can run the application locally with the same database setup as production.

## Prerequisites

- macOS with Homebrew installed
- Node.js and npm

## Quick Setup

If you followed the setup process, PostgreSQL should already be installed and configured. Here's how to use it:

### Start Development Server with PostgreSQL

```bash
# Option 1: Use the helper script
npm run dev:postgres

# Option 2: Manual setup
export DATABASE_URL="postgresql://martinmuron@localhost:5432/prostormat_dev"
npm run dev
```

### Database Management

```bash
# Reset database (drop, recreate, push schema, seed data)
npm run db:reset

# Just push schema changes
npx prisma db push

# Seed database with sample data
npm run db:seed

# View database in Prisma Studio
npx prisma studio
```

## Installation (if not already done)

### 1. Install PostgreSQL

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install PostgreSQL 15
brew install postgresql@15

# Add PostgreSQL to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

### 2. Start PostgreSQL Service

```bash
# Start PostgreSQL and enable auto-start on boot
brew services start postgresql@15

# Create development database
createdb prostormat_dev
```

### 3. Configure Environment

Update your `.env` or `.env.local` file:

```bash
DATABASE_URL="postgresql://martinmuron@localhost:5432/prostormat_dev"
```

### 4. Initialize Database

```bash
# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed
```

## Sample Login Credentials

After seeding, you can log in with:

- **Admin**: admin@prostormat.cz / admin123
- **User**: user@example.com / user123
- **Manager**: terasa@example.com / manager123

## PostgreSQL Management

### Check Service Status
```bash
brew services list | grep postgresql
```

### Start/Stop PostgreSQL
```bash
# Start
brew services start postgresql@15

# Stop
brew services stop postgresql@15

# Restart
brew services restart postgresql@15
```

### Database Operations
```bash
# Connect to database
psql prostormat_dev

# List databases
psql -l

# Drop database
dropdb prostormat_dev

# Create database
createdb prostormat_dev
```

## Troubleshooting

### PostgreSQL Connection Issues

1. **Check if PostgreSQL is running:**
   ```bash
   brew services list | grep postgresql
   ```

2. **Check if database exists:**
   ```bash
   psql -l | grep prostormat_dev
   ```

3. **Recreate database if needed:**
   ```bash
   dropdb prostormat_dev
   createdb prostormat_dev
   npx prisma db push
   ```

### Environment Variable Issues

Make sure your `DATABASE_URL` is correctly set:
```bash
echo $DATABASE_URL
```

Should output: `postgresql://martinmuron@localhost:5432/prostormat_dev`

## Benefits of Local PostgreSQL

✅ **Same as Production**: Use PostgreSQL locally just like on Railway  
✅ **Full Features**: Arrays, JSON, advanced queries work the same  
✅ **Better Testing**: Test PostgreSQL-specific features locally  
✅ **No Sync Issues**: No need to convert between SQLite and PostgreSQL  
✅ **Performance**: Better performance for complex queries  

## Development Workflow

1. **Start development**: `npm run dev:postgres`
2. **Make schema changes**: Edit `prisma/schema.prisma`
3. **Apply changes**: `npx prisma db push`
4. **Reset when needed**: `npm run db:reset`
5. **View data**: `npx prisma studio`

The application will automatically deploy to Railway when you push to GitHub, using the production PostgreSQL database. 