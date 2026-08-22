import scraperQueue, { redisClient } from './bullConfig'
import processScrapeJob from './scrapeJobProcessor'
import { scheduleRecurringScraperJobs } from './scrapeJobProcessor'

let queueInitialized = false

/**
 * Initialize Bull queue with job processor
 * Call this once when your server starts
 */
export async function initializeQueue() {
  if (queueInitialized) {
    console.log('[Queue] Queue already initialized')
    return
  }

  try {
    console.log('[Queue] Initializing Bull queue...')

    // Connect Redis client
    if (!redisClient.isOpen) {
      await redisClient.connect()
    }

    // Check Redis connection
    const ping = await redisClient.ping()
    console.log(`[Queue] Redis connection test: ${ping}`)

    // Process jobs
    await scraperQueue.process(processScrapeJob)
    console.log('[Queue] Job processor registered')

    // Set up concurrency (number of jobs processed simultaneously)
    // This should be 1 for scraping to avoid database contention
    scraperQueue.concurrency = 1
    console.log('[Queue] Concurrency set to 1')

    // Schedule recurring jobs
    await scheduleRecurringScraperJobs(scraperQueue)
    console.log('[Queue] Recurring jobs scheduled')

    // Add event listeners
    setupQueueListeners()

    queueInitialized = true
    console.log('[Queue] ✅ Queue initialized successfully')
  } catch (error) {
    console.error('[Queue] Failed to initialize queue:', error)
    queueInitialized = false
  }
}

/**
 * Set up event listeners for queue
 */
function setupQueueListeners() {
  scraperQueue.on('error', (error) => {
    console.error('[Queue Event] Error:', error)
  })

  scraperQueue.on('waiting', (jobId) => {
    console.log(`[Queue Event] Job ${jobId} is waiting to be processed`)
  })

  scraperQueue.on('active', (job) => {
    console.log(`[Queue Event] Job ${job.id} is now active`)
  })

  scraperQueue.on('stalled', (job) => {
    console.warn(`[Queue Event] Job ${job.id} has stalled and will be retried`)
  })

  scraperQueue.on('progress', (job, progress) => {
    console.log(`[Queue Event] Job ${job.id} progress: ${progress}%`)
  })

  scraperQueue.on('completed', (job, result) => {
    console.log(`[Queue Event] Job ${job.id} completed successfully`)
    if (result.statistics) {
      console.log(`  Total events: ${result.statistics.totalEvents}`)
      console.log(`  Events added: ${result.eventsAdded}`)
      console.log(`  Duration: ${result.duration}ms`)
    }
  })

  scraperQueue.on('failed', (job, err) => {
    console.error(`[Queue Event] Job ${job.id} failed:`, err.message)
  })

  scraperQueue.on('paused', () => {
    console.log('[Queue Event] Queue paused')
  })

  scraperQueue.on('resumed', () => {
    console.log('[Queue Event] Queue resumed')
  })
}

/**
 * Health check for queue
 */
export async function checkQueueHealth() {
  try {
    if (!redisClient.isOpen) {
      return {
        healthy: false,
        error: 'Redis connection not established',
      }
    }

    const ping = await redisClient.ping()

    if (ping === 'PONG') {
      const counts = await scraperQueue.getJobCounts()
      return {
        healthy: true,
        redis: 'connected',
        jobCounts: counts,
      }
    }

    return {
      healthy: false,
      error: 'Redis ping failed',
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Graceful shutdown
 */
export async function shutdownQueue() {
  try {
    console.log('[Queue] Shutting down queue...')
    await scraperQueue.close()
    if (redisClient.isOpen) {
      await redisClient.quit()
    }
    queueInitialized = false
    console.log('[Queue] Queue closed successfully')
  } catch (error) {
    console.error('[Queue] Error during shutdown:', error)
  }
}

export default initializeQueue
