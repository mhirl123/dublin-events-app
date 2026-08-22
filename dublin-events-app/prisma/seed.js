const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with test events...')

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
        name: "Whelans",
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
        name: 'Ticketmaster',
        url: 'https://www.ticketmaster.ie',
        scraperType: 'puppeteer',
        scraperStatus: 'active',
        lastScrapedAt: new Date(),
      },
    }),
  ])

  // Create test events
  const now = new Date()
  const events = await Promise.all([
    // Music events
    prisma.event.create({
      data: {
        title: 'Taylor Swift: The Eras Tour',
        description: 'The most anticipated concert of 2024. Experience the magic of all Taylor Swift eras.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 19, 30),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 0),
        genre: 'Music',
        ticketPriceMin: 80,
        ticketPriceMax: 250,
        ticketUrl: 'https://www.ticketmaster.ie',
        venueId: venues[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Coldplay Live in Dublin',
        description: 'Coldplay brings their world tour to Dublin. A night of amazing music.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 20, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 23, 30),
        genre: 'Music',
        ticketPriceMin: 65,
        ticketPriceMax: 120,
        ticketUrl: 'https://www.ticketmaster.ie',
        venueId: venues[0].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'The Killers at Vicar Street',
        description: 'Intimate acoustic performance at Vicar Street.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 20, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 22, 30),
        genre: 'Music',
        ticketPriceMin: 45,
        ticketPriceMax: 65,
        ticketUrl: 'https://www.vicarstreet.com',
        venueId: venues[1].id,
      },
    }),

    // Theater events
    prisma.event.create({
      data: {
        title: 'Hamilton - An American Musical',
        description: 'The groundbreaking musical that took Broadway by storm.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 19, 30),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 22, 30),
        genre: 'Theater',
        ticketPriceMin: 25,
        ticketPriceMax: 95,
        ticketUrl: 'https://www.gaietytheatre.ie',
        venueId: venues[3].id,
      },
    }),
    prisma.event.create({
      data: {
        title: "The Pillars of the Earth",
        description: 'A new play based on the bestselling novel.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 20, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8, 23, 0),
        genre: 'Theater',
        ticketPriceMin: 30,
        ticketPriceMax: 75,
        ticketUrl: 'https://www.abbeytheatre.ie',
        venueId: venues[2].id,
      },
    }),

    // Comedy events
    prisma.event.create({
      data: {
        title: 'Dara Ó Briain: Comedy Show',
        description: 'The legendary Irish comedian returns to Dublin.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 19, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 20, 30),
        genre: 'Comedy',
        ticketPriceMin: 20,
        ticketPriceMax: 35,
        ticketUrl: 'https://www.craicdencomedyclub.com',
        venueId: venues[5].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Katherine Ryan Live',
        description: 'Stand-up comedy at its finest.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 20, 30),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 22, 0),
        genre: 'Comedy',
        ticketPriceMin: 22,
        ticketPriceMax: 40,
        ticketUrl: 'https://www.craicdencomedyclub.com',
        venueId: venues[5].id,
      },
    }),

    // Festival/Art events
    prisma.event.create({
      data: {
        title: 'Dublin Comedy Festival',
        description: 'Three weeks of comedy from around the world.',
        dateStart: new Date(now.getFullYear(), now.getMonth() + 1, 1, 18, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 21, 23, 59),
        genre: 'Festival',
        ticketPriceMin: 0,
        ticketPriceMax: 50,
        ticketUrl: 'https://www.comedyfestival.ie',
        venueId: venues[5].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Dublin Art Week',
        description: 'Celebrate art and creativity across Dublin.',
        dateStart: new Date(now.getFullYear(), now.getMonth() + 2, 1, 10, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth() + 2, 7, 20, 0),
        genre: 'Art',
        ticketPriceMin: 0,
        ticketPriceMax: 25,
        venueId: venues[2].id,
      },
    }),

    // Free/Workshop events
    prisma.event.create({
      data: {
        title: 'Digital Marketing Workshop',
        description: 'Learn the latest digital marketing strategies. Free for all.',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 14, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 16, 0),
        genre: 'Workshop',
        ticketPriceMin: 0,
        ticketPriceMax: 0,
        venueId: venues[4].id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Free Jazz Night at Whelans',
        description: 'A night of live jazz music. Entry is free!',
        dateStart: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9, 21, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9, 23, 59),
        genre: 'Music',
        ticketPriceMin: 0,
        ticketPriceMax: 0,
        venueId: venues[4].id,
      },
    }),

    // Conference event
    prisma.event.create({
      data: {
        title: 'Dublin Tech Conference 2024',
        description: 'Three days of talks from industry leaders.',
        dateStart: new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0),
        dateEnd: new Date(now.getFullYear(), now.getMonth() + 1, 17, 17, 0),
        genre: 'Conference',
        ticketPriceMin: 150,
        ticketPriceMax: 500,
        ticketUrl: 'https://www.dublintechconf.ie',
        venueId: venues[0].id,
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
        sourceEventId: `ext-${i}`,
      },
    })
  }

  console.log('✅ Database seeding complete!')
  console.log(`📍 ${venues.length} venues created`)
  console.log(`📰 ${sources.length} sources created`)
  console.log(`🎪 ${events.length} events created`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
