import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all sources with their event counts and last scrape info
    const sources = await prisma.source.findMany({
      include: {
        _count: {
          select: { eventSources: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const sourcesWithStats = sources.map(source => {
      const lastScrapedAt = source.lastScrapedAt
        ? new Date(source.lastScrapedAt)
        : null
      const nextScrapedAt = source.nextScrapedAt
        ? new Date(source.nextScrapedAt)
        : null

      // Calculate days since last scrape
      let daysSinceLastScrape: number | null = null
      if (lastScrapedAt) {
        daysSinceLastScrape = Math.floor(
          (Date.now() - lastScrapedAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      }

      return {
        id: source.id,
        name: source.name,
        url: source.url,
        scraperType: source.scraperType,
        status: source.scraperStatus,
        eventCount: source._count.eventSources,
        lastScrapedAt: lastScrapedAt?.toISOString() || null,
        nextScrapedAt: nextScrapedAt?.toISOString() || null,
        daysSinceLastScrape,
        isStale: daysSinceLastScrape !== null && daysSinceLastScrape > 7,
      }
    })

    // Group by status
    const statusCounts = sourcesWithStats.reduce(
      (acc, source) => {
        acc[source.status || 'unknown'] = (acc[source.status || 'unknown'] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Calculate overall health
    const activeCount = sourcesWithStats.filter(
      s => s.status === 'active' && !s.isStale
    ).length
    const healthPercentage = (activeCount / sourcesWithStats.length) * 100

    return NextResponse.json({
      sources: sourcesWithStats,
      summary: {
        totalSources: sourcesWithStats.length,
        activeSources: statusCounts['active'] || 0,
        inactiveSources: statusCounts['broken'] || 0,
        disabledSources: statusCounts['disabled'] || 0,
        staleSources: sourcesWithStats.filter(s => s.isStale).length,
        healthPercentage: Math.round(healthPercentage),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        nextScheduledRun: '2:00 AM Europe/Dublin',
      },
    })
  } catch (error) {
    console.error('Sources API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
