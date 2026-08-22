import { PrismaClient } from '@prisma/client'

export interface ScrapedEvent {
  title: string
  description?: string
  dateStart: Date
  dateEnd?: Date
  genre?: string
  ticketPriceMin?: number
  ticketPriceMax?: number
  ticketUrl?: string
  imageUrl?: string
  venueName: string
  venueAddress?: string
  sourceUrl: string
  sourceEventId?: string
}

export abstract class BaseScraper {
  protected sourceName: string
  protected sourceUrl: string
  protected scraperType: 'puppeteer' | 'cheerio'
  protected prisma: PrismaClient

  constructor(
    sourceName: string,
    sourceUrl: string,
    scraperType: 'puppeteer' | 'cheerio'
  ) {
    this.sourceName = sourceName
    this.sourceUrl = sourceUrl
    this.scraperType = scraperType
    this.prisma = new PrismaClient()
  }

  abstract scrape(): Promise<ScrapedEvent[]>

  protected async saveEvents(events: ScrapedEvent[]) {
    console.log(`[${this.sourceName}] Saving ${events.length} events...`)

    let source = await this.prisma.source.findUnique({
      where: { url: this.sourceUrl },
    })

    if (!source) {
      source = await this.prisma.source.create({
        data: {
          name: this.sourceName,
          url: this.sourceUrl,
          scraperType: this.scraperType,
          scraperStatus: 'active',
        },
      })
    }

    for (const event of events) {
      try {
        // Find or create venue
        let venue = await this.prisma.venue.findFirst({
          where: {
            name: { equals: event.venueName, mode: 'insensitive' },
          },
        })

        if (!venue) {
          venue = await this.prisma.venue.create({
            data: {
              name: event.venueName,
              address: event.venueAddress,
            },
          })
        }

        // Check if event already exists
        const eventHash = this.hashEvent(event)
        const existingEvent = await this.prisma.event.findFirst({
          where: {
            title: { equals: event.title, mode: 'insensitive' },
            dateStart: {
              gte: new Date(event.dateStart.getTime() - 60000),
              lte: new Date(event.dateStart.getTime() + 60000),
            },
            venueId: venue.id,
          },
        })

        let savedEvent = existingEvent

        if (!existingEvent) {
          savedEvent = await this.prisma.event.create({
            data: {
              title: event.title,
              description: event.description,
              dateStart: event.dateStart,
              dateEnd: event.dateEnd,
              genre: event.genre,
              ticketPriceMin: event.ticketPriceMin,
              ticketPriceMax: event.ticketPriceMax,
              ticketUrl: event.ticketUrl,
              imageUrl: event.imageUrl,
              venueId: venue.id,
              isActive: true,
            },
          })
        }

        // Link event to source
        const eventSource = await this.prisma.eventSource.upsert({
          where: {
            eventId_sourceId: {
              eventId: savedEvent!.id,
              sourceId: source.id,
            },
          },
          update: {
            sourceUrl: event.sourceUrl,
            sourceEventId: event.sourceEventId,
          },
          create: {
            eventId: savedEvent!.id,
            sourceId: source.id,
            sourceUrl: event.sourceUrl,
            sourceEventId: event.sourceEventId,
          },
        })
      } catch (error) {
        console.error(`[${this.sourceName}] Error saving event "${event.title}":`, error)
      }
    }

    // Update source last scraped time
    await this.prisma.source.update({
      where: { id: source.id },
      data: {
        lastScrapedAt: new Date(),
        nextScrapeAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        scraperStatus: 'active',
      },
    })

    console.log(`[${this.sourceName}] Completed`)
  }

  protected hashEvent(event: ScrapedEvent): string {
    const key = `${event.title}${event.dateStart}${event.venueName}`
    return key.toLowerCase().replace(/\s+/g, '')
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  protected async cleanup() {
    await this.prisma.$disconnect()
  }
}
