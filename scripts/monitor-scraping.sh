#!/bin/bash

# Monitor scraping progress
echo "=== Meatspace Scraping Monitor ==="
echo ""

# Check if process is running
if ps aux | grep -q "[r]esume-scraping"; then
    echo "✅ Scraping process is RUNNING"
else
    echo "❌ Scraping process is NOT running"
    exit 1
fi

echo ""

# Show current progress from progress file
if [ -f "/Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraping-progress.json" ]; then
    echo "📊 Current Progress:"
    cat /Users/martinmuron/Desktop/Webs/prostormat-dev/data/scraping-progress.json | grep -E "totalProcessed|pragueVenuesCreated|nonPragueSkipped|duplicatesSkipped|errors"
fi

echo ""
echo "📝 Latest log entries:"
tail -20 /tmp/scraping.log

echo ""
echo "⏰ Last updated: $(date)"
