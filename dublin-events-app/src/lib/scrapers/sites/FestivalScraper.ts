import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

/**
 * Festival and special events scraper for seasonal and annual events
 * Examples: Dublin Pride, Bloomsday Festival, Tradfest, Electric Picnic coverage, etc.
 */
export class FestivalScraper extends BaseScraper {
  protected festivalName: string
  protected festivalUrl: string
  protected eventSelector: string
  protected titleSelector: string
  protected dateSelector: string
  protected priceSelector: string
  protected ticketUrlSelector: string
  protected genre: string

  constructor(
    festivalName: string,
    festivalUrl: string,
    genre: string = 'Festival',
    eventSelector: string = '.event',
    titleSelector: string = '.event-title',
    dateSelector: string = '.event-date',
    priceSelector: string = '.event-price',
    ticketUrlSelector: string = 'a.tickets'
  ) {
    super(festivalName, festivalUrl, 'cheerio')
    this.festivalName = festivalName
    this.festivalUrl = festivalUrl
    this.genre = genre
    this.eventSelector = eventSelector
    this.titleSelector = titleSelector
    this.dateSelector = dateSelector
    this.priceSelector = priceSelector
    this.ticketUrlSelector = ticketUrlSelector
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.festivalName}] Starting scrape from ${this.festivalUrl}...`)
    const events: ScrapedEvent[] = []

    try {
      const response = await fetch(this.festivalUrl, {
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
            console.warn(`[${this.festivalName}] Could not parse date: ${dateStr}`)
            return
          }

          events.push({
            title,
            dateStart: eventDate,
            venueName: this.festivalName,
            genre: this.genre,
            ticketPriceMin: this.parsePrice(priceStr),
            ticketUrl: ticketLink
              ? ticketLink.startsWith('http')
                ? ticketLink
                : `${this.festivalUrl}${ticketLink}`
              : undefined,
            sourceUrl: this.festivalUrl,
          })
        } catch (error) {
          console.error(`[${this.festivalName}] Error parsing event:`, error)
        }
      })

      console.log(`[${this.festivalName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.festivalName}] Scrape failed:`, error)
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

// Pre-configured scrapers for specific Dublin festivals
export class DublinPrideScraper extends FestivalScraper {
  constructor() {
    super(
      'Dublin Pride',
      'https://www.dublinpride.ie',
      'Festival',
      '.pride-event',
      '.event-title',
      '.event-date',
      '.price',
      'a.book'
    )
  }
}

export class BloomsdayFestivalScraper extends FestivalScraper {
  constructor() {
    super(
      'Bloomsday Festival',
      'https://www.bloomsdayfestival.ie',
      'Festival',
      '.festival-event',
      '.title',
      '.when',
      '.cost',
      'a.register'
    )
  }
}

export class TradfestScraper extends FestivalScraper {
  constructor() {
    super(
      'Tradfest',
      'https://www.tradfest.com',
      'Music',
      '.show',
      '.show-name',
      '.show-date',
      '.price',
      'a.book-now'
    )
  }
}

export class DublinFringeFestivalScraper extends FestivalScraper {
  constructor() {
    super(
      'Dublin Fringe Festival',
      'https://www.fringefest.com',
      'Festival',
      '[data-event]',
      '.event-title',
      '.event-dates',
      '.event-price',
      'a.tickets'
    )
  }
}

export class IrishTheatreFestivalScraper extends FestivalScraper {
  constructor() {
    super(
      'Irish Theatre Festival',
      'https://www.irishtheatrefestival.ie',
      'Theater',
      '.show-item',
      '.show-title',
      '.dates',
      '.ticket-price',
      'a.get-tickets'
    )
  }
}

export class DublinBookFestivalScraper extends FestivalScraper {
  constructor() {
    super(
      'Dublin Book Festival',
      'https://www.dublinbookfestival.ie',
      'Festival',
      '.event-card',
      '.event-name',
      '.event-date',
      '.entry-fee',
      'a.sign-up'
    )
  }
}

export class DublinJazzFestivalScraper extends FestivalScraper {
  constructor() {
    super(
      'Dublin Jazz Festival',
      'https://www.dublinJazz.ie',
      'Music',
      '.concert',
      '.concert-name',
      '.concert-date',
      '.concert-price',
      'a.book-ticket'
    )
  }
}

export class BeadfestScraper extends FestivalScraper {
  constructor() {
    super(
      'Beadfest',
      'https://www.beadfest.com',
      'Festival',
      '.event',
      '.event-title',
      '.starts-at',
      '.price-tag',
      'a.buy-tickets'
    )
  }
}
