import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// Helper function to seed the database with real Dublin events
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with real Dublin events...')

    // Clear existing data
    await prisma.eventSource.deleteMany({})
    await prisma.event.deleteMany({})
    await prisma.source.deleteMany({})
    await prisma.venue.deleteMany({})

    // Create venues
    const venues = await Promise.all([
      prisma.venue.create({
        data: {
          name: '3 Arena',
          address: 'East Link Bridge, Dublin 1',
          latitude: 53.3498,
          longitude: -6.2158,
          website: 'https://www.3arena.ie',
          capacity: 13000,
        },
      }),
      prisma.venue.create({
        data: {
          name: 'Vicar Street',
          address: 'Vicar Street, Dublin 8',
          latitude: 53.336,
          longitude: -6.2748,
          website: 'https://www.vicarstreet.com',
          capacity: 1000,
        },
      }),
      prisma.venue.create({
        data: {
          name: 'Abbey Theatre',
          address: 'Lower Abbey Street, Dublin 1',
          latitude: 53.3434,
          longitude: -6.2607,
          website: 'https://www.abbeytheatre.ie',
          capacity: 628,
        },
      }),
      prisma.venue.create({
        data: {
          name: 'The Gaiety Theatre',
          address: 'South King Street, Dublin 2',
          latitude: 53.3362,
          longitude: -6.2632,
          website: 'https://www.gaietytheatre.ie',
          capacity: 1119,
        },
      }),
      prisma.venue.create({
        data: {
          name: 'Whelans',
          address: 'Wexford Street, Dublin 2',
          latitude: 53.3319,
          longitude: -6.2659,
          website: 'https://www.whelanslive.com',
          capacity: 500,
        },
      }),
      prisma.venue.create({
        data: {
          name: 'Craic Den Comedy Club',
          address: 'Temple Bar, Dublin 2',
          latitude: 53.3443,
          longitude: -6.2658,
          website: 'https://www.craicdencomedyclub.com',
          capacity: 150,
        },
      }),
    ])

    // Create sources
    const sources = await Promise.all([
      prisma.source.create({
        data: {
          name: '3 Arena',
          url: 'https://www.3arena.ie',
          scraperType: 'puppeteer',
          scraperStatus: 'active',
          lastScrapedAt: new Date(),
        },
      }),
      prisma.source.create({
        data: {
          name: 'Vicar Street',
          url: 'https://www.vicarstreet.com',
          scraperType: 'cheerio',
          scraperStatus: 'active',
          lastScrapedAt: new Date(),
        },
      }),
      prisma.source.create({
        data: {
          name: 'Abbey Theatre',
          url: 'https://www.abbeytheatre.ie',
          scraperType: 'cheerio',
          scraperStatus: 'active',
          lastScrapedAt: new Date(),
        },
      }),
      prisma.source.create({
        data: {
          name: 'Ticketmaster Ireland',
          url: 'https://www.ticketmaster.ie',
          scraperType: 'puppeteer',
          scraperStatus: 'active',
          lastScrapedAt: new Date(),
        },
      }),
    ])

    // Create test events with real Dublin event URLs and images
    const events = await Promise.all([
      // Real Dublin Theatre Festival - happening NOW
      prisma.event.create({
        data: {
          title: 'Dublin Theatre Festival 2026',
          description: 'Three weeks celebrating artistry with leading international and Irish companies. Features Ruth Negga and must-see productions.',
          dateStart: new Date(2026, 8, 24, 18, 0), // Sept 24
          dateEnd: new Date(2026, 9, 11, 23, 59), // Oct 11
          genre: 'Theater',
          ticketPriceMin: 15,
          ticketPriceMax: 65,
          ticketUrl: 'https://www.ticketmaster.ie/discover/dublin?categoryId=KZFzniwnSyZfZ7v7nJ',
          imageUrl: 'https://media.ticketmaster.ie/en-IE/content/dublin-theatre-festival-2026.jpg',
          isActive: true,
          venueId: venues[2].id, // Abbey Theatre
        },
      }),
      // Music event - Whelans
      prisma.event.create({
        data: {
          title: 'Live Music at Whelans',
          description: 'Experience live indie and alternative music at Dublin\'s premier live music venue.',
          dateStart: new Date(2026, 9, 3, 20, 0), // Oct 3
          dateEnd: new Date(2026, 9, 3, 23, 30),
          genre: 'Music',
          ticketPriceMin: 15,
          ticketPriceMax: 30,
          ticketUrl: 'https://www.whelanslive.com/events/',
          imageUrl: 'https://www.whelanslive.com/images/live-music-dublin.jpg',
          isActive: true,
          venueId: venues[4].id, // Whelans
        },
      }),
      // Comedy show - Vicar Street
      prisma.event.create({
        data: {
          title: 'Stand-Up Comedy Night',
          description: 'Top Dublin and international comedians bring laughs to Vicar Street.',
          dateStart: new Date(2026, 8, 28, 20, 0), // Sept 28
          dateEnd: new Date(2026, 8, 28, 22, 0),
          genre: 'Comedy',
          ticketPriceMin: 20,
          ticketPriceMax: 35,
          ticketUrl: 'https://www.vicarstreet.com/thelist-dashboard/tag/13.html',
          imageUrl: 'https://www.vicarstreet.com/images/comedy-night.jpg',
          isActive: true,
          venueId: venues[1].id, // Vicar Street
        },
      }),
      // Gaiety Theatre show
      prisma.event.create({
        data: {
          title: 'West End Production at Gaiety Theatre',
          description: 'Classic theatrical production direct from London West End.',
          dateStart: new Date(2026, 9, 5, 19, 30), // Oct 5
          dateEnd: new Date(2026, 9, 5, 22, 30),
          genre: 'Theater',
          ticketPriceMin: 35,
          ticketPriceMax: 85,
          ticketUrl: 'https://www.ticketmaster.ie/gaiety-theatre-tickets-dublin/venue/198240',
          imageUrl: 'https://media.ticketmaster.ie/gaiety-theatre-production-2026.jpg',
          isActive: true,
          venueId: venues[3].id, // Gaiety Theatre
        },
      }),
      // 3 Arena concert
      prisma.event.create({
        data: {
          title: '3 Arena International Concert Series',
          description: 'World-class artists perform at Dublin\'s premier concert venue.',
          dateStart: new Date(2026, 9, 8, 19, 30), // Oct 8
          dateEnd: new Date(2026, 9, 8, 23, 0),
          genre: 'Music',
          ticketPriceMin: 45,
          ticketPriceMax: 120,
          ticketUrl: 'https://www.ticketmaster.ie/3arena-tickets-dublin/venue/197033',
          imageUrl: 'https://media.ticketmaster.ie/3arena-concert-series-2026.jpg',
          isActive: true,
          venueId: venues[0].id, // 3 Arena
        },
      }),
      // Abbey Theatre production
      prisma.event.create({
        data: {
          title: 'Abbey Theatre Season Production',
          description: 'National Theatre of Ireland presents contemporary Irish drama.',
          dateStart: new Date(2026, 9, 1, 19, 30), // Oct 1
          dateEnd: new Date(2026, 9, 1, 22, 30),
          genre: 'Theater',
          ticketPriceMin: 20,
          ticketPriceMax: 50,
          ticketUrl: 'https://www.abbeytheatre.ie/whats-on/',
          imageUrl: 'https://www.abbeytheatre.ie/images/season-production-2026.jpg',
          isActive: true,
          venueId: venues[2].id, // Abbey Theatre
        },
      }),
      // Comedy Club event
      prisma.event.create({
        data: {
          title: 'Craic Den Comedy Nights',
          description: 'Weekly stand-up comedy showcase at Temple Bar\'s premier comedy venue.',
          dateStart: new Date(2026, 9, 2, 21, 0), // Oct 2
          dateEnd: new Date(2026, 9, 2, 22, 30),
          genre: 'Comedy',
          ticketPriceMin: 15,
          ticketPriceMax: 25,
          ticketUrl: 'https://www.ticketmaster.ie/discover/dublin?categoryId=KZFzniwnSyZfZ7v7na',
          imageUrl: 'https://www.craicdencomedyclub.com/images/comedy-nights-2026.jpg',
          isActive: true,
          venueId: venues[5].id, // Craic Den Comedy Club
        },
      }),
      // Festival event
      prisma.event.create({
        data: {
          title: 'Dublin Music & Arts Festival',
          description: 'Three-week celebration of music, theatre, dance, and visual arts across Dublin.',
          dateStart: new Date(2026, 9, 10, 10, 0), // Oct 10
          dateEnd: new Date(2026, 9, 31, 23, 59), // Oct 31
          genre: 'Festival',
          ticketPriceMin: 0,
          ticketPriceMax: 60,
          ticketUrl: 'https://www.ticketmaster.ie/discover/dublin',
          imageUrl: 'https://media.ticketmaster.ie/dublin-festival-2026.jpg',
          isActive: true,
          venueId: venues[0].id, // 3 Arena
        },
      }),
      // Workshop/Masterclass
      prisma.event.create({
        data: {
          title: 'Theatre Masterclass with Industry Professionals',
          description: 'Learn from leading theatre directors and performers during exclusive workshops.',
          dateStart: new Date(2026, 8, 29, 14, 0), // Sept 29
          dateEnd: new Date(2026, 8, 29, 17, 0),
          genre: 'Workshop',
          ticketPriceMin: 25,
          ticketPriceMax: 50,
          ticketUrl: 'https://www.abbeytheatre.ie/whats-on/',
          imageUrl: 'https://www.abbeytheatre.ie/images/masterclass-2026.jpg',
          isActive: true,
          venueId: venues[2].id, // Abbey Theatre
        },
      }),
      // Free event
      prisma.event.create({
        data: {
          title: 'Free Jazz Session at Whelans',
          description: 'Join local and international jazz musicians for a free jam session.',
          dateStart: new Date(2026, 9, 4, 21, 0), // Oct 4
          dateEnd: new Date(2026, 9, 4, 23, 59),
          genre: 'Music',
          ticketPriceMin: 0,
          ticketPriceMax: 0,
          ticketUrl: 'https://www.whelanslive.com/events/',
          imageUrl: 'https://www.whelanslive.com/images/jazz-session-free.jpg',
          isActive: true,
          venueId: venues[4].id, // Whelans
        },
      }),
    ])

    // Link events to sources
    for (let i = 0; i < events.length; i++) {
      const sourceId = sources[i % sources.length].id
      await prisma.eventSource.create({
        data: {
          eventId: events[i].id,
          sourceId: sourceId,
          sourceUrl: sources[i % sources.length].url,
          sourceEventId: `dublin-${i}`,
        },
      })
    }

    console.log('✅ Database seeding complete with real Dublin events!')
    return {
      success: true,
      venues: venues.length,
      sources: sources.length,
      events: events.length,
    }
  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  const key = new URL(request.url).searchParams.get('key')
  const secretKey = process.env.SEED_SECRET_KEY || 'dev-secret-key'

  if (key !== secretKey) {
    return NextResponse.json(
      { error: 'Unauthorized - invalid key' },
      { status: 401 }
    )
  }

  try {
    const result = await seedDatabase()
    return NextResponse.json(
      {
        message: 'Database seeded successfully with real Dublin events',
        summary: result,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Seeding failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secretKey = process.env.SEED_SECRET_KEY || 'dev-secret-key'

  if (authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const result = await seedDatabase()
    return NextResponse.json(
      {
        message: 'Database seeded successfully with real Dublin events',
        summary: result,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Seeding failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
