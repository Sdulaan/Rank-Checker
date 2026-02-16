const puppeteer = require('puppeteer');

class GoogleScraper {
  constructor() {
    // Rotate between different user agents to appear more human
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    ];
    this.lastSearchTime = 0;
  }

  // Random delay to appear more human
  async randomDelay(min = 2000, max = 5000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Waiting ${(delay / 1000).toFixed(1)} seconds before next action...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Get random user agent
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Enforce minimum delay between searches
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastSearch = now - this.lastSearchTime;
    const minDelay = 5000; // Minimum 5 seconds between searches

    if (timeSinceLastSearch < minDelay) {
      const waitTime = minDelay - timeSinceLastSearch;
      console.log(`Rate limiting: waiting ${(waitTime / 1000).toFixed(1)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastSearchTime = Date.now();
  }

  async searchGoogle(query, region = 'id', retries = 3) {
    // Enforce rate limiting
    await this.enforceRateLimit();

    let browser;
    let attempt = 0;

    while (attempt < retries) {
      try {
        attempt++;
        console.log(`\n[Attempt ${attempt}/${retries}] Searching for: ${query}`);

        browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080',
            '--start-maximized'
          ]
        });

        const page = await browser.newPage();

        // Set random viewport
        const viewports = [
          { width: 1920, height: 1080 },
          { width: 1366, height: 768 },
          { width: 1536, height: 864 }
        ];
        const viewport = viewports[Math.floor(Math.random() * viewports.length)];
        await page.setViewport(viewport);

        // Set random user agent
        const userAgent = this.getRandomUserAgent();
        await page.setUserAgent(userAgent);
        console.log(`Using user agent: ${userAgent.substring(0, 50)}...`);

        // Additional stealth settings
        await page.evaluateOnNewDocument(() => {
          // Overwrite the `navigator.webdriver` property
          Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
          });

          // Overwrite the `plugins` property
          Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
          });

          // Overwrite the `languages` property
          Object.defineProperty(navigator, 'languages', {
            get: () => ['id-ID', 'id', 'en-US', 'en'],
          });
        });

        // Build Google search URL
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=${region}&hl=id&num=15`;
        console.log(`Navigating to: ${searchUrl}`);

        // Navigate to Google
        await page.goto(searchUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        });

        // Random delay to appear human
        await this.randomDelay(2000, 4000);

        // Check if CAPTCHA is present
        const captchaPresent = await page.evaluate(() => {
          return document.body.innerText.includes('unusual traffic') ||
            document.querySelector('iframe[src*="recaptcha"]') !== null;
        });

        if (captchaPresent) {
          console.log('⚠️  CAPTCHA detected! Google is blocking automated requests.');
          await browser.close();

          if (attempt < retries) {
            console.log('Waiting 30 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            continue;
          } else {
            throw new Error('CAPTCHA detected. Please try again later or reduce search frequency.');
          }
        }

        // Try multiple selectors to find results
        const selectors = ['#search', '#rso', '.g', 'div.g'];
        let resultsFound = false;

        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector, { timeout: 8000 });
            resultsFound = true;
            console.log(`✓ Found results with selector: ${selector}`);
            break;
          } catch (e) {
            // Try next selector
          }
        }

        if (!resultsFound) {
          console.log('⚠️  Could not find standard result selectors, trying alternative extraction...');
        }

        // Extract results
        const results = await page.evaluate(() => {
          const searchResults = [];

          // Try multiple selectors for result containers
          let resultElements = document.querySelectorAll('.g');

          if (resultElements.length === 0) {
            resultElements = document.querySelectorAll('div[data-hveid]');
          }

          if (resultElements.length === 0) {
            resultElements = document.querySelectorAll('.tF2Cxc');
          }

          console.log(`Found ${resultElements.length} potential result elements`);

          for (let i = 0; i < resultElements.length && searchResults.length < 11; i++) {
            const element = resultElements[i];

            // Try to find link
            const linkElement = element.querySelector('a[href]');
            if (!linkElement || !linkElement.href) continue;

            const url = linkElement.href;

            // Filter out non-organic results
            if (!url.startsWith('http://') && !url.startsWith('https://')) continue;
            if (url.includes('google.com/search')) continue;
            if (url.includes('google.com/url')) continue;
            if (url.includes('webcache.googleusercontent.com')) continue;
            if (url.includes('translate.google.com')) continue;

            // Get title
            const titleElement = element.querySelector('h3');
            const title = titleElement ? titleElement.textContent.trim() : '';

            // Extract domain
            let domain = '';
            try {
              const urlObj = new URL(url);
              domain = urlObj.hostname.replace('www.', '');
            } catch (e) {
              domain = url;
            }

            if (url && domain && title) {
              searchResults.push({
                position: searchResults.length + 1,
                title: title,
                url: url,
                domain: domain
              });
            }
          }

          return searchResults;
        });

        // Remove duplicates based on domain
        const seenDomains = new Set();
        const uniqueResults = [];

        for (const result of results) {
          if (!seenDomains.has(result.domain)) {
            seenDomains.add(result.domain);
            uniqueResults.push({
              ...result,
              position: uniqueResults.length + 1  // Renumber positions
            });

            // Stop once we have 10 unique results
            if (uniqueResults.length === 10) {
              break;
            }
          }
        }

        console.log(`Extracted ${results.length} total results, ${uniqueResults.length} unique results`);

        await browser.close();

        if (uniqueResults.length === 0) {
          console.log('⚠️  No results extracted. This might indicate blocking or page structure change.');

          if (attempt < retries) {
            console.log('Waiting 15 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 15000));
            continue;
          } else {
            throw new Error('No search results found after multiple attempts. Google may be blocking requests.');
          }
        }

        console.log(`✓ Successfully extracted ${uniqueResults.length} unique results`);
        return uniqueResults;

      } catch (error) {
        if (browser) {
          try {
            await browser.close();
          } catch (e) {
            // Ignore close errors
          }
        }

        console.error(`✗ Attempt ${attempt} failed:`, error.message);

        if (attempt < retries) {
          const waitTime = 10000 * attempt; // Exponential backoff
          console.log(`Waiting ${waitTime / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
      }
    }
  }
}

module.exports = new GoogleScraper();
