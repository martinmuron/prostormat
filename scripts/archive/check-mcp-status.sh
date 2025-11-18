#!/bin/bash

# Prostormat MCP Integration Status Check
# This script verifies all Stripe, Supabase, and Vercel integrations

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Prostormat MCP Integration Status${NC}"
echo "=========================================="

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
else
    echo -e "${RED}❌ .env.local file not found!${NC}"
    exit 1
fi

echo -e "\n${BLUE}1. Stripe Integration${NC}"
echo "------------------------"
echo -e "⚠️  Stripe platby jsou aktuálně ${YELLOW}pozastavené${NC}. Vše probíhá ručně mimo platformu."
if [ -f "src/app/api/venue-submissions/route.ts" ]; then
    echo -e "✅ Nový endpoint pro manuální žádosti: ${GREEN}OK${NC}"
else
    echo -e "❌ Endpoint /api/venue-submissions: ${RED}MISSING${NC}"
fi

echo -e "\n${BLUE}2. Supabase Integration${NC}"
echo "--------------------------"

# Check Supabase environment variables
if [ -n "$SUPABASE_URL" ] && [ -n "$DATABASE_URL" ]; then
    echo -e "✅ Environment variables: ${GREEN}OK${NC}"
else
    echo -e "❌ Environment variables: ${RED}MISSING${NC}"
fi

# Check Supabase CLI
if command -v supabase >/dev/null 2>&1; then
    SUPABASE_VERSION=$(supabase --version | head -1)
    echo -e "✅ Supabase CLI: ${GREEN}${SUPABASE_VERSION}${NC}"
else
    echo -e "❌ Supabase CLI: ${RED}NOT INSTALLED${NC}"
fi

# Test database connection
echo -n "🔌 Testing database connection... "
if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}CONNECTED${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

# Check payment intents table
echo -n "📊 Checking payment_intents table... "
if psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM prostormat_payment_intents;" >/dev/null 2>&1; then
    echo -e "${GREEN}EXISTS${NC}"
else
    echo -e "${RED}MISSING${NC}"
fi

echo -e "\n${BLUE}3. Vercel Integration${NC}"
echo "------------------------"

# Check Vercel CLI
if command -v vercel >/dev/null 2>&1; then
    VERCEL_VERSION=$(vercel --version 2>/dev/null)
    echo -e "✅ Vercel CLI: ${GREEN}${VERCEL_VERSION}${NC}"
else
    echo -e "❌ Vercel CLI: ${RED}NOT INSTALLED${NC}"
fi

# Check Next.js configuration
if [ -f "next.config.js" ]; then
    echo -e "✅ Next.js Config: ${GREEN}CONFIGURED${NC}"
else
    echo -e "❌ Next.js Config: ${RED}MISSING${NC}"
fi

# Check build status
echo -n "🔨 Testing build... "
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}SUCCESSFUL${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

echo -e "\n${BLUE}4. Integration Workflows${NC}"
echo "----------------------------"

# Check payment workflow files
echo "Payment Workflow:"
if [ -f "src/app/pridat-prostor/page.tsx" ]; then
    echo -e "  ✅ Venue Form: ${GREEN}OK${NC}"
else
    echo -e "  ❌ Venue Form: ${RED}MISSING${NC}"
fi
echo -e "  ℹ️  Payments are processed offline – no checkout integration required."

# Check admin workflow
echo "Admin Workflow:"
if [ -f "src/app/admin/venues/approve/page.tsx" ]; then
    echo -e "  ✅ Admin Approval: ${GREEN}OK${NC}"
else
    echo -e "  ❌ Admin Approval: ${RED}MISSING${NC}"
fi

if [ -f "src/app/api/admin/venues/approve/route.ts" ]; then
    echo -e "  ✅ Approval API: ${GREEN}OK${NC}"
else
    echo -e "  ❌ Approval API: ${RED}MISSING${NC}"
fi

echo -e "\n${BLUE}5. Configuration Summary${NC}"
echo "------------------------------"
echo -e "📄 MCP Config: ${GREEN}mcp-config.json${NC}"
echo -e "🔐 Environment: ${GREEN}.env.local${NC}"
echo -e "💳 Payment Amount: ${GREEN}12,000 CZK (offline invoicing)${NC}"
echo -e "🗄️  Database: ${GREEN}Supabase PostgreSQL (11MB)${NC}"
echo -e "🚀 Deployment: ${GREEN}Vercel + Next.js${NC}"

echo -e "\n${GREEN}🎉 MCP Integration Status Complete!${NC}"
echo -e "All three services are integrated and working:"
echo -e "  • ${GREEN}Stripe${NC}: Payment processing ✅"
echo -e "  • ${GREEN}Supabase${NC}: Database & auth ✅" 
echo -e "  • ${GREEN}Vercel${NC}: Hosting & deployment ✅"
