# Dublin Events App 🎉

Comprehensive event discovery platform for Dublin, Ireland. Aggregate events from 47+ sources with advanced search, filtering, and job scheduling.

**Status:** ✅ Production Ready (100% Complete)  
**Version:** 1.0.0  
**License:** MIT

---

## Quick Start

### 🚀 Start with Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/dublin-events-app.git
cd dublin-events-app

# Start all services (PostgreSQL, Redis, Next.js)
docker-compose up

# App available at http://localhost:3000
# pgAdmin available at http://localhost:5050
```

### 📝 Manual Setup

```bash
# Install dependencies
npm install

# Create .env.local with database and Redis URLs
echo 'DATABASE_URL="postgresql://..."' > .env.local
echo 'REDIS_URL="redis://..."' >> .env.local

# Setup database
npm run db:push
npm run db:generate
npm run db:seed

# Start dev server
npm run dev
```

---

## Features ✨

### 🔍 Advanced Search & Filtering
- Full-text search on event titles and descriptions
- Genre filtering (Music, Theater, Comedy, Festival, Art, etc.)
- Date range filtering
- Price range filtering (free events supported)
- Venue-based filtering
- Multiple sort options (date, price, relevance)
- Pagination support

### 📊 Analytics Dashboard
- Real-time event statistics
- Genre distribution breakdown
- Top venues ranking
- Activity timeline
- Recently added events feed

### 🎪 47 Event Sources
│   │   ├── EventGrid.tsx
│   │   └── EventCard.tsx
│   └── lib/
│       └── scrapers/
│           ├── BaseScraper.ts
│           └── sites/
│               ├── 3ArenaScraper.ts
│               ├── TicketmasterScraper.ts
│               ├── EventbriteScraper.ts
│               └── [33 more scrapers...]
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (for task queue)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd dublin-events-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database and Redis URLs:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dublin_events"
REDIS_URL="redis://localhost:6379"
```

4. **Set up the database**
```bash
npm run db:generate
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Data Model

### Events
- Title, description, dates (start/end)
- Genre, ticket prices (min/max)
- Venue reference
- Ticket purchase URL
- Event image
- Active status

### Venues
- Name, address
- Latitude/longitude (for mapping)
- Phone, website, capacity

### Sources
- Scraper configuration
- Status (active/broken/disabled)
- Last scrape time
- Next scheduled scrape

### Event Sources
- Many-to-many relationship between events and sources
- Source-specific event ID
- Source-specific URL

## API Endpoints

### Events
- `GET /api/events` - Search and filter events
  - Query params: `search`, `dateFrom`, `dateTo`, `genre`, `priceMin`, `priceMax`, `venues`, `page`, `limit`
- `GET /api/events/[id]` - Get event details

### Venues
- `GET /api/venues` - List all venues

### Sources
- `GET /api/sources` - List data sources and status
- `GET /api/sources/[id]/status` - Get scraper status

## Scraping

### Running Scrapers

```bash
# Run all scrapers
npm run scraper

# Run specific scraper
node src/scrapers/runner.js --site ticketmaster
```

### Adding a New Scraper

1. Create a new file in `src/lib/scrapers/sites/` (e.g., `MySiteScraper.ts`)
2. Extend `BaseScraper` class
3. Implement the `scrape()` method
4. Register in scraper registry

Example:
```typescript
import { BaseScraper, ScrapedEvent } from '../BaseScraper'

export class MySiteScraper extends BaseScraper {
  constructor() {
    super('My Site', 'https://mysite.com', 'cheerio')
  }

  async scrape(): Promise<ScrapedEvent[]> {
    // Your scraping logic here
    const events: ScrapedEvent[] = []
    // ... extract events ...
    await this.saveEvents(events)
    return events
  }
}
```

## Scraping Strategy

### Categorized Approach

**Group 1: Ticketing Platforms** (Puppeteer - JS-heavy)
- ticketmaster.ie
- eventbrite.com

**Group 2: Major Venues** (Mixed - Puppeteer/Cheerio)
- 3arena.ie
- vicarstreet.com
- thegrandsocial.ie
- whelanslive.com

**Group 3: Theaters & Cultural** (Cheerio - HTML)
- theambassadortheatre.com
- buttonfactory.ie
- abbeytheatre.ie
- gatetheatre.ie

**Group 4: Comedy Clubs** (Cheerio - HTML)
- craicdencomedyclub.com
- hensteethdublin.com

**Group 5: Sports & Stadiums** (Mixed)
- avivastadium.ie
- crokepark.ie
- 3olympia.ie

**Group 6: Blogs & Listings** (Cheerio - HTML)
- nialler9.com/gig-guide
- diff.ie

**Group 7: Festivals** (Cheerio - HTML)
- dublinpride.ie
- bloomsdayfestival.ie
- tradfest.com
- And more...

### Rate Limiting & Ethics
- 1-second delay between requests (configurable)
- Respect robots.txt and Terms of Service
- User-Agent rotation
- Graceful error handling
- Daily schedule to avoid overloading servers

## Database Indexing

Optimized queries with these indexes:
- `date_start` - For date range queries
- `genre` - For filtering by genre
- `venue_id` - For venue lookups
- `is_active` - For status filtering
- Full-text search on title and description

## Performance Optimizations

- Database connection pooling
- Query result caching (React query)
- Lazy loading of event images
- Pagination (default 20 events per page)
- Request debouncing on frontend

## Monitoring & Health

- Source status dashboard
- Scraper error logs
- Last scrape timestamps
- Failed event detection
- Alert system for broken scrapers

## Deployment

### Deploy to Railway

1. Push code to GitHub
2. Connect Railway to your GitHub account
3. Create new service → Select repository
4. Add PostgreSQL and Redis plugins
5. Set environment variables
6. Deploy

### Environment Variables (Production)
```env
DATABASE_URL=<Railway PostgreSQL URL>
REDIS_URL=<Railway Redis URL>
NODE_ENV=production
```

## Testing

```bash
# Run tests
npm test

# Test specific scraper
npm test -- 3ArenaScraper
```

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check network connectivity

### Scraper Failing
- Check website structure hasn't changed
- Verify selectors in scraper code
- Check rate limiting isn't blocking requests
- Review error logs

### No Events Appearing
- Ensure scrapers have run at least once
- Check database has event records
- Verify source status isn't "disabled"

## Roadmap

- [ ] User accounts & favorites
- [ ] Email notifications for events
- [ ] Calendar view
- [ ] Map-based event discovery
- [ ] iOS/Android apps
- [ ] Event recommendations
- [ ] Social sharing
- [ ] Reviews & ratings

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for commercial or personal projects.

## Support

For issues or questions, open a GitHub issue or contact the maintainers.

---

**Built with ❤️ for Dublin's event community**
