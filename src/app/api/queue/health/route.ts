import { NextResponse } from 'next/server'
import { checkQueueHealth, getQueueStatus } from '@/lib/queue/bullConfig'

export async function GET() {
  try {
    const [health, status] = await Promise.all([
      checkQueueHealth(),
      getQueueStatus(),
    ])

    const isHealthy = health.healthy && status !== null

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        redis: health.redis || 'disconnected',
        queue: status,
        lastCheck: new Date().toISOString(),
        error: health.error,
      },
      { status: isHealthy ? 200 : 503 }
    )
  } catch (error) {
    console.error('Queue health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
