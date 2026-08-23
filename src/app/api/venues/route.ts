import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    // Build where clause
    const where: any = {}
    if (search.trim()) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Fetch venues with event counts
    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          _count: {
            select: { events: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.venue.count({ where }),
    ])

    return NextResponse.json({
      venues: venues.map(venue => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        website: venue.website,
        eventCount: venue._count.events,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Venues API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
