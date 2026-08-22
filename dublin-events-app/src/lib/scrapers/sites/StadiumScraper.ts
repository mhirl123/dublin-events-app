import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

/**
 * Stadium and large venue scraper for sports, concerts, and major events
 * Examples: Aviva Stadium, Croke Park, Landowne Road, etc.
 */
export class StadiumScraper extends BaseScraper {
  protected stadiumName: string
  protected stadiumUrl: string
  protected eventSelector: string
  protected titleSelector: string
  protected dateSelector: string
  protected priceSelector: string
  protected ticketUrlSelector: string

  constructor(
    stadiumName: string,
    stadiumUrl: string,
    eventSelector: string = '.event',
    titleSelector: string = '.event-title',
    dateSelector: string = '.event-date',
    priceSelector: string = '.event-price',
    ticketUrlSelector: string = 'a.tickets'
  ) {
    super(stadiumName, stadiumUrl, 'cheerio')
    this.stadiumName = stadiumName
    this.stadiumUrl = stadiumUrl
    this.eventSelector = eventSelector
    this.titleSelector = titleSelector
    this.dateSelector = dateSelector
    this.priceSelector = priceSelector
    this.ticketUrlSelector = ticketUrlSelector
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.stadiumName}] Starting scrape from ${this.stadiumUrl}...`)
    const events: ScrapedEvent[] = []

    try {
      const response = await fetch(this.stadiumUrl, {
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
            console.warn(`[${this.stadiumName}] Could not parse date: ${dateStr}`)
            return
          }

          // Determine genre based on event title
          const genre = this.inferGenre(title)

          events.push({
            title,
            dateStart: eventDate,
            venueName: this.stadiumName,
            genre,
            ticketPriceMin: this.parsePrice(priceStr),
            ticketUrl: ticketLink
              ? ticketLink.startsWith('http')
                ? ticketLink
                : `${this.stadiumUrl}${ticketLink}`
              : undefined,
            sourceUrl: this.stadiumUrl,
          })
        } catch (error) {
          console.error(`[${this.stadiumName}] Error parsing event:`, error)
        }
      })

      console.log(`[${this.stadiumName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.stadiumName}] Scrape failed:`, error)
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

  protected inferGenre(title: string): string {
    const titleLower = title.toLowerCase()

    if (titleLower.includes('rugby') || titleLower.includes('football') ||
        titleLower.includes('soccer') || titleLower.includes('match')) {
      return 'Sports'
    } else if (titleLower.includes('concert') || titleLower.includes('music')) {
      return 'Music'
    } else if (titleLower.includes('festival')) {
      return 'Festival'
    }

    return 'Sports'
  }
}

// Pre-configured scrapers for Dublin stadiums
export class AvivaStadiumScraper extends StadiumScraper {
  constructor() {
    super(
      'Aviva Stadium',
      'https://www.avivastadium.ie',
      '.event-card',
      '.event-name',
      '.event-date',
      '.ticket-price',
      'a.book-tickets'
    )
  }
}

export class CrokeParkScraper extends StadiumScraper {
  constructor() {
    super(
      'Croke Park',
      'https://www.crokepark.ie',
      '.fixture',
      '.fixture-name',
      '[data-date]',
      '.price',
      'a.purchase'
    )
  }
}

export class LandoweScraper extends StadiumScraper {
  constructor() {
    super(
      'Landowne Road',
      'https://www.landownroad.com',
      '.event',
      '.event-title',
      '.when',
      '.cost',
      'a.book-now'
    )
  }
}

export class TallinkScraper extends StadiumScraper {
  constructor() {
    super(
      'Tallink Waterfront',
      'https://www.tallinkwaterfront.ie',
      '[data-event]',
      '.event-name',
      '.event-date',
      '.entry-fee',
      'a.register'
    )
  }
}

export class RushanScraper extends StadiumScraper {
  constructor() {
    super(
      'Rushan Events',
      'https://www.rushangambar.ie',
      '.show',
      '.show-title',
      '.show-date',
      '.price',
      'a.get-tickets'
    )
  }
}
