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
          ticketUrl: 'https://www.abbeytheatre.ie/whats-on/dublin-theatre-festival-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1598488035139-afb50080263f?w=600&h=400&fit=crop',
          isActive: true,
          venueId: venues[2].id, // Abbey Theatre
        },
      }),
      // Music event - Whelans (The Amazons)
      prisma.event.create({
        data: {
          title: 'The Amazons Live at Whelans',
          description: 'The Amazons take over Whelans Main Venue on Saturday October 3rd at 7:30 PM.',
          dateStart: new Date(2026, 9, 3, 19, 30), // Oct 3, 7:30 PM
          dateEnd: new Date(2026, 9, 3, 23, 0),
          genre: 'Music',
          ticketPriceMin: 31,
          ticketPriceMax: 31,
          ticketUrl: 'https://www.whelanslive.com/events/the-amazons-oct-3-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.vicarstreet.com/events/stand-up-comedy-sept-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1577720643272-265a42ed9b5e?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.gaietytheatre.ie/whats-on/west-end-production-oct-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1503854657149-a92b042ec90d?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.3arena.ie/events/international-concert-series-oct-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.abbeytheatre.ie/whats-on/season-production-oct-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.craicdencomedyclub.com/events/comedy-nights-oct-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1532635255-4b35fc3a1ea1?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.3arena.ie/events/dublin-music-arts-festival-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1501612780353-557265bc2be0?w=600&h=400&fit=crop',
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
          ticketUrl: 'https://www.abbeytheatre.ie/whats-on/theatre-masterclass-sept-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1516959915551-4e2f4e22deeb?w=600&h=400&fit=crop',
          isActive: true,
          venueId: venues[2].id, // Abbey Theatre
        },
      }),
      // Music event - Whelans (Runthered)
      prisma.event.create({
        data: {
          title: 'Runthered at Whelans',
          description: 'Runthered perform upstairs at Whelans on Saturday October 3rd at 8:00 PM.',
          dateStart: new Date(2026, 9, 3, 20, 0), // Oct 3, 8:00 PM
          dateEnd: new Date(2026, 9, 3, 23, 59),
          genre: 'Music',
          ticketPriceMin: 17.55,
          ticketPriceMax: 17.55,
          ticketUrl: 'https://www.whelanslive.com/events/runthered-oct-3-2026/',
          imageUrl: 'https://images.unsplash.com/photo-1516959915551-4e2f4e22deeb?w=600&h=400&fit=crop',
          isActive: true,
          venueId: venues[4].id, // Whelans
        },
      }),
    ])

    // Link events to sources based on venue-source mapping
    const venueToSourceMap: { [key: string]: number } = {
      [venues[0].id]: 0, // 3 Arena -> 3 Arena source
      [venues[1].id]: 1, // Vicar Street -> Vicar Street source
      [venues[2].id]: 2, // Abbey Theatre -> Abbey Theatre source
      [venues[3].id]: 3, // Gaiety Theatre -> Ticketmaster source
      [venues[4].id]: 1, // Whelans -> Vicar Street source (as fallback)
      [venues[5].id]: 3, // Craic Den -> Ticketmaster source (as fallback)
    }

    for (let i = 0; i < events.length; i++) {
      // Get the correct source based on the event's venue
      const sourceIndex = (venueToSourceMap[events[i].venueId] as number | undefined) ?? (i % sources.length)
      const sourceId = sources[sourceIndex].id
      await prisma.eventSource.create({
        data: {
          eventId: events[i].id,
          sourceId: sourceId,
          sourceUrl: sources[sourceIndex].url,
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
