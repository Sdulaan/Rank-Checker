const pool = require('../config/database');
const googleScraper = require('../services/googleScraper');

class SearchController {
  async searchBrand(req, res) {
    try {
      const { brandId } = req.params;
      
      // Get brand details
      const brandResult = await pool.query(
        'SELECT * FROM brands WHERE id = $1',
        [brandId]
      );
      
      if (brandResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Brand not found' });
      }
      
      const brand = brandResult.rows[0];
      
      // Get brand's domains
      const domainsResult = await pool.query(
  'SELECT domain FROM brand_domains WHERE brand_id = $1',
  [brandId]
);

// Extract domain from URLs and clean them
const ownedDomains = domainsResult.rows.map(row => {
  let domain = row.domain.toLowerCase();
  
  // If it's a full URL, extract just the domain
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    try {
      const urlObj = new URL(domain);
      domain = urlObj.hostname;
    } catch (e) {
      // If URL parsing fails, keep as is
    }
  }
  
  // Remove www. prefix
  domain = domain.replace('www.', '');
  
  // Remove trailing slashes
  domain = domain.replace(/\/$/, '');
  
  return domain;
});
      
      console.log(`Searching for brand: ${brand.name}`);
      console.log(`Owned domains:`, ownedDomains);
      
      // Scrape Google search results
      const searchResults = await googleScraper.searchGoogle(brand.name, 'id');
      
      // Compare results with owned domains
      const comparisonResults = searchResults.map(result => {
        const isOwned = ownedDomains.includes(result.domain.toLowerCase());
        return {
          ...result,
          status: isOwned ? 'Ours' : 'Not Ours',
          isOwned: isOwned
        };
      });
      
      // Calculate statistics
      const ownedCount = comparisonResults.filter(r => r.isOwned).length;
      const notOwnedCount = comparisonResults.length - ownedCount;
      
      res.json({
        success: true,
        data: {
          brand: brand.name,
          totalResults: comparisonResults.length,
          ownedCount: ownedCount,
          notOwnedCount: notOwnedCount,
          results: comparisonResults
        }
      });
      
    } catch (error) {
      console.error('Error searching brand:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to search brand: ' + error.message 
      });
    }
  }
}

module.exports = new SearchController();
