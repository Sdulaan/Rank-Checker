const pool = require('../config/database');
const googleScraper = require('./googleScraper');

class SearchScheduler {
  constructor() {
    this.isRunning = false;
    this.searchQueue = [];
    this.results = new Map(); // Store latest results
  }

  // Start the scheduler
  async start(intervalHours = 2) {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log(`\n🚀 Search Scheduler Started`);
    console.log(`   Will run searches every ${intervalHours} hour(s)`);
    console.log(`   Searches will be staggered with delays to avoid blocking\n`);

    // Run immediately on start
    await this.runScheduledSearches();

    // Then run on interval
    this.intervalId = setInterval(async () => {
      await this.runScheduledSearches();
    }, intervalHours * 60 * 60 * 1000);
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('✓ Scheduler stopped');
    }
  }

  // Run searches for all brands with staggering
  async runScheduledSearches() {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 SCHEDULED SEARCH STARTED - ${new Date().toLocaleString()}`);
      console.log('='.repeat(60));

      // Get all brands
      const brandsResult = await pool.query('SELECT * FROM brands ORDER BY id');
      const brands = brandsResult.rows;

      if (brands.length === 0) {
        console.log('No brands found in database');
        return;
      }

      console.log(`Found ${brands.length} brands to search\n`);

      let successCount = 0;
      let failCount = 0;

      // Process each brand with delays
      for (let i = 0; i < brands.length; i++) {
        const brand = brands[i];
        
        try {
          console.log(`\n[${i + 1}/${brands.length}] Processing: ${brand.name}`);
          
          // Get brand's domains
          const domainsResult = await pool.query(
            'SELECT domain FROM brand_domains WHERE brand_id = $1',
            [brand.id]
          );
          const ownedDomains = domainsResult.rows.map(row => row.domain.toLowerCase());

          console.log(`   Owned domains: ${ownedDomains.length}`);

          // Search Google
          const searchResults = await googleScraper.searchGoogle(brand.name, 'id');

          // Compare with owned domains
          const comparisonResults = searchResults.map(result => {
            const isOwned = ownedDomains.includes(result.domain.toLowerCase());
            return {
              ...result,
              status: isOwned ? 'Ours' : 'Not Ours',
              isOwned: isOwned
            };
          });

          const ownedCount = comparisonResults.filter(r => r.isOwned).length;

          // Store results
          this.results.set(brand.id, {
            brand: brand.name,
            timestamp: new Date(),
            totalResults: comparisonResults.length,
            ownedCount: ownedCount,
            notOwnedCount: comparisonResults.length - ownedCount,
            results: comparisonResults
          });

          console.log(`   ✓ Success: Found ${comparisonResults.length} results (${ownedCount} ours)`);
          successCount++;

          // Add delay between searches (5-10 seconds)
          // Skip delay for last brand
          if (i < brands.length - 1) {
            const delay = 5000 + Math.floor(Math.random() * 5000);
            console.log(`   Waiting ${(delay / 1000).toFixed(1)}s before next brand...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

        } catch (error) {
          console.error(`   ✗ Failed: ${error.message}`);
          failCount++;
          
          // If we hit rate limiting or blocking, wait longer
          if (error.message.includes('CAPTCHA') || error.message.includes('blocking')) {
            console.log('   ⚠️  Detected blocking, waiting 2 minutes before continuing...');
            await new Promise(resolve => setTimeout(resolve, 120000));
          }
        }
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✓ SCHEDULED SEARCH COMPLETED`);
      console.log(`   Success: ${successCount} | Failed: ${failCount} | Total: ${brands.length}`);
      console.log(`   Next run in configured interval`);
      console.log('='.repeat(60) + '\n');
    } catch (error) {
      console.error('Error in scheduled searches:', error);
    }
  }

  // Get latest results for a specific brand
  getLatestResults(brandId) {
    return this.results.get(brandId) || null;
  }

  // Get all latest results
  getAllLatestResults() {
    const allResults = [];
    for (const [brandId, result] of this.results.entries()) {
      allResults.push({
        brandId: brandId,
        ...result
      });
    }
    return allResults;
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalBrandsSearched: this.results.size,
      lastSearchTime: this.results.size > 0 
        ? Math.max(...Array.from(this.results.values()).map(r => r.timestamp.getTime()))
        : null
    };
  }
}

module.exports = new SearchScheduler();
