import { NextResponse } from 'next/server'
import scraperQueue, { getQueueStatus } from '@/lib/queue/bullConfig'

// Force dynamic rendering to prevent build-time route generation
// that would attempt to connect to Redis during build
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const status = await getQueueStatus()

    if (!status) {
      return NextResponse.json(
        { error: 'Unable to connect to queue' },
        { status: 503 }
      )
    }

    // Get recent jobs
    const recentJobs = await scraperQueue.getJobs(
      ['completed', 'failed', 'active'],
      0,
      10
    )

    return NextResponse.json({
      status,
      recentJobs: recentJobs.map((job: any) => ({
        id: job.id,
        progress: job.progress(),
        data: job.data,
        result: job.returnvalue,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        finishedOn: job.finishedOn,
        processedOn: job.processedOn,
      })),
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
