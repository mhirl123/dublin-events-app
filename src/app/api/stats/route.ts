import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch all stats in parallel
    const [
      totalEvents,
      upcomingEvents,
      eventsThisWeek,
      eventsThisMonth,
      totalVenues,
      totalSources,
      genreDistribution,
      topVenues,
      recentEvents,
    ] = await Promise.all([
      // Total active events
      prisma.event.count({
        where: { isActive: true },
      }),

      // Upcoming events (from today onwards)
      prisma.event.count({
        where: {
          isActive: true,
          dateStart: { gte: now },
        },
      }),

      // Events this week
      prisma.event.count({
        where: {
          isActive: true,
          dateStart: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Events this month
      prisma.event.count({
        where: {
          isActive: true,
          dateStart: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total venues
      prisma.venue.count(),

      // Total sources
      prisma.source.count(),

      // Genre distribution
      prisma.event.groupBy({
        by: ['genre'],
        where: { isActive: true },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),

      // Top venues by event count
      prisma.venue.findMany({
        include: {
          _count: {
            select: { events: true },
          },
        },
        orderBy: {
          events: {
            _count: 'desc',
          },
        },
        take: 10,
      }),

      // Recently added events
      prisma.event.findMany({
        where: { isActive: true },
        include: {
          venue: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ])

    return NextResponse.json({
      overview: {
        totalEvents,
        upcomingEvents,
        eventsThisWeek,
        eventsThisMonth,
        totalVenues,
        totalSources,
      },
      genre: {
        distribution: genreDistribution
          .filter(g => g.genre !== null)
          .map(g => ({
            name: g.genre,
            count: g._count.id,
            percentage: ((g._count.id / totalEvents) * 100).toFixed(1),
          })),
      },
      venues: {
        top: topVenues.map(v => ({
          id: v.id,
          name: v.name,
          eventCount: v._count.events,
        })),
      },
      recent: {
        events: recentEvents.map(e => ({
          id: e.id,
          title: e.title,
          date: e.dateStart,
          venue: e.venue?.name,
          createdAt: e.createdAt,
        })),
      },
      timeline: {
        pastSevenDays: await prisma.event.count({
          where: {
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        pastThirtyDays: await prisma.event.count({
          where: {
            isActive: true,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        timezone: 'Europe/Dublin',
      },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
