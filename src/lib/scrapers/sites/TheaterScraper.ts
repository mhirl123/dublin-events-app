import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

/**
 * Generic theater scraper template for venues with static HTML event listings
 * Examples: Abbey Theatre, Gate Theatre, Ambassador Theatre, etc.
 */
export class TheaterScraper extends BaseScraper {
  protected theaterName: string
  protected theaterUrl: string
  protected eventSelector: string // CSS selector for event containers
  protected titleSelector: string
  protected dateSelector: string
  protected priceSelector: string
  protected ticketUrlSelector: string

  constructor(
    theaterName: string,
    theaterUrl: string,
    eventSelector: string = '.event-item',
    titleSelector: string = '.event-title',
    dateSelector: string = '.event-date',
    priceSelector: string = '.event-price',
    ticketUrlSelector: string = 'a.ticket-link'
  ) {
    super(theaterName, theaterUrl, 'cheerio')
    this.theaterName = theaterName
    this.theaterUrl = theaterUrl
    this.eventSelector = eventSelector
    this.titleSelector = titleSelector
    this.dateSelector = dateSelector
    this.priceSelector = priceSelector
    this.ticketUrlSelector = ticketUrlSelector
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.theaterName}] Starting scrape from ${this.theaterUrl}...`)
    const events: ScrapedEvent[] = []

    try {
      // Fetch the page
      const response = await fetch(`${this.theaterUrl}/whats-on`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Parse events from the page
      $(this.eventSelector).each((index, element) => {
        try {
          const $event = $(element)

          const title = $event.find(this.titleSelector).text().trim()
          const dateStr = $event.find(this.dateSelector).attr('data-date') ||
            $event.find(this.dateSelector).text().trim() || null
          const priceStr = $event.find(this.priceSelector).text().trim()
          const ticketLink =
            $event.find(this.ticketUrlSelector).attr('href') || null

          if (!title || !dateStr) return // Skip if missing critical data

          // Parse date
          let eventDate: Date
          try {
            eventDate = this.parseDate(dateStr)
          } catch {
            console.warn(`[${this.theaterName}] Could not parse date: ${dateStr}`)
            return
          }

          events.push({
            title,
            dateStart: eventDate,
            venueName: this.theaterName,
            genre: 'Theater',
            ticketPriceMin: this.parsePrice(priceStr),
            ticketUrl: ticketLink
              ? ticketLink.startsWith('http')
                ? ticketLink
                : `${this.theaterUrl}${ticketLink}`
              : undefined,
            sourceUrl: `${this.theaterUrl}/whats-on`,
          })
        } catch (error) {
          console.error(`[${this.theaterName}] Error parsing event:`, error)
        }
      })

      console.log(`[${this.theaterName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.theaterName}] Scrape failed:`, error)
    }

    // Save to database
    if (events.length > 0) {
      await this.saveEvents(events)
    }

    await this.cleanup()
    return events
  }

  protected parseDate(dateStr: string): Date {
    // Try common formats: "15 Sept 2026", "Sept 15, 2026", "15-09-2026", etc.
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`)
    }
    return date
  }

  protected parsePrice(priceStr: string): number | undefined {
    if (!priceStr) return undefined
    const match = priceStr.match(/€?([\d.]+)/)
    return match ? parseFloat(match[1]) : undefined
  }
}

// Pre-configured scrapers for specific Dublin theaters
export class AbbeyTheatreScraper extends TheaterScraper {
  constructor() {
    super(
      'Abbey Theatre',
      'https://www.abbeytheatre.ie',
      '[data-event]', // Adjust selectors based on actual HTML structure
      '.event-title',
      '[data-date]',
      '.event-price',
      'a[href*="/tickets"]'
    )
  }
}

export class GateTheatreScraper extends TheaterScraper {
  constructor() {
    super(
      'Gate Theatre',
      'https://gatetheatre.ie',
      '.event-card',
      '.event-name',
      '.event-date',
      '.event-price',
      'a.get-tickets'
    )
  }
}

export class AmbassadorTheatreScraper extends TheaterScraper {
  constructor() {
    super(
      'The Ambassador Theatre',
      'https://theambassadortheatre.com',
      '.production-item',
      '.title',
      '.date',
      '.price',
      'a.book-link'
    )
  }
}

export class ButtonFactoryScraper extends TheaterScraper {
  constructor() {
    super(
      'Button Factory',
      'https://buttonfactory.ie',
      '.show',
      '.show-title',
      '.show-date',
      '.show-price',
      'a.tickets'
    )
  }
}

export class GaietyTheatreScraper extends TheaterScraper {
  constructor() {
    super(
      'Gaiety Theatre',
      'https://gaietytheatre.ie',
      '.performance',
      'h3',
      '.perf-date',
      '.perf-price',
      'a[href*="tickets"]'
    )
  }
}
