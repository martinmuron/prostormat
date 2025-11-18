#!/bin/bash

# Quick script to test venue URLs from sitemap for 404 errors
# Usage: bash scripts/test-venue-404s.sh

echo "🔍 Testing venue URLs from sitemap for 404 errors..."
echo ""

# Fetch sitemap and extract venue URLs
VENUE_URLS=$(curl -s https://prostormat.cz/sitemap.xml | grep -o 'https://prostormat.cz/prostory/[^<]*' | head -50)

TOTAL=0
NOT_FOUND=0
HAS_NOINDEX=0

echo "Testing first 50 venue URLs from sitemap..."
echo "================================================"
echo ""

for URL in $VENUE_URLS; do
  TOTAL=$((TOTAL + 1))

  # Get HTTP status code
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

  if [ "$STATUS" = "404" ]; then
    NOT_FOUND=$((NOT_FOUND + 1))
    SLUG=$(echo "$URL" | sed 's|https://prostormat.cz/prostory/||')
    echo "❌ 404 - $SLUG"
    echo "   URL: $URL"

    # Check if it has noindex
    CONTENT=$(curl -s "$URL")
    if echo "$CONTENT" | grep -q 'name="robots" content="noindex"'; then
      HAS_NOINDEX=$((HAS_NOINDEX + 1))
      echo "   ⚠️  Has noindex meta tag - GOOGLE WILL NOT INDEX"
    fi
    echo ""
  elif [ "$STATUS" = "200" ]; then
    # Check for noindex even on 200 responses
    CONTENT=$(curl -s "$URL")
    if echo "$CONTENT" | grep -q 'name="robots" content="noindex"'; then
      SLUG=$(echo "$URL" | sed 's|https://prostormat.cz/prostory/||')
      echo "⚠️  200 OK but has noindex - $SLUG"
      HAS_NOINDEX=$((HAS_NOINDEX + 1))
    fi
  fi
done

echo ""
echo "================================================"
echo "📊 SUMMARY:"
echo "================================================"
echo "Total tested: $TOTAL"
echo "404 errors: $NOT_FOUND"
echo "Pages with noindex: $HAS_NOINDEX"
echo ""

if [ "$NOT_FOUND" -gt 0 ] || [ "$HAS_NOINDEX" -gt 0 ]; then
  echo "❌ ISSUE CONFIRMED:"
  echo "   Your sitemap contains URLs that return 404 or have noindex."
  echo "   This is why Google Search Console reports indexing problems."
  echo ""
  echo "   Run the full diagnostic: npx tsx scripts/diagnose-sitemap-404s.ts"
else
  echo "✅ No issues found in sample!"
fi
