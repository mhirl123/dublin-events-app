import Queue from 'bull'
import { createClient, RedisClientType } from 'redis'

// Get Redis connection URL from environment or use default
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Lazy-loaded Redis client - only initialize when first needed
let _redisClient: RedisClientType | null = null

export function getRedisClient(): RedisClientType {
  if (!_redisClient) {
    _redisClient = createClient({
      url: redisUrl,
    })

    // Event handlers for Redis client
    _redisClient.on('error', (err) => {
      console.error('Redis client error:', err)
    })

    _redisClient.on('connect', () => {
      console.log('[Queue] Redis client connected')
    })

    _redisClient.on('ready', () => {
      console.log('[Queue] Redis client ready')
    })
  }
  return _redisClient
}

// Export as lazy-initialized object to match initializeQueue.ts usage
export const redisClient = {
  connect: () => getRedisClient().connect(),
  disconnect: () => getRedisClient().disconnect(),
  ping: () => getRedisClient().ping(),
  quit: () => getRedisClient().quit(),
  isOpen: Object.defineProperty({}, 'isOpen', {
    get: () => getRedisClient().isOpen,
  }) as any,
  on: (event: string, callback: (...args: any[]) => void) => {
    getRedisClient().on(event, callback)
  },
} as unknown as RedisClientType

// Lazy-loaded Bull queue - only initialize when first needed
let _scraperQueue: Queue.Queue | null = null

export function getScraperQueue(): Queue.Queue {
  if (!_scraperQueue) {
    _scraperQueue = new Queue('dublin-events-scraper', {
      redis: redisUrl,
    })

    // Queue event handlers
    _scraperQueue.on('error', (error) => {
      console.error('[Scraper Queue] Error:', error)
    })

    _scraperQueue.on('waiting', (jobId) => {
      console.log(`[Scraper Queue] Job ${jobId} is waiting`)
    })

    _scraperQueue.on('active', (job) => {
      console.log(`[Scraper Queue] Job ${job.id} is active`)
    })

    _scraperQueue.on('completed', (job) => {
      console.log(`[Scraper Queue] Job ${job.id} completed successfully`)
    })

    _scraperQueue.on('failed', (job, err) => {
      console.error(`[Scraper Queue] Job ${job.id} failed:`, err.message)
    })

    _scraperQueue.on('stalled', (job) => {
      console.warn(`[Scraper Queue] Job ${job.id} has stalled`)
    })
  }
  return _scraperQueue
}

// Export as lazy-initialized object to match initializeQueue.ts usage
export const scraperQueue = {
  add: (data: any, opts?: any) => getScraperQueue().add(data, opts),
  process: (concurrency: number, fn: any) => getScraperQueue().process(concurrency, fn),
  on: (event: string, callback: (...args: any[]) => void) => {
    getScraperQueue().on(event, callback)
  },
  clean: (maxAge: number, status?: any) => getScraperQueue().clean(maxAge, status),
  getJobCounts: () => getScraperQueue().getJobCounts(),
  getRepeatableJobs: () => getScraperQueue().getRepeatableJobs(),
  removeRepeatableByKey: (key: string) => getScraperQueue().removeRepeatableByKey(key),
  pause: () => getScraperQueue().pause(),
  resume: () => getScraperQueue().resume(),
  close: () => getScraperQueue().close(),
} as unknown as Queue.Queue

// Clean up old jobs periodically
export async function cleanupOldJobs() {
  try {
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    await scraperQueue.clean(maxAge, 'completed')
    console.log('[Queue] Cleaned up old jobs')
  } catch (error) {
    console.error('[Queue] Error cleaning up old jobs:', error)
  }
}

// Get queue status
export async function getQueueStatus() {
  try {
    const counts = await scraperQueue.getJobCounts()
    return {
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    }
  } catch (error) {
    console.error('[Queue] Error getting queue status:', error)
    return null
  }
}

// Check queue health
export async function checkQueueHealth() {
  try {
    await redisClient.connect()
    const ping = await redisClient.ping()
    await redisClient.disconnect()

    return {
      healthy: ping === 'PONG',
      redis: ping === 'PONG' ? 'connected' : 'disconnected',
      error: null,
    }
  } catch (error) {
    console.error('[Queue] Health check error:', error)
    return {
      healthy: false,
      redis: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Pause queue
export async function pauseQueue() {
  try {
    await scraperQueue.pause()
    console.log('[Queue] Queue paused')
  } catch (error) {
    console.error('[Queue] Error pausing queue:', error)
  }
}

// Resume queue
export async function resumeQueue() {
  try {
    await scraperQueue.resume()
    console.log('[Queue] Queue resumed')
  } catch (error) {
    console.error('[Queue] Error resuming queue:', error)
  }
}

export default scraperQueue
