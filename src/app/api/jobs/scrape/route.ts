import { NextRequest, NextResponse } from 'next/server'
import scraperQueue from '@/lib/queue/bullConfig'
import { processScrapeJob, ScrapeJobData } from '@/lib/queue/scrapeJobProcessor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const jobData: ScrapeJobData = {
      type: body.type || 'full',
      scraperNames: body.scraperNames,
      notifyOnComplete: body.notifyOnComplete !== false,
      maxConcurrency: body.maxConcurrency || 1,
    }

    // Add job to queue
    const job = await scraperQueue.add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    })

    console.log(`[API] Created manual scrape job: ${job.id}`)

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        status: 'queued',
        data: jobData,
        message: `Scrape job ${job.id} has been queued`,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 202 } // Accepted
    )
  } catch (error) {
    console.error('Scrape job creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create scrape job',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// GET job details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      )
    }

    const job = await scraperQueue.getJob(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const progress = job.progress()
    const state = await job.getState()
    const isCompleted = await job.isCompleted()
    const isFailed = await job.isFailed()

    return NextResponse.json({
      jobId: job.id,
      state,
      progress,
      isCompleted,
      isFailed,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      stacktrace: job.stacktrace,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json(
      { error: 'Failed to get job details' },
      { status: 500 }
    )
  }
}
