import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface EventsQuery {
  search?: string
  dateFrom?: string
  dateTo?: string
  genre?: string
  genres?: string // Multi-select genres (comma-separated)
  priceMin?: string
  priceMax?: string
  venues?: string
  sort?: 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc' | 'relevance'
  page?: string
  limit?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const genreParam = searchParams.get('genre')
    const genresParam = searchParams.get('genres')
    const priceMinStr = searchParams.get('priceMin')
    const priceMaxStr = searchParams.get('priceMax')
    const venuesParam = searchParams.get('venues')
    const sortParam = (searchParams.get('sort') || 'date-asc') as string
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    // Parse numeric values
    const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined
    const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined

    // Build where clause with proper AND/OR logic
    const where: any = {
      isActive: true,
    }

    // Full-text search on title and description
    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      const dateRange: any = {}
      if (dateFrom) {
        dateRange.gte = new Date(dateFrom)
      }
      if (dateTo) {
        dateRange.lte = new Date(dateTo)
      }
      where.dateStart = dateRange
    }

    // Genre filtering (support both single and multiple)
    if (genreParam || genresParam) {
      const genres = genresParam
        ? genresParam.split(',').map(g => g.trim()).filter(Boolean)
        : genreParam
        ? [genreParam]
        : []

      if (genres.length > 0) {
        where.genre = {
          in: genres,
          mode: 'insensitive' as const,
        }
      }
    }

    // Price range filtering
    if (priceMin !== undefined || priceMax !== undefined) {
      const priceConditions: any[] = []

      // Handle minimum price
      if (priceMin !== undefined) {
        priceConditions.push({
          OR: [
            { ticketPriceMin: { gte: priceMin } },
            { ticketPriceMin: null },
          ],
        })
      }

      // Handle maximum price
      if (priceMax !== undefined) {
        priceConditions.push({
          OR: [
            { ticketPriceMax: { lte: priceMax } },
            { ticketPriceMax: null },
          ],
        })
      }

      if (priceConditions.length > 0) {
        where.AND = priceConditions
      }
    }

    // Venue filtering
    if (venuesParam) {
      const venueIds = venuesParam
        .split(',')
        .map(v => v.trim())
        .filter(Boolean)

      if (venueIds.length > 0) {
        where.venueId = { in: venueIds }
      }
    }

    // Determine sort order
    const orderBy: any = {}
    switch (sortParam) {
      case 'date-desc':
        orderBy.dateStart = 'desc'
        break
      case 'price-asc':
        orderBy.ticketPriceMin = 'asc'
        break
      case 'price-desc':
        orderBy.ticketPriceMin = 'desc'
        break
      case 'relevance':
        // For relevance, sort by date if search is present
        orderBy.dateStart = 'asc'
        break
      case 'date-asc':
      default:
        orderBy.dateStart = 'asc'
        break
    }

    // Fetch events with pagination
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          venue: true,
          eventSources: {
            include: {
              source: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      events: events.map(event => ({
        ...event,
        venueName: event.venue?.name,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: search || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        genres: genresParam ? genresParam.split(',') : (genreParam ? [genreParam] : null),
        priceRange: priceMin || priceMax ? { min: priceMin, max: priceMax } : null,
        venues: venuesParam ? venuesParam.split(',') : null,
        sort: sortParam,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
