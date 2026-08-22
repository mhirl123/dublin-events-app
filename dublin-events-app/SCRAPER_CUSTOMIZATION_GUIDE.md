# Scraper Customization Guide

How to create, update, and customize event scrapers for Dublin Events app.

---

## Quick Start: Adding a New Scraper

### 1. Find the Right Base Class

Choose based on venue type:

| Venue Type | Base Class | Import | Use When |
|-----------|-----------|--------|----------|
| Theater | `TheaterScraper` | `from '@/lib/scrapers/sites/TheaterScraper'` | Theater productions |
| Comedy Club | `ComedyClubScraper` | `from '@/lib/scrapers/sites/ComedyClubScraper'` | Stand-up/comedy shows |
| Music Venue | `MusicVenueScraper` | `from '@/lib/scrapers/sites/MusicVenueScraper'` | Live music events |
| Festival | `FestivalScraper` | `from '@/lib/scrapers/sites/FestivalScraper'` | Annual festivals |
| Cultural Venue | `CulturalVenueScraper` | `from '@/lib/scrapers/sites/CulturalVenueScraper'` | Arts/classical/cultural |
| Stadium | `StadiumScraper` | `from '@/lib/scrapers/sites/StadiumScraper'` | Sports/large venues |
| Event Blog | `EventBlogScraper` | `from '@/lib/scrapers/sites/EventBlogScraper'` | Aggregators/blogs |
| Custom | `BaseScraper` | `from '@/lib/scrapers/BaseScraper'` | Unique venue structures |

### 2. Create a New Scraper Class

Example: Adding a new music venue

```typescript
import { MusicVenueScraper } from '@/lib/scrapers/sites/MusicVenueScraper'

export class NewMusicVenueScraper extends MusicVenueScraper {
  constructor() {
    super(
      'Venue Name',           // venueName
      'https://venue-url.ie', // venueUrl
      '.event-item',          // eventSelector
      '.event-title',         // titleSelector
      '.event-date',          // dateSelector
      '.event-price',         // priceSelector
      'a.buy-tickets'         // ticketUrlSelector
    )
  }
}
```

### 3. Find the Right CSS Selectors

Open browser DevTools on the venue's events page and inspect the HTML:

```html
<!-- Example venue event listing structure -->
<div class="event-item">
  <h3 class="event-title">Event Name</h3>
  <span class="event-date" data-date="2026-09-15">Sept 15</span>
  <span class="event-price">€25.00</span>
  <a href="/tickets/123" class="buy-tickets">Get Tickets</a>
</div>
```

Map these to selectors:
- `eventSelector`: `.event-item` (container for entire event)
- `titleSelector`: `.event-title` (find inside event container)
- `dateSelector`: `.event-date` (find inside event container)
- `priceSelector`: `.event-price` (find inside event container)
- `ticketUrlSelector`: `a.buy-tickets` (find inside event container)

### 4. Register in Runner

Add to `src/scrapers/runner.ts`:

```typescript
import { NewMusicVenueScraper } from '@/lib/scrapers/sites/MusicVenueScraper'

const scraperRegistry = [
  // ... existing scrapers ...
  new NewMusicVenueScraper(),
]
```

### 5. Test the Scraper

```bash
cd /root/dublin-events-app
npm run scrape-dev  # Run in development mode
```

Check logs for:
- ✅ HTTP connection success
- ✅ Events parsed count
- ✅ Database save status

---

## Detailed Customization

### Selector Deep Dive

#### Finding Event Containers

Most venues have a repeating element for each event:

```html
<!-- Good: Clear container -->
<div class="event">...</div>
<div class="event">...</div>

<!-- Also good: Table row -->
<tr class="show-row">...</tr>
<tr class="show-row">...</tr>

<!-- Also good: List item -->
<li class="gig">...</li>
<li class="gig">...</li>

<!-- Less common: Article tag -->
<article class="event-post">...</article>
```

**Browser DevTools Tip:**
1. Right-click event on page → "Inspect"
2. Look for repeating parent `<div>`, `<tr>`, `<li>`, or `<article>`
3. Note its class name or data attribute
4. Use that as `eventSelector`

#### Finding Title Element

Event titles are usually in:
- `<h2>`, `<h3>`, or `<h4>` tags
- Elements with class containing "title", "name", "event"
- First text within event container

```html
<div class="event">
  <h3 class="event-title">Artist Name</h3>  <!-- Good -->
  <!-- OR -->
  <div class="event-name">Band Name</div>    <!-- Also good -->
  <!-- OR -->
  <a href="/events/123">Show Name</a>        <!-- Last resort -->
</div>
```

#### Finding Date Element

Dates are often in:
- `data-date` attribute (best option - sortable)
- `<span>` or `<div>` with class "date", "when", "datetime"
- Title attribute of elements
- Text like "15 Sept 2026" or "Fri 15/09"

```html
<span class="event-date" data-date="2026-09-15">
  Sept 15, 2026
</span>

<!-- OR simpler -->
<span class="when">15 Sept 2026</span>
```

**Good to Bad:**
1. ✅ `data-date="2026-09-15"` - ISO format
2. ✅ `data-date="15/09/2026"` - European format
3. ✅ Display text "15 Sept 2026" - Parser handles this
4. ❌ "Next Friday" - Too vague, might fail parsing

#### Finding Price Element

Prices should have:
- Currency symbol (€ or Euro)
- Numeric value
- Common patterns: "€25", "€25.00", "from €15"

```html
<span class="price">€25</span>
<!-- OR -->
<span class="price">from €20</span>
<!-- OR -->
<span class="price">Free</span>  <!-- Handled gracefully -->
```

#### Finding Ticket URL

Links to purchase tickets usually:
- Are `<a>` tags with href
- Have text like "Buy", "Get Tickets", "Book Now", "Tickets"
- Point to `/tickets`, external ticketing site, or email

```html
<a href="https://example.com/buy" class="buy-tickets">
  Get Tickets
</a>

<!-- OR simpler -->
<a href="/book-tickets">Book Now</a>
```

---

## Advanced Customization

### Override parseDate()

If venue uses unusual date formats:

```typescript
export class CustomVenueScraper extends MusicVenueScraper {
  constructor() {
    super('Venue', 'https://venue.ie', /* selectors... */)
  }

  protected parseDate(dateStr: string): Date {
    // Custom parsing for "Next Friday at 8pm"
    if (dateStr.includes('Next Friday')) {
      const friday = new Date()
      friday.setDate(friday.getDate() + ((5 + 7 - friday.getDay()) % 7))
      return friday
    }

    // Fall back to default parsing
    return super.parseDate(dateStr)
  }
}
```

### Override parsePrice()

Custom price extraction:

```typescript
protected parsePrice(priceStr: string): number | undefined {
  // Handle venue-specific formats like "€20-€30"
  const match = priceStr.match(/€(\d+)/)
  return match ? parseFloat(match[1]) : undefined
}
```

### Override inferGenre()

For stadiums or mixed venues:

```typescript
// StadiumScraper example
protected inferGenre(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('rugby')) return 'Sports'
  if (lower.includes('concert')) return 'Music'
  if (lower.includes('festival')) return 'Festival'
  return 'Sports'
}
```

### Custom Scrape Logic

For venues needing special handling:

```typescript
export class SpecialVenueScraper extends BaseScraper {
  async scrape(): Promise<ScrapedEvent[]> {
    const events: ScrapedEvent[] = []

    try {
      // 1. Fetch
      const response = await fetch(this.venueUrl)
      const html = await response.text()

      // 2. Custom parsing logic
      const $ = cheerio.load(html)
      
      // Custom selector or multi-step parsing
      const eventElements = $('.event, .show, .performance')
      
      eventElements.each((i, el) => {
        const title = $(el).find('h3').text().trim()
        // ... custom extraction ...
      })

      // 3. Save
      if (events.length > 0) {
        await this.saveEvents(events)
      }
    } catch (error) {
      console.error(`Error:`, error)
    }

    await this.cleanup()
    return events
  }
}
```

---

## Testing Your Scraper

### Manual Testing

```bash
# Create a test file
cat > test-scraper.ts << 'EOF'
import { YourNewScraper } from '@/lib/scrapers/sites/YourFile'

async function test() {
  const scraper = new YourNewScraper()
  const events = await scraper.scrape()
  console.log('Events found:', events.length)
  events.forEach(e => {
    console.log(`- ${e.title} on ${e.dateStart} @ ${e.venueName}`)
  })
}

test().catch(console.error)
EOF

# Run it
npx ts-node test-scraper.ts
```

### What to Check

1. **HTTP Connection**
   ```
   ✅ Should see: "Starting scrape from..."
   ❌ If fails: Check URL, venue website status
   ```

2. **Event Parsing**
   ```
   ✅ Should see: "Found N events"
   ❌ If 0 events: Selectors don't match HTML structure
   ```

3. **Event Details**
   ```
   ✅ Each event should have:
      - title: string (non-empty)
      - dateStart: valid Date
      - venueName: string
      - genre: string
   ```

4. **Database**
   ```
   ✅ After save, check database:
   SELECT * FROM "Event" WHERE venue_name = 'Your Venue'
   ```

### Debugging Tips

If selectors aren't working:

```javascript
// In browser console on venue's events page
// Find the event container
document.querySelectorAll('.event-item')  // Try your selector

// Find title within first event
document.querySelector('.event-item .event-title')

// Get actual text
document.querySelector('.event-item .event-title').textContent

// Check all classes in event
document.querySelector('.event-item').className
document.querySelector('.event-item').innerHTML
```

---

## Common Issues & Solutions

### Issue: "Found 0 events"

**Possible Causes:**
1. Event selector doesn't match DOM
2. Venue uses JavaScript to render events (needs Puppeteer)
3. Events are in a different element structure

**Solutions:**
```typescript
// Try alternative selectors
'.event-item'      // Primary
'.event'           // Simpler
'[data-event]'     // Data attribute
'tr.show'          // Table row
'li.gig'           // List item

// Try with different base selector
$(this.eventSelector).each(...)     // Current
$('div.event').each(...)            // Alternative
$('article').each(...)              // Alternative
```

### Issue: "Could not parse date"

**Causes:**
- Date format doesn't match expectations
- Date in different element than expected
- Date stored in data attribute not text

**Solution:**
```typescript
protected parseDate(dateStr: string): Date {
  // Debug: log what we received
  console.log('Parsing date:', dateStr)
  
  // Try multiple formats
  if (dateStr.includes('Sept')) {
    return new Date(dateStr)  // "15 Sept 2026" works
  }
  
  if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/')
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  }
  
  return new Date(dateStr)  // Fallback
}
```

### Issue: "Price extraction failing"

**Common patterns:**
```
€25          // works
€25.00       // works  
from €20     // works (extracts 20)
€20-€30      // gets first (20)
Free         // returns undefined
Sold Out     // returns undefined
```

**Custom handling:**
```typescript
protected parsePrice(priceStr: string): number | undefined {
  if (!priceStr || priceStr.includes('Free') || priceStr.includes('Sold')) {
    return undefined
  }
  const match = priceStr.match(/€?([\d.]+)/)
  return match ? parseFloat(match[1]) : undefined
}
```

### Issue: "Ticket links not working"

**Check:**
1. Links are absolute URLs or can be made absolute
2. Event selector is finding the right container
3. Link element exists within container

```typescript
// Should be found by:
$event.find(this.ticketUrlSelector).attr('href')

// Debug:
const ticketLink = $event.find('a').first().attr('href')
console.log('Link found:', ticketLink)

// Final URL construction:
ticketLink?.startsWith('http')
  ? ticketLink
  : `${this.venueUrl}${ticketLink}`
```

---

## Scraper Lifecycle

```
1. Constructor Called
   ├─ Store venue name, URL, selectors
   └─ Call super() with scraper type

2. scrape() Method Executed
   ├─ Fetch HTML from venueUrl
   ├─ Load HTML with Cheerio
   ├─ For each event element:
   │  ├─ Extract title, date, price, ticket URL
   │  ├─ Validate critical fields (title, date)
   │  ├─ Parse/normalize data
   │  ├─ Handle individual errors
   │  └─ Add to events array
   ├─ Log summary (events found)
   └─ Return early if no events

3. saveEvents() Called (if events exist)
   ├─ Create/find venue in database
   ├─ For each event:
   │  ├─ Generate content hash
   │  ├─ Check if duplicate
   │  ├─ Create event record
   │  └─ Link via EventSource table
   └─ Persist to database

4. cleanup() Called
   └─ Disconnect Prisma client
```

---

## Best Practices

### ✅ DO

1. **Use semantic selectors**
   - `.event-title` better than `.red-text-large`
   - `[data-event-id]` better than `.item-23`

2. **Handle missing data gracefully**
   ```typescript
   if (!title || !dateStr) return // Skip this event
   ```

3. **Validate before saving**
   ```typescript
   if (!eventDate || isNaN(eventDate.getTime())) {
     console.warn('Invalid date:', dateStr)
     return
   }
   ```

4. **Use descriptive logging**
   ```typescript
   console.log(`[${this.venueName}] Found ${events.length} events`)
   console.warn(`[${this.venueName}] Could not parse date: ${dateStr}`)
   ```

5. **Extend appropriate base class**
   - Use MusicVenueScraper for music venues (not BaseScraper)
   - Use FestivalScraper for festivals (not TheaterScraper)

### ❌ DON'T

1. **Don't use hardcoded selectors in loop**
   ```typescript
   // Bad
   $event.find('.title') 
   
   // Good - use this.titleSelector
   $event.find(this.titleSelector)
   ```

2. **Don't ignore parsing errors**
   ```typescript
   // Bad
   eventDate = new Date(dateStr)
   
   // Good
   try {
     eventDate = this.parseDate(dateStr)
   } catch {
     console.warn(`Could not parse: ${dateStr}`)
     return
   }
   ```

3. **Don't modify event data unpredictably**
   ```typescript
   // Bad - unclear transformation
   title = title.slice(0, 20)
   
   // Good - explicit and justified
   title = title.trim() // Remove whitespace
   ```

4. **Don't assume URL structure**
   ```typescript
   // Bad
   ticketUrl = `${this.venueUrl}/tickets/${id}`
   
   // Good - use actual href
   ticketUrl = $event.find('a').attr('href')
   if (!ticketUrl?.startsWith('http')) {
     ticketUrl = `${this.venueUrl}${ticketUrl}`
   }
   ```

5. **Don't leave broken selectors**
   ```typescript
   // If scraper returns 0 events, check selectors!
   // Don't just add a comment and move on
   ```

---

## Quick Reference: Selector Examples

### Theater Sites
```typescript
// Abbey Theatre style
eventSelector: '[data-event]'
titleSelector: '.event-title'
dateSelector: '[data-date]'
priceSelector: '.event-price'
ticketUrlSelector: 'a[href*="/tickets"]'

// Gate Theatre style
eventSelector: '.event-card'
titleSelector: '.event-name'
dateSelector: '.event-date'
priceSelector: '.event-price'
ticketUrlSelector: 'a.get-tickets'
```

### Comedy Clubs
```typescript
eventSelector: '.show-item'
titleSelector: '.show-title'
dateSelector: '.show-date'
priceSelector: '.price'
ticketUrlSelector: 'a.book-ticket'
```

### Music Venues
```typescript
eventSelector: '.event-item'
titleSelector: '.event-name'
dateSelector: '.when'
priceSelector: '.cost'
ticketUrlSelector: 'a.buy-now'
```

### Festivals
```typescript
eventSelector: '.festival-event'
titleSelector: '.event-title'
dateSelector: '.dates'
priceSelector: '.admission'
ticketUrlSelector: 'a.register'
```

---

## Database Schema Reference

Your scrapers interact with these tables:

### events
```sql
- id: UUID (primary key)
- title: string
- date_start: timestamp
- date_end: timestamp?
- venue_id: UUID (foreign key to venues)
- genre: string
- ticket_price_min: decimal?
- ticket_price_max: decimal?
- ticket_url: string?
- image_url: string?
- is_active: boolean
```

### venues
```sql
- id: UUID (primary key)
- name: string (unique index)
- address: string?
- website: string?
```

### sources
```sql
- id: UUID (primary key)
- name: string
- url: string (unique)
- scraper_type: string ('cheerio' or 'puppeteer')
- last_scraped_at: timestamp?
```

### event_sources
```sql
- event_id: UUID (foreign key to events)
- source_id: UUID (foreign key to sources)
- source_url: string
- source_event_id: string? (external ID)
PRIMARY KEY (event_id, source_id)
```

---

**Last Updated:** August 21, 2026  
**Version:** 1.0  
**Status:** Ready for use

For questions or issues, check `SCRAPER_REGISTRY.md` or review existing scraper implementations in `src/lib/scrapers/sites/`
