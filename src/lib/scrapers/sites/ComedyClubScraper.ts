import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

/**
 * Generic comedy club scraper for venues with static HTML event listings
 * Examples: Craic Den Comedy Club, Hens Teeth Dublin, International Bar, etc.
 */
export class ComedyClubScraper extends BaseScraper {
  protected clubName: string
  protected clubUrl: string
  protected eventSelector: string
  protected titleSelector: string
  protected dateSelector: string
  protected priceSelector: string
  protected ticketUrlSelector: string

  constructor(
    clubName: string,
    clubUrl: string,
    eventSelector: string = '.event',
    titleSelector: string = '.event-title',
    dateSelector: string = '.event-date',
    priceSelector: string = '.event-price',
    ticketUrlSelector: string = 'a.book-ticket'
  ) {
    super(clubName, clubUrl, 'cheerio')
    this.clubName = clubName
    this.clubUrl = clubUrl
    this.eventSelector = eventSelector
    this.titleSelector = titleSelector
    this.dateSelector = dateSelector
    this.priceSelector = priceSelector
    this.ticketUrlSelector = ticketUrlSelector
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.clubName}] Starting scrape from ${this.clubUrl}...`)
    const events: ScrapedEvent[] = []

    try {
      const response = await fetch(this.clubUrl, {
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
            console.warn(`[${this.clubName}] Could not parse date: ${dateStr}`)
            return
          }

          events.push({
            title,
            dateStart: eventDate,
            venueName: this.clubName,
            genre: 'Comedy',
            ticketPriceMin: this.parsePrice(priceStr),
            ticketUrl: ticketLink
              ? ticketLink.startsWith('http')
                ? ticketLink
                : `${this.clubUrl}${ticketLink}`
              : undefined,
            sourceUrl: this.clubUrl,
          })
        } catch (error) {
          console.error(`[${this.clubName}] Error parsing event:`, error)
        }
      })

      console.log(`[${this.clubName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.clubName}] Scrape failed:`, error)
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

// Pre-configured scrapers for specific Dublin comedy clubs
export class CraicDenScraper extends ComedyClubScraper {
  constructor() {
    super(
      'Craic Den Comedy Club',
      'https://www.craicdencomedyclub.com',
      '.show-item',
      '.show-title',
      '.show-date',
      '.show-price',
      'a.tickets'
    )
  }
}

export class HensTeethScraper extends ComedyClubScraper {
  constructor() {
    super(
      'Hens Teeth Dublin',
      'https://www.hensteethdublin.com',
      '.event-row',
      '.event-name',
      '[data-date]',
      '.price',
      'a[href*="tickets"]'
    )
  }
}

export class InternationalBarScraper extends ComedyClubScraper {
  constructor() {
    super(
      'International Bar',
      'https://www.internationalbar.com',
      '.comedy-event',
      'h4',
      '.date',
      '.cost',
      'a.book-now'
    )
  }
}

export class StageworksScraper extends ComedyClubScraper {
  constructor() {
    super(
      'Stageworks Comedy Club',
      'https://www.stageworksdublin.com',
      '.event-listing',
      '.title',
      '.when',
      '.price',
      'a.get-tickets'
    )
  }
}

export class CabotHallScraper extends ComedyClubScraper {
  constructor() {
    super(
      'Cabot Hall Comedy',
      'https://www.cabothall.ie',
      '[data-event]',
      '.event-title',
      '.event-when',
      '.event-price',
      'a.purchase'
    )
  }
}
