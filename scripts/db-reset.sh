#!/bin/bash

echo "🗄️ Resetting local PostgreSQL database..."

# Set environment to use local PostgreSQL
export DATABASE_URL="postgresql://martinmuron@localhost:5432/prostormat_dev"

# Drop and recreate database
echo "🔄 Recreating database..."
dropdb prostormat_dev 2>/dev/null || true
createdb prostormat_dev

# Push schema and seed
echo "📦 Pushing schema..."
npx prisma db push

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database reset complete!"
echo ""
echo "Sample login credentials:"
echo "Admin: admin@prostormat.cz / admin123"
echo "User: user@example.com / user123" 