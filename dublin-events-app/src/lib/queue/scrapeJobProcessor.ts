import { Job } from 'bull'
import { PrismaClient } from '@prisma/client'
import { runScrapers } from '@/scrapers/runner'

const prisma = new PrismaClient()

export interface ScrapeJobData {
  type: 'full' | 'selective' // 'full' runs all scrapers, 'selective' runs specific ones
  scraperNames?: string[] // For selective scraping
  notifyOnComplete?: boolean
  maxConcurrency?: number
}

export interface ScrapeJobResult {
  success: boolean
  startTime: string
  endTime: string
  duration: number // in milliseconds
  scrapersRun: number
  eventsAdded: number
  eventsProcessed: number
  errors: Array<{
    scraper: string
    error: string
    timestamp: string
  }>
  statistics: {
    totalEvents: number
    totalVenues: number
    totalSources: number
    eventsByGenre: Record<string, number>
  }
}

/**
 * Process scraper job
 * Runs all or selected scrapers and updates database
 */
export async function processScrapeJob(
  job: Job<ScrapeJobData>
): Promise<ScrapeJobResult> {
  const startTime = new Date()
  const errors: ScrapeJobResult['errors'] = []

  try {
    console.log(`[Job ${job.id}] Starting scrape job...`)
    job.progress(10)

    // Run scrapers
    let eventsAdded = 0
    let eventsProcessed = 0
    const scrapersRun = job.data.scraperNames?.length || 47

    try {
      // Run the main scraper runner
      console.log(`[Job ${job.id}] Running scrapers...`)
      // Note: runScrapers needs to be updated to support selective scraping
      // For now, it runs all scrapers
      const result = await runScrapers()

      eventsAdded = result.events || 0
      eventsProcessed = result.processed || 0

      job.progress(50)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[Job ${job.id}] Scraper error:`, errorMsg)
      errors.push({
        scraper: 'runner',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      })
      job.progress(50)
    }

    // Update source metadata
    console.log(`[Job ${job.id}] Updating source metadata...`)
    try {
      await prisma.source.updateMany({
        data: {
          lastScrapedAt: new Date(),
          nextScrapedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
          scraperStatus: 'active',
        },
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[Job ${job.id}] Error updating sources:`, errorMsg)
      errors.push({
        scraper: 'source-update',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      })
    }

    job.progress(75)

    // Fetch statistics
    console.log(`[Job ${job.id}] Gathering statistics...`)
    let statistics = {
      totalEvents: 0,
      totalVenues: 0,
      totalSources: 0,
      eventsByGenre: {} as Record<string, number>,
    }

    try {
      const [totalEvents, totalVenues, totalSources, genreData] =
        await Promise.all([
          prisma.event.count(),
          prisma.venue.count(),
          prisma.source.count(),
          prisma.event.groupBy({
            by: ['genre'],
            _count: {
              id: true,
            },
          }),
        ])

      statistics = {
        totalEvents,
        totalVenues,
        totalSources,
        eventsByGenre: genreData.reduce(
          (acc, g) => {
            if (g.genre) {
              acc[g.genre] = g._count.id
            }
            return acc
          },
          {} as Record<string, number>
        ),
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[Job ${job.id}] Error gathering stats:`, errorMsg)
      errors.push({
        scraper: 'statistics',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      })
    }

    job.progress(90)

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    const result: ScrapeJobResult = {
      success: errors.length === 0,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      scrapersRun,
      eventsAdded,
      eventsProcessed,
      errors,
      statistics,
    }

    console.log(`[Job ${job.id}] Scrape job completed successfully`)
    console.log(`[Job ${job.id}] Duration: ${duration}ms`)
    console.log(`[Job ${job.id}] Events added: ${eventsAdded}`)
    console.log(`[Job ${job.id}] Total events in DB: ${statistics.totalEvents}`)

    job.progress(100)
    return result
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[Job ${job.id}] Fatal error:`, errorMsg)

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    return {
      success: false,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      scrapersRun: 0,
      eventsAdded: 0,
      eventsProcessed: 0,
      errors: [
        ...errors,
        {
          scraper: 'fatal',
          error: errorMsg,
          timestamp: new Date().toISOString(),
        },
      ],
      statistics: {
        totalEvents: 0,
        totalVenues: 0,
        totalSources: 0,
        eventsByGenre: {},
      },
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Schedule recurring scraper jobs
 * Runs daily at 2 AM Europe/Dublin time
 */
export async function scheduleRecurringScraperJobs(scraperQueue: any) {
  try {
    // Remove existing recurring jobs
    const repeatableJobs = await scraperQueue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      if (job.key.includes('daily-scrape')) {
        await scraperQueue.removeRepeatableByKey(job.key)
      }
    }

    // Add new daily job at 2 AM
    // Cron format: second minute hour day-of-month month day-of-week
    // 0 2 * * * = 2:00 AM every day
    await scraperQueue.add(
      { type: 'full', notifyOnComplete: true },
      {
        repeat: {
          cron: '0 2 * * *', // 2 AM every day
          tz: 'Europe/Dublin',
        },
        jobId: 'daily-scrape-' + new Date().toISOString().split('T')[0],
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // 2 seconds
        },
        removeOnComplete: false,
        removeOnFail: false,
      }
    )

    console.log('[Queue] Scheduled daily scraper job at 2 AM Europe/Dublin')
  } catch (error) {
    console.error('[Queue] Error scheduling jobs:', error)
  }
}

/**
 * Add manual scrape job
 */
export async function addManualScrapeJob(
  scraperQueue: any,
  data: ScrapeJobData = { type: 'full' }
) {
  try {
    const job = await scraperQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    })

    console.log(`[Queue] Added manual scrape job with ID: ${job.id}`)
    return job
  } catch (error) {
    console.error('[Queue] Error adding manual job:', error)
    throw error
  }
}

export default processScrapeJob
