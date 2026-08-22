import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

/**
 * Event blog and aggregator scraper for curated event listings
 * Examples: Nialler9, Diff.ie - these sites aggregate and summarize events
 */
export class EventBlogScraper extends BaseScraper {
  protected blogName: string
  protected blogUrl: string
  protected gigGuidePath: string
  protected eventSelector: string
  protected titleSelector: string
  protected dateSelector: string
  protected priceSelector: string
  protected ticketUrlSelector: string

  constructor(
    blogName: string,
    blogUrl: string,
    gigGuidePath: string = '/gig-guide',
    eventSelector: string = '.event',
    titleSelector: string = '.event-name',
    dateSelector: string = '.event-date',
    priceSelector: string = '.event-price',
    ticketUrlSelector: string = 'a.details'
  ) {
    super(blogName, blogUrl, 'cheerio')
    this.blogName = blogName
    this.blogUrl = blogUrl
    this.gigGuidePath = gigGuidePath
    this.eventSelector = eventSelector
    this.titleSelector = titleSelector
    this.dateSelector = dateSelector
    this.priceSelector = priceSelector
    this.ticketUrlSelector = ticketUrlSelector
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.blogName}] Starting scrape from ${this.blogUrl}...`)
    const events: ScrapedEvent[] = []

    try {
      const fullUrl = `${this.blogUrl}${this.gigGuidePath}`
      const response = await fetch(fullUrl, {
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
            console.warn(`[${this.blogName}] Could not parse date: ${dateStr}`)
            return
          }

          events.push({
            title,
            dateStart: eventDate,
            venueName: this.blogName,
            genre: 'Music', // Event blogs primarily focus on music
            ticketPriceMin: this.parsePrice(priceStr),
            ticketUrl: ticketLink
              ? ticketLink.startsWith('http')
                ? ticketLink
                : `${this.blogUrl}${ticketLink}`
              : undefined,
            sourceUrl: fullUrl,
          })
        } catch (error) {
          console.error(`[${this.blogName}] Error parsing event:`, error)
        }
      })

      console.log(`[${this.blogName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.blogName}] Scrape failed:`, error)
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

/**
 * Nialler9 gig guide scraper
 * Nialler9 is a popular Irish music blog with curated gig listings
 */
export class Nialler9Scraper extends EventBlogScraper {
  constructor() {
    super(
      'Nialler9 Gig Guide',
      'https://www.nialler9.com',
      '/gig-guide',
      '.gig-item',
      '.gig-title',
      '.gig-date',
      '.price',
      'a.details'
    )
  }
}

/**
 * Diff.ie scraper
 * Irish events and community listings
 */
export class DiffIeScraper extends EventBlogScraper {
  constructor() {
    super(
      'Diff.ie Events',
      'https://www.diff.ie',
      '/events',
      '.event-listing',
      '.event-title',
      '.date',
      '.cost',
      'a.more-info'
    )
  }
}

/**
 * Totally Dublin scraper
 * Local Dublin events and activities guide
 */
export class TotallyDublinScraper extends EventBlogScraper {
  constructor() {
    super(
      'Totally Dublin',
      'https://www.totallydublin.ie',
      '/events',
      '.event-post',
      '.post-title',
      '.event-date',
      '.admission',
      'a.read-more'
    )
  }
}

/**
 * The Skinny scraper
 * Scottish and Irish events coverage
 */
export class TheSkinnyDublinScraper extends EventBlogScraper {
  constructor() {
    super(
      'The Skinny Dublin',
      'https://www.theskinny.co.uk',
      '/dublin/events',
      '.event-card',
      '.event-name',
      '[data-date]',
      '.price',
      'a.find-out-more'
    )
  }
}

/**
 * Dublin Decoded scraper
 * Dublin events and cultural listings
 */
export class DublinDecodedScraper extends EventBlogScraper {
  constructor() {
    super(
      'Dublin Decoded',
      'https://www.dublindecoded.ie',
      '/events',
      '.event-item',
      '.title',
      '.when',
      '.price',
      'a.learn-more'
    )
  }
}

/**
 * Irish Music Tour scraper
 * Concert and gig listings aggregator
 */
export class IrishMusicTourScraper extends EventBlogScraper {
  constructor() {
    super(
      'Irish Music Tour',
      'https://www.irishmusictour.ie',
      '/concerts',
      '.concert',
      '.concert-name',
      '.concert-date',
      '.ticket-price',
      'a.book-tickets'
    )
  }
}
