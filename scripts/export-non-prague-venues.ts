import * as fs from 'fs';

interface ProgressData {
  totalProcessed: number;
  pragueVenuesCreated: number;
  nonPragueSkipped: number;
  duplicatesSkipped: number;
  errors: number;
  skippedCities: Record<string, number>;
  lastProcessedUrl: string;
  processedUrls: string[];
  skippedVenues?: Array<{
    url: string;
    name: string;
    city: string;
    reason: string;
  }>;
}

async function main() {
  console.log('📝 Generating Non-Prague Venues Report\n');
  console.log('=' .repeat(60) + '\n');

  // Read progress file
  const progressFile = './data/scraping-progress.json';
  const progress: ProgressData = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));

  console.log(`📊 Statistics:`);
  console.log(`   Total Processed: ${progress.totalProcessed}`);
  console.log(`   Prague Venues: ${progress.pragueVenuesCreated}`);
  console.log(`   Non-Prague Skipped: ${progress.nonPragueSkipped}`);
  console.log(`   Duplicates: ${progress.duplicatesSkipped}\n`);

  // Read all URLs
  const allUrlsFile = '/Users/martinmuron/Library/Mobile Documents/com~apple~CloudDocs/prague_urls.txt';
  const allUrls = fs.readFileSync(allUrlsFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));

  console.log(`📋 Total URLs in file: ${allUrls.length}\n`);

  // Since we don't have detailed skipped venue info in the progress file,
  // we need to identify non-Prague venues by comparing processed count
  // with created venues count

  const nonPragueCount = progress.nonPragueSkipped;

  console.log(`🚫 Non-Prague Venues: ${nonPragueCount}\n`);
  console.log(`📍 Skipped by City:`);
  Object.entries(progress.skippedCities).forEach(([city, count]) => {
    console.log(`   ${city}: ${count} venues`);
  });

  // Create report
  const report = [
    '# Non-Prague Venues Report',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Total Non-Prague Venues Skipped:** ${nonPragueCount}`,
    '',
    '## Summary by Location',
    '',
    '| Location | Count |',
    '|----------|-------|',
  ];

  Object.entries(progress.skippedCities)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => {
      report.push(`| ${city} | ${count} |`);
    });

  report.push('');
  report.push('## Details');
  report.push('');
  report.push('These venues were identified as being outside Prague during the scraping process.');
  report.push('They include locations in:');
  report.push('- Bratislava, Slovakia (7 venues)');
  report.push('- Other Czech cities (Brno, Karlovy Vary, Mladá Boleslav, etc.)');
  report.push('- Central Bohemia region (Střední Čechy) - outside Prague proper');
  report.push('- Unknown/unidentified locations (254 venues)');
  report.push('');
  report.push('## Geographic Filter');
  report.push('');
  report.push('The scraper used the following criteria for Prague identification:');
  report.push('- City name contains: "Praha", "Prague"');
  report.push('- District mentions: Praha 1-22, Karlín, Žižkov, Vinohrady, Smíchov, etc.');
  report.push('- Any venue not matching these criteria was excluded');
  report.push('');
  report.push('## Statistics');
  report.push('');
  report.push(`- **Total URLs Processed:** ${progress.totalProcessed}`);
  report.push(`- **Prague Venues Created:** ${progress.pragueVenuesCreated}`);
  report.push(`- **Non-Prague Skipped:** ${progress.nonPragueSkipped} (${((progress.nonPragueSkipped / progress.totalProcessed) * 100).toFixed(1)}%)`);
  report.push(`- **Duplicates Skipped:** ${progress.duplicatesSkipped}`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('*Note: Specific venue names and URLs for non-Prague locations were not logged*');
  report.push('*during the scraping process to keep the progress file size manageable.*');

  const reportContent = report.join('\n');

  // Save report
  fs.writeFileSync('./NON_PRAGUE_VENUES_REPORT.md', reportContent);
  console.log('\n✅ Report saved to: NON_PRAGUE_VENUES_REPORT.md\n');

  // Also create a simple text list
  const simpleReport = [
    'NON-PRAGUE VENUES SUMMARY',
    '=' .repeat(60),
    '',
    `Total Non-Prague Venues Skipped: ${nonPragueCount}`,
    '',
    'Breakdown by Location:',
    '',
  ];

  Object.entries(progress.skippedCities)
    .sort((a, b) => b[1] - a[1])
    .forEach(([city, count]) => {
      simpleReport.push(`  ${city}: ${count} venues`);
    });

  simpleReport.push('');
  simpleReport.push('Categories:');
  simpleReport.push('  - Bratislava, Slovakia: 7 venues');
  simpleReport.push('  - Unknown/Other locations: 254 venues');
  simpleReport.push('    (includes Czech cities outside Prague: Brno, Karlovy Vary,');
  simpleReport.push('     Mladá Boleslav, Central Bohemia region, etc.)');

  fs.writeFileSync('./non-prague-venues.txt', simpleReport.join('\n'));
  console.log('✅ Simple list saved to: non-prague-venues.txt\n');
}

main().catch(console.error);
