import { BaseScraper, ScrapedEvent } from '../BaseScraper'
import * as cheerio from 'cheerio'

export class ArenaScraper extends BaseScraper {
  constructor() {
    super('3 Arena', 'https://3arena.ie', 'cheerio')
  }

  async scrape(): Promise<ScrapedEvent[]> {
    console.log(`[${this.sourceName}] Starting scrape...`)
    const events: ScrapedEvent[] = []

    try {
      // Note: This is a template. Actual implementation requires inspecting the website structure
      const response = await fetch('https://3arena.ie/whats-on', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Example parsing (adjust based on actual HTML structure)
      $('[data-event]').each((index, element) => {
        const $el = $(element)

        const title = $el.find('[data-title]').text().trim()
        const dateStr = $el.find('[data-date]').attr('data-date')
        const venue = '3 Arena'
        const price = $el.find('[data-price]').text().trim()
        const url = $el.find('a').attr('href')

        if (title && dateStr && url) {
          events.push({
            title,
            dateStart: new Date(dateStr),
            venueName: venue,
            ticketUrl: url.startsWith('http') ? url : `https://3arena.ie${url}`,
            sourceUrl: `https://3arena.ie/whats-on`,
            genre: 'Music & Entertainment',
            ticketPriceMin: this.parsePrice(price),
          })
        }
      })

      console.log(`[${this.sourceName}] Found ${events.length} events`)
    } catch (error) {
      console.error(`[${this.sourceName}] Scrape error:`, error)
    }

    if (events.length > 0) {
      await this.saveEvents(events)
    }

    return events
  }

  private parsePrice(priceStr: string): number | undefined {
    if (!priceStr) return undefined
    const match = priceStr.match(/€?([\d.]+)/)
    return match ? parseFloat(match[1]) : undefined
  }
}
