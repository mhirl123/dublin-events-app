# Dublin Events App - Architecture Documentation

## System Overview

The Dublin Events App is a full-stack web application that aggregates event information from 33+ sources across Dublin and presents them through a modern, searchable interface.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│          (React/Next.js - Browser-based Application)         │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST API Calls
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Backend API)                │
│         • /api/events - Search & Filter Events               │
│         • /api/venues - Venue Information                    │
│         • /api/sources - Data Source Status                  │
└────────────────┬───────────────────────────────────────────┘
                 │ ORM Queries
                 ▼
┌─────────────────────────────────────────────────────────────┐
│            PRISMA ORM (Database Abstraction)                 │
│                                                              │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                             │
│  Tables: events, venues, sources, event_sources             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                 ▲
                 │ Data Inserts/Updates
                 │
┌────────────────┴───────────────────────────────────────────┐
│           SCRAPER SERVICE (Node.js)                          │
│                                                              │
│  Task Queue (Bull) ──┬──→ Scraper 1 (Ticketmaster)         │
│                      ├──→ Scraper 2 (Eventbrite)           │
│                      ├──→ Scraper 3 (3 Arena)              │
│                      ├──→ Scraper 4 (Vicar's Street)       │
│                      ├──→ ... (33 total scrapers)          │
│                      └──→ Scraper 33                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────────┬──────────────────┐
    │                             │                  │
    ▼                             ▼                  ▼
   HTML              JavaScript-Heavy Sites    Static HTML
  (Cheerio)          (Puppeteer/Playwright)     (Cheerio)
  Parsing            Browser Automation         Parsing
```

## Technology Stack

### Frontend Layer
- **Next.js 14** - React framework with SSR/SSG capabilities
- **React** - UI component library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Fetch API** - HTTP client

### Backend Layer
- **Next.js API Routes** - Serverless functions for API endpoints
- **Prisma** - ORM for type-safe database operations
- **PostgreSQL** - Relational database

### Scraping Layer
- **Node.js** - JavaScript runtime
- **Puppeteer** - Headless Chrome browser automation (JS-heavy sites)
- **Cheerio** - jQuery-like HTML parsing (static sites)
- **Bull** - Redis-based job queue
- **node-cron** - Task scheduling

### Infrastructure
- **Railway** - Hosting platform
- **PostgreSQL** - Managed database
- **Redis** - Cache & task queue

## Database Schema

### Events Table
Stores event information:
- `id` - Unique identifier (UUID)
- `title` - Event name
- `description` - Event details
- `date_start` - Event start date/time
- `date_end` - Event end date/time (optional)
- `venue_id` - Foreign key to Venue
- `genre` - Event category (Music, Theater, Comedy, etc.)
- `ticket_price_min` - Minimum ticket price
- `ticket_price_max` - Maximum ticket price
- `ticket_url` - URL to purchase tickets
- `image_url` - Event poster/image
- `is_active` - Whether event is still active
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

### Venues Table
Stores venue information:
- `id` - Unique identifier (UUID)
- `name` - Venue name
- `address` - Physical address
- `latitude` - Geo coordinate (for mapping)
- `longitude` - Geo coordinate (for mapping)
- `phone` - Contact number
- `website` - Venue website URL
- `capacity` - Maximum capacity
- `created_at` - Record creation timestamp

### Sources Table
Stores data source information:
- `id` - Unique identifier (UUID)
- `name` - Source name (e.g., "Ticketmaster")
- `url` - Source website URL
- `scraper_type` - "puppeteer" or "cheerio"
- `scraper_status` - "active", "broken", or "disabled"
- `last_scraped_at` - Last successful scrape timestamp
- `next_scrape_at` - Next scheduled scrape time
- `created_at` - Record creation timestamp

### EventSources Table (Many-to-Many)
Links events to the sources they came from:
- `event_id` - Foreign key to Event
- `source_id` - Foreign key to Source
- `source_url` - Original URL on the source website
- `source_event_id` - Event ID from the source system

## API Endpoints

### Events Endpoints

#### GET /api/events
Search and filter events

**Query Parameters:**
- `search` - Text search on title/description
- `dateFrom` - Start date (ISO format)
- `dateTo` - End date (ISO format)
- `genre` - Filter by genre
- `priceMin` - Minimum ticket price
- `priceMax` - Maximum ticket price
- `venues` - Comma-separated venue IDs
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Concert Name",
      "dateStart": "2026-09-15T20:00:00Z",
      "genre": "Music",
      "ticketPriceMin": 30,
      "ticketPriceMax": 80,
      "ticketUrl": "https://...",
      "venue": {
        "name": "3 Arena",
        "address": "..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /api/events/[id]
Get detailed information about a specific event

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "title": "Concert Name",
    "description": "Full description...",
    "dateStart": "2026-09-15T20:00:00Z",
    "dateEnd": "2026-09-15T23:30:00Z",
    "genre": "Music",
    "ticketPriceMin": 30,
    "ticketPriceMax": 80,
    "ticketUrl": "https://...",
    "imageUrl": "https://...",
    "venue": {
      "id": "uuid",
      "name": "3 Arena",
      "address": "...",
      "latitude": 53.344,
      "longitude": -6.234,
      "phone": "...",
      "website": "..."
    },
    "sources": [
      {
        "id": "uuid",
        "name": "3 Arena Direct",
        "url": "https://3arena.ie"
      }
    ]
  }
}
```

### Venues Endpoints

#### GET /api/venues
List all venues

**Response:**
```json
{
  "venues": [
    {
      "id": "uuid",
      "name": "3 Arena",
      "address": "...",
      "latitude": 53.344,
      "longitude": -6.234,
      "phone": "...",
      "website": "...",
      "capacity": 14000,
      "eventCount": 25
    }
  ]
}
```

### Sources Endpoints

#### GET /api/sources
List all data sources and their status

**Response:**
```json
{
  "sources": [
    {
      "id": "uuid",
      "name": "Ticketmaster",
      "url": "https://ticketmaster.ie",
      "scraperType": "puppeteer",
      "scraperStatus": "active",
      "lastScrapedAt": "2026-08-21T10:30:00Z",
      "nextScrapeAt": "2026-08-22T10:30:00Z",
      "eventCount": 245
    }
  ]
}
```

#### GET /api/sources/[id]/status
Get detailed status of a specific scraper

**Response:**
```json
{
  "id": "uuid",
  "name": "Ticketmaster",
  "status": "active",
  "lastScrapedAt": "2026-08-21T10:30:00Z",
  "lastErrorAt": null,
  "lastErrorMessage": null,
  "eventCount": 245,
  "averageScrapeTime": "2.5s",
  "successRate": 99.8
}
```

## Scraper Architecture

### Base Scraper Class

All scrapers extend `BaseScraper` which provides:
- Common event saving logic
- Database interaction through Prisma
- Event deduplication
- Error handling
- Venue creation/lookup
- Source tracking

### Scraper Types

**Type 1: Cheerio-based (Static HTML)**
- Fast, lightweight
- No browser overhead
- Good for static HTML websites
- Examples: Theater websites, festival listings

**Type 2: Puppeteer-based (JavaScript-heavy)**
- Full browser automation
- Handles dynamic content
- Can click buttons, fill forms
- Slower but more capable
- Examples: Ticketmaster, Eventbrite

### Adding a New Scraper

1. Create file: `src/lib/scrapers/sites/SiteNameScraper.ts`
2. Extend `BaseScraper` class
3. Implement `scrape()` method
4. Register in `src/scrapers/runner.ts`
5. Test and deploy

### Scraper Implementation Checklist

- [ ] Create TypeScript file with class extending BaseScraper
- [ ] Choose scraper type (cheerio vs puppeteer)
- [ ] Implement scrape() method
- [ ] Parse HTML/content correctly
- [ ] Extract required fields (title, date, venue, price, URL)
- [ ] Map venue names consistently
- [ ] Handle date parsing correctly
- [ ] Call saveEvents() with results
- [ ] Add error handling
- [ ] Test with real data
- [ ] Register in runner.ts

## Scraper Categories & Status

### ✅ Group 1: Ticketing Platforms
- [ ] **Ticketmaster.ie** - Complex, needs Puppeteer
- [ ] **Eventbrite.com** - JavaScript-heavy, needs Puppeteer

### ✅ Group 2: Major Music/Performance Venues
- [ ] **3arena.ie** - Check for API or simple HTML
- [ ] **Vicar's Street** - HTML parsing
- [ ] **The Grand Social** - HTML parsing
- [ ] **Whelans Live** - HTML parsing
- [ ] **Gaiety Theatre** - HTML parsing
- [ ] **National Concert Hall** - HTML parsing

### ✅ Group 3: Comedy Clubs
- [ ] **Craic Den Comedy Club** - HTML parsing
- [ ] **Hen Street Dublin** - HTML parsing

### ✅ Group 4: Theaters & Cultural
- [ ] **The Ambassador Theatre** - HTML parsing
- [ ] **Button Factory** - HTML parsing
- [ ] **Abbey Theatre** - HTML parsing
- [ ] **Gate Theatre** - HTML parsing

### ✅ Group 5: Arenas & Stadiums
- [ ] **Aviva Stadium** - Check for API
- [ ] **Croke Park** - Check for API
- [ ] **National Stadium** - HTML parsing
- [ ] **3Olympia** - HTML parsing

### ✅ Group 6: Blogs & Event Listings
- [ ] **Nialler9 Gig Guide** - HTML parsing
- [ ] **DIFF Magazine** - HTML parsing
- [ ] **ILF Dublin** - HTML parsing
- [ ] **NYF Dublin** - HTML parsing

### ✅ Group 7: Festivals (Seasonal)
- [ ] **Dublin Pride** - HTML parsing
- [ ] **Bloomsday Festival** - HTML parsing
- [ ] **Taste of Dublin** - HTML parsing
- [ ] **Fringe Fest** - HTML parsing
- [ ] **Bram Stoker Festival** - HTML parsing
- [ ] **Dublin Book Festival** - HTML parsing
- [ ] **Dalkey Book Festival** - HTML parsing
- [ ] **Dublin Winter Lights** - HTML parsing
- [ ] **Trad Fest** - HTML parsing

### ✅ Group 8: Additional Venues
- [ ] **The Sugar Club** - HTML parsing
- [ ] **RIAM (Royal Irish Academy of Music)** - HTML parsing

## Data Deduplication Strategy

Events can appear from multiple sources. Deduplication works by:

1. **Exact matching** - Same title + date + venue = same event
2. **Fuzzy matching** - Similar titles (>90% match) + same date + same venue
3. **Content hashing** - Hash of title+date+venue
4. **Source tracking** - EventSource table tracks all sources for each event

When duplicates found:
- Keep one primary event record
- Link all sources via EventSource table
- User sees single unified event with multiple ticket links

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Full-text search on title/description
- Pagination to limit result sets
- Connection pooling

### Frontend Optimization
- Lazy image loading
- Result pagination (20 events default)
- Search result caching
- Debounced search input

### Scraping Optimization
- Daily schedule (not hourly) to reduce load
- Rate limiting between requests (1 second)
- Parallel scraping of multiple sources (with limits)
- Selective updates for rapidly-changing sources

## Monitoring & Alerting

### Key Metrics
- Scraper success rate
- Events added per day
- Average scrape time
- Data freshness (age of events)
- API response time
- Database query performance

### Health Checks
- Is PostgreSQL connected?
- Are scrapers running successfully?
- How many events are in the database?
- Which scrapers are failing?

### Error Logging
- Scraper errors logged with source name
- Failed requests logged with status code
- Database errors logged with query
- Unusual patterns flagged (e.g., 0 events from source)

## Deployment Process

### Local Development
```bash
npm install
npm run db:push
npm run dev
```

### Staging Deployment
1. Push to GitHub
2. Railway auto-deploys from staging branch
3. Run scraper to populate test data
4. Manual testing

### Production Deployment
1. Code review and merge to main
2. Railway auto-deploys
3. Database migrations applied
4. Scrapers run on schedule

## Future Enhancements

1. **Real-time Updates** - WebSocket updates for event changes
2. **User Accounts** - Favorites, saved searches, notifications
3. **Social Features** - Comments, ratings, sharing
4. **Map Integration** - Location-based event discovery
5. **Calendar Export** - iCal/Google Calendar integration
6. **Mobile Apps** - Native iOS/Android apps
7. **AI Recommendations** - Personalized event suggestions
8. **Advanced Analytics** - Trending events, popularity metrics

## Troubleshooting Guide

### Scraper Not Working
1. Check website structure hasn't changed
2. Verify selectors in scraper code
3. Test with fresh scraper run
4. Check logs for specific errors

### No Events Showing
1. Verify database connection
2. Check if scrapers have run
3. Count events in database
4. Review source status

### Performance Issues
1. Check database indexes exist
2. Review API query parameters
3. Monitor database connections
4. Check Redis cache status

---

For more information, see README.md and implementation guides.
