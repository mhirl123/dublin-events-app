import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

/**
 * Generic music venue scraper for static HTML event listings
 * Examples: Vicar Street, Whelans, The Grand Social, etc.
 */
export class MusicVenueScraper extends BaseScraper {
  protected venueName: string
  protected venueUrl: string
  protected eventSelector: string
  protected titleSelector: string
  protected dateSelector: string
  protected priceSelector: string
  protected ticketUrlSelector: string

  constructor(
    venueName: string,
    venueUrl: string,
    eventSelector: string = '.event',
    titleSelector: string = '.event-name',
    dateSelector: string = '.event-date',
    priceSelector: string = '.event-price',
    ticketUrlSelector: string = 'a.buy-tickets'
  ) {
    super(venueName, venueUrl, 'cheerio')
    this.venueName = venueName
    this.venueUrl = venueUrl
    this.eventSelector = eventSelector
    this.titleSelector = titleSelector
    this.dateSelector = dateSelector
    this.priceSelector = priceSelector
    this.ticketUrlSelector = ticketUrlSelector
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.venueName}] Starting scrape from ${this.venueUrl}...`)
    const events: ScrapedEvent[] = []

    try {
      const response = await fetch(this.venueUrl, {
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
            console.warn(`[${this.venueName}] Could not parse date: ${dateStr}`)
            return
          }

          events.push({
            title,
            dateStart: eventDate,
            venueName: this.venueName,
            genre: 'Music',
            ticketPriceMin: this.parsePrice(priceStr),
            ticketUrl: ticketLink
              ? ticketLink.startsWith('http')
                ? ticketLink
                : `${this.venueUrl}${ticketLink}`
              : undefined,
            sourceUrl: this.venueUrl,
          })
        } catch (error) {
          console.error(`[${this.venueName}] Error parsing event:`, error)
        }
      })

      console.log(`[${this.venueName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.venueName}] Scrape failed:`, error)
    }

    // Save to database
    if (events.length > 0) {
      await this.saveEvents(events)
    }

    await this.cleanup()
    return events
  }

  protected parseDate(dateStr: string): Date {
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

// Pre-configured scrapers for specific Dublin music venues
export class VicarStreetScraper extends MusicVenueScraper {
  constructor() {
    super(
      'Vicar Street',
      'https://www.vicarstreet.com',
      '.event-box',
      '.event-title',
      '.event-date',
      '.event-price',
      'a.book-now'
    )
  }
}

export class WhelansScraper extends MusicVenueScraper {
  constructor() {
    super(
      'Whelans',
      'https://www.whelanslive.com',
      '.event-item',
      '.event-name',
      '[data-date]',
      '.price',
      'a[href*="tickets"]'
    )
  }
}

export class GrandSocialScraper extends MusicVenueScraper {
  constructor() {
    super(
      'The Grand Social',
      'https://www.thegrandsocial.ie',
      '.show',
      '.show-title',
      '.show-date',
      '.show-cost',
      'a.tickets-link'
    )
  }
}

export class SoundHouseScraper extends MusicVenueScraper {
  constructor() {
    super(
      'SoundHouse',
      'https://www.soundhouse.ie',
      '.event',
      '.event-name',
      '.when',
      '.cost',
      'a.buy'
    )
  }
}

export class DogstarScraper extends MusicVenueScraper {
  constructor() {
    super(
      'Dogstar',
      'https://www.dogstardublin.com',
      '.event-listing',
      'h3',
      '.date-info',
      '.price-info',
      'a.purchase-tickets'
    )
  }
}

export class LiquidDublinScraper extends MusicVenueScraper {
  constructor() {
    super(
      'Liquid Dublin',
      'https://www.liquiddublin.com',
      '[data-event]',
      '.event-title',
      '.event-date',
      '.ticket-price',
      'a.get-tickets'
    )
  }
}
