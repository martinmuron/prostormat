#!/bin/bash

echo "🚀 Starting local development with PostgreSQL..."

# Check if PostgreSQL is running
if ! brew services list | grep -q "postgresql@15.*started"; then
    echo "📦 Starting PostgreSQL service..."
    brew services start postgresql@15
fi

# Set environment to use local PostgreSQL
export DATABASE_URL="postgresql://martinmuron@localhost:5432/prostormat_dev"

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Start development server
echo "🌟 Starting Next.js development server..."
npm run dev 