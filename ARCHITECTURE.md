# Brand Search Application - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                    http://localhost:3000                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    REACT FRONTEND                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Components:                                            │ │
│  │  - BrandManagement.js (CRUD for brands/domains)        │ │
│  │  - BrandSearch.js (Search interface)                   │ │
│  │  - App.js (Router & Navigation)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services:                                              │ │
│  │  - api.js (Axios HTTP client)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Axios HTTP Requests
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   NODE.JS BACKEND API                        │
│                    http://localhost:5000                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express Routes (routes/api.js)                        │ │
│  │  - GET  /api/brands                                    │ │
│  │  - POST /api/brands                                    │ │
│  │  - PUT  /api/brands/:id                                │ │
│  │  - POST /api/brands/:brandId/domains                   │ │
│  │  - POST /api/search/:brandId                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Controllers:                                           │ │
│  │  - brandController.js (Brand & Domain logic)           │ │
│  │  - searchController.js (Search orchestration)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services:                                              │ │
│  │  - googleScraper.js (Puppeteer scraping)              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────┬───────────────────────────┬─────────────────────┘
            │                           │
            │ SQL Queries               │ Headless Browser
            │                           │
┌───────────▼──────────┐    ┌──────────▼────────────────────┐
│   POSTGRESQL DB      │    │     GOOGLE INDONESIA          │
│   brand_search_db    │    │   www.google.com?gl=id        │
│  ┌─────────────────┐ │    │  ┌──────────────────────────┐ │
│  │ brands table    │ │    │  │ Scrapes top 10 organic   │ │
│  │ - id            │ │    │  │ search results           │ │
│  │ - name          │ │    │  │                          │ │
│  └─────────────────┘ │    │  │ Returns:                 │ │
│  ┌─────────────────┐ │    │  │ - Position               │ │
│  │ brand_domains   │ │    │  │ - URL                    │ │
│  │ - id            │ │    │  │ - Domain                 │ │
│  │ - brand_id (FK) │ │    │  │ - Title                  │ │
│  │ - domain        │ │    │  └──────────────────────────┘ │
│  └─────────────────┘ │    └───────────────────────────────┘
└─────────────────────┘

```

## Data Flow: Search Operation

```
1. User selects "ASIA100" brand from dropdown
                 │
                 ▼
2. Frontend calls POST /api/search/1
                 │
                 ▼
3. Backend searchController:
   - Queries PostgreSQL for brand name "ASIA100"
   - Queries PostgreSQL for brand's domains ["asia100.co.id", "asia100.com"]
                 │
                 ▼
4. googleScraper.searchGoogle("ASIA100", "id"):
   - Launches Puppeteer headless Chrome
   - Navigates to Google Indonesia
   - Extracts top 10 organic results
   - Returns: [
       {position: 1, domain: "asia100.co.id", url: "...", title: "..."},
       {position: 2, domain: "facebook.com", url: "...", title: "..."},
       ...
     ]
                 │
                 ▼
5. Backend compares domains:
   - asia100.co.id → MATCH → "Ours"
   - facebook.com  → NO MATCH → "Not Ours"
   - instagram.com → NO MATCH → "Not Ours"
   ...
                 │
                 ▼
6. Returns JSON to frontend:
   {
     brand: "ASIA100",
     totalResults: 10,
     ownedCount: 3,
     notOwnedCount: 7,
     results: [
       {position: 1, domain: "...", status: "Ours", isOwned: true},
       ...
     ]
   }
                 │
                 ▼
7. Frontend displays results in table with badges
```

## Technology Stack Details

### Frontend
- **React 18**: UI framework
- **React Router 6**: Client-side routing
- **Axios**: HTTP client
- **CSS**: Custom styling (no framework)

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **pg**: PostgreSQL client
- **Puppeteer**: Headless browser for scraping
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing

### Database
- **PostgreSQL 12+**: Relational database
- **Tables**:
  - `brands`: Stores brand names
  - `brand_domains`: Many-to-one relationship with brands

### External Services
- **Google Search**: Target for scraping (Indonesia region)

## Security Considerations

1. **Rate Limiting**: Should be added to prevent abuse
2. **Input Validation**: Basic validation in place, can be enhanced
3. **SQL Injection**: Using parameterized queries (pg library)
4. **CORS**: Configured to allow frontend access
5. **Environment Variables**: Sensitive data in .env file

## Scalability Notes

### Current Limitations
- Synchronous scraping (one search at a time)
- No caching of search results
- Puppeteer memory usage grows with concurrent searches
- Google may block high-frequency requests

### Possible Improvements
1. **Queue System**: Use Bull or BullMQ for background job processing
2. **Caching**: Add Redis for recent search results
3. **Proxy Rotation**: Distribute requests across multiple IPs
4. **Database Indexing**: Already implemented for common queries
5. **Load Balancing**: Multiple backend instances with nginx
6. **Monitoring**: Add logging and error tracking (e.g., Sentry)

## Development vs Production

### Development (Current)
- Direct database access
- No authentication
- Single-instance backend
- Console logging

### Production Recommendations
- Add user authentication (JWT)
- Use environment-specific configs
- Implement proper logging (Winston, Bunyan)
- Add monitoring and alerting
- Use production-grade web server (PM2, nginx)
- Implement rate limiting
- Add HTTPS
- Database connection pooling (already configured)
- Error handling and retry logic

## File Structure

```
brand-search-app/
├── backend/
│   ├── config/
│   │   └── database.js              # DB connection pool
│   ├── controllers/
│   │   ├── brandController.js       # Brand/Domain CRUD
│   │   └── searchController.js      # Search logic
│   ├── routes/
│   │   └── api.js                   # Route definitions
│   ├── services/
│   │   └── googleScraper.js         # Puppeteer service
│   ├── .env.example
│   ├── package.json
│   ├── schema.sql
│   └── server.js                    # Express app
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── BrandManagement.js
    │   │   └── BrandSearch.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.css
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## API Reference

### Brand Endpoints

#### GET /api/brands
Returns all brands
```json
Response: {
  "success": true,
  "data": [
    { "id": 1, "name": "ASIA100", "created_at": "...", "updated_at": "..." }
  ]
}
```

#### GET /api/brands/:id
Returns brand with all its domains
```json
Response: {
  "success": true,
  "data": {
    "id": 1,
    "name": "ASIA100",
    "domains": [
      { "id": 1, "brand_id": 1, "domain": "asia100.co.id" }
    ]
  }
}
```

#### POST /api/brands
Create new brand
```json
Request: { "name": "ASIA100" }
Response: { "success": true, "data": { "id": 1, "name": "ASIA100", ... } }
```

#### POST /api/brands/:brandId/domains
Add domain to brand
```json
Request: { "domain": "asia100.co.id" }
Response: { "success": true, "data": { "id": 1, "brand_id": 1, "domain": "..." } }
```

#### POST /api/search/:brandId
Search Google for brand
```json
Response: {
  "success": true,
  "data": {
    "brand": "ASIA100",
    "totalResults": 10,
    "ownedCount": 3,
    "notOwnedCount": 7,
    "results": [...]
  }
}
```

## Performance Metrics

### Expected Response Times
- Brand CRUD operations: 50-200ms
- Search operation: 5-15 seconds (depends on Google response time)
- Database queries: <50ms with indexes

### Resource Usage
- Backend memory: ~200MB base + ~100MB per active Puppeteer instance
- Frontend bundle size: ~500KB
- Database size: Minimal (<1MB for 100 brands with 1000 domains)
