# Venue Description Enhancement Script

## Overview
This script automatically enhances venue descriptions to meet a minimum of 600 characters by:
1. Finding missing venue website URLs through web search
2. Scraping content from venue websites
3. Using Claude AI to generate enhanced, professional descriptions in Czech
4. Updating the database with improved descriptions

## Prerequisites

### 1. Environment Variables
Add the following to your `.env.local` file:

```bash
# Required: Your Anthropic API key
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Required: Production database connection (MUST use port 5432)
DATABASE_URL="postgres://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

**IMPORTANT**: Always use port **5432** (direct connection) for production database operations, NOT port 6543 (pgbouncer).

### 2. Get Anthropic API Key
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy it to your `.env.local` file

## Usage

### Basic Usage (Dry Run - Recommended First)
Test the script without making any database changes:

```bash
DATABASE_URL="your-connection-string" ANTHROPIC_API_KEY="your-key" npx tsx scripts/enhance-venue-descriptions.ts --dry-run
```

### Process Limited Number of Venues (Testing)
Process only the first 5 venues:

```bash
DATABASE_URL="your-connection-string" ANTHROPIC_API_KEY="your-key" npx tsx scripts/enhance-venue-descriptions.ts --dry-run --limit 5
```

### Live Update (Production)
**WARNING**: This will update the database. Make sure you've tested with dry-run first!

```bash
DATABASE_URL="your-connection-string" ANTHROPIC_API_KEY="your-key" npx tsx scripts/enhance-venue-descriptions.ts
```

### Process All Venues (Production)
Process all venues with descriptions under 600 characters:

```bash
DATABASE_URL="your-connection-string" ANTHROPIC_API_KEY="your-key" npx tsx scripts/enhance-venue-descriptions.ts
```

## Command-Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Run without updating database | `--dry-run` |
| `--limit N` | Process only N venues | `--limit 10` |

## What the Script Does

### 1. Query Phase
- Finds all active venues with descriptions shorter than 600 characters
- Includes venues with no description at all

### 2. Processing Phase (for each venue)
**Step 1: Find Website URL (if missing)**
- Uses DuckDuckGo search to find the venue's website
- Search query format: `"{venue name}" {address} Prague website`
- Extracts and validates the most relevant URL

**Step 2: Scrape Website Content**
- Fetches the venue's website
- Extracts meaningful content (main, article, about sections)
- Cleans up the text (removes scripts, styles, navigation)
- Limits to first 5000 characters

**Step 3: Generate Enhanced Description**
- Sends to Claude AI with:
  - Existing description (to preserve and enhance)
  - Scraped website content
  - Venue metadata (types, amenities, capacity, location)
- Generates Czech description (minimum 600 characters)
- Maintains professional yet conversational tone

**Step 4: Update Database**
- Updates venue description
- Updates website URL (if newly discovered)
- Updates timestamp

### 3. Logging Phase
- Saves detailed logs to `logs/venue-description-enhancements-{timestamp}.json`
- Includes:
  - Processing summary and statistics
  - Individual venue results
  - Errors and failures
  - URLs discovered

## Output

### Console Output
```
🚀 Venue Description Enhancement Agent
============================================================
Mode: DRY RUN
Minimum description length: 600 characters
Processing limit: 5 venues
============================================================

Found 5 venues with descriptions < 600 characters

📍 Processing: Venue Name (venue-slug)
   Current description length: 45 characters
  🔍 Searching for website: "Venue Name" Address Prague website
  ✅ Found website: https://venue-website.cz
  🌐 Scraping website: https://venue-website.cz
  ✅ Scraped 2834 characters
  🤖 Generating enhanced description...
  ✅ Generated 687 characters
  🔍 DRY RUN - would update database with:
      New description: Venue Name je...
      New website URL: https://venue-website.cz

📊 PROCESSING SUMMARY
============================================================
Total venues processed: 5
✅ Successful: 5
❌ Failed: 0
🔍 URLs discovered: 2
Mode: DRY RUN (no changes made)
============================================================

📊 Logs saved to: logs/venue-description-enhancements-2025-10-20T14-30-45-123Z.json
```

### Log File Structure
```json
{
  "processedAt": "2025-10-20T14:30:45.123Z",
  "config": {
    "minDescriptionLength": 600,
    "delayBetweenRequests": 2000,
    "dryRun": true,
    "limit": 5
  },
  "summary": {
    "totalProcessed": 5,
    "successful": 5,
    "failed": 0,
    "urlsDiscovered": 2,
    "averageOriginalLength": 78,
    "averageNewLength": 654
  },
  "logs": [
    {
      "venueId": "cm123abc",
      "venueName": "Venue Name",
      "venueSlug": "venue-slug",
      "originalDescriptionLength": 45,
      "newDescriptionLength": 687,
      "urlDiscovered": true,
      "websiteUrl": "https://venue-website.cz",
      "success": true,
      "timestamp": "2025-10-20T14:30:45.123Z"
    }
  ]
}
```

## Rate Limiting & Performance

- **Delay between venues**: 2 seconds (configurable in script)
- **Delay after search**: 2 seconds additional
- **Delay after scraping**: 1 second
- **Website timeout**: 10 seconds per site
- **Content limit**: 5000 characters from each website

**Estimated time**:
- ~5-8 seconds per venue (with existing website URL)
- ~10-15 seconds per venue (needs URL discovery)
- For 100 venues: ~15-25 minutes

## Error Handling

The script handles errors gracefully:
- **Search fails**: Falls back to using existing venue data only
- **Website unreachable**: Uses venue metadata for description
- **AI generation fails**: Logs error and continues to next venue
- **Database error**: Logs error and continues

All errors are logged in the output file for review.

## Safety Features

1. **Dry Run Mode**: Test without making changes
2. **Rate Limiting**: Prevents overwhelming external services
3. **Comprehensive Logging**: Track all changes
4. **Error Isolation**: One venue failure doesn't stop the entire process
5. **Original Description Preservation**: AI is instructed to enhance, not replace
6. **Active Venues Only**: Only processes venues with `status: 'active'`

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
Make sure the environment variable is properly set:
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### "Error connecting to database"
- Verify `DATABASE_URL` is correct
- Ensure you're using port 5432 (not 6543)
- Check network connectivity to Supabase

### "Search failed" or "No website found"
- This is normal for some venues
- Script will continue using existing venue data
- Consider manually adding website URLs for important venues

### AI Generation Taking Long Time
- Claude API can take 3-5 seconds per request
- This is normal - quality takes time
- Consider using `--limit` flag for testing

## Best Practices

1. **Always test with dry-run first**:
   ```bash
   npx tsx scripts/enhance-venue-descriptions.ts --dry-run --limit 5
   ```

2. **Start with a small batch**:
   ```bash
   npx tsx scripts/enhance-venue-descriptions.ts --limit 10
   ```

3. **Review the logs** after dry-run to ensure quality

4. **Run during off-peak hours** to minimize user impact

5. **Monitor the first few updates** in the database manually

6. **Keep logs** for reference and quality assurance

## Cost Considerations

**Anthropic API Costs** (as of January 2025):
- Model: Claude 3.5 Sonnet
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Estimated cost per venue**:
- ~1000 input tokens (prompt + context)
- ~200 output tokens (description)
- **~$0.006 per venue** (less than 1 cent)

For 100 venues: **~$0.60** total cost

## Support

If you encounter issues:
1. Check the logs directory for detailed error messages
2. Review the console output for specific errors
3. Test with `--dry-run --limit 5` to isolate problems
4. Verify all environment variables are set correctly

## Future Enhancements

Potential improvements:
- [ ] Support for other AI providers (OpenAI, Google)
- [ ] Multi-language support
- [ ] Manual review mode with interactive prompts
- [ ] Batch processing with progress bar
- [ ] Integration with admin dashboard
- [ ] Scheduled automatic updates for new venues
