import Queue from 'bull'
import { createClient } from 'redis'

// Get Redis connection URL from environment or use default
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Lazy-load Redis client to prevent connection errors during build
let redisClientInstance: ReturnType<typeof createClient> | null = null

function getRedisClientInstance() {
  if (!redisClientInstance) {
    redisClientInstance = createClient({
      url: redisUrl,
    })

    // Event handlers for Redis client
    redisClientInstance.on('error', (err) => {
      console.error('Redis client error:', err)
    })

    redisClientInstance.on('connect', () => {
      console.log('[Queue] Redis client connected')
    })

    redisClientInstance.on('ready', () => {
      console.log('[Queue] Redis client ready')
    })
  }
  return redisClientInstance
}

export const redisClient = new Proxy({} as any, {
  get: (target, prop) => {
    const instance = getRedisClientInstance()
    const value = (instance as any)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

// Create Bull queue for scrapers
export const scraperQueue = new Queue('dublin-events-scraper', {
  redis: redisUrl,
})

// Queue event handlers
scraperQueue.on('error', (error) => {
  console.error('[Scraper Queue] Error:', error)
})

scraperQueue.on('waiting', (jobId) => {
  console.log(`[Scraper Queue] Job ${jobId} is waiting`)
})

scraperQueue.on('active', (job) => {
  console.log(`[Scraper Queue] Job ${job.id} is active`)
})

scraperQueue.on('completed', (job) => {
  console.log(`[Scraper Queue] Job ${job.id} completed successfully`)
})

scraperQueue.on('failed', (job, err) => {
  console.error(`[Scraper Queue] Job ${job.id} failed:`, err.message)
})

scraperQueue.on('stalled', (job) => {
  console.warn(`[Scraper Queue] Job ${job.id} has stalled`)
})

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
