// Import ticketing platforms
import {
  TicketmasterScraper,
  EventbriteScraper,
  IrishTicketsScraper,
  SeatplanScraper,
} from '@/lib/scrapers/sites/TicketingPlatformScraper'

// Import theater venues
import {
  AbbeyTheatreScraper,
  GateTheatreScraper,
  AmbassadorTheatreScraper,
  ButtonFactoryScraper,
  GaietyTheatreScraper,
} from '@/lib/scrapers/sites/TheaterScraper'

// Import comedy clubs
import {
  CraicDenScraper,
  HensTeethScraper,
  InternationalBarScraper,
  StageworksScraper,
  CabotHallScraper,
} from '@/lib/scrapers/sites/ComedyClubScraper'

// Import music venues
import {
  VicarStreetScraper,
  WhelansScraper,
  GrandSocialScraper,
  SoundHouseScraper,
  DogstarScraper,
  LiquidDublinScraper,
} from '@/lib/scrapers/sites/MusicVenueScraper'

// Import festivals
import {
  DublinPrideScraper,
  BloomsdayFestivalScraper,
  TradfestScraper,
  DublinFringeFestivalScraper,
  IrishTheatreFestivalScraper,
  DublinBookFestivalScraper,
  DublinJazzFestivalScraper,
  BeadfestScraper,
} from '@/lib/scrapers/sites/FestivalScraper'

// Import cultural venues
import {
  NationalConcertHallScraper,
  RDSScraper,
  TheHelixDCUScraper,
  BordGaisScraper,
  SampsonPlaceScraper,
  DublinTheatreFestivalScraper,
  ConventionCentreScraper,
} from '@/lib/scrapers/sites/CulturalVenueScraper'

// Import stadiums
import {
  AvivaStadiumScraper,
  CrokeParkScraper,
  LandoweScraper,
  TallinkScraper,
  RushanScraper,
} from '@/lib/scrapers/sites/StadiumScraper'

// Import event blogs
import {
  Nialler9Scraper,
  DiffIeScraper,
  TotallyDublinScraper,
  TheSkinnyDublinScraper,
  DublinDecodedScraper,
  IrishMusicTourScraper,
} from '@/lib/scrapers/sites/EventBlogScraper'

// Import arena/large venues
import { ArenaScraper } from '@/lib/scrapers/sites/3ArenaScraper'

// Registry of all scrapers
const scraperRegistry = [
  // Group 1: Ticketing Platforms (4 scrapers)
  new TicketmasterScraper(),
  new EventbriteScraper(),
  new IrishTicketsScraper(),
  new SeatplanScraper(),

  // Group 2: Theater Venues (5 scrapers)
  new AbbeyTheatreScraper(),
  new GateTheatreScraper(),
  new AmbassadorTheatreScraper(),
  new ButtonFactoryScraper(),
  new GaietyTheatreScraper(),

  // Group 3: Comedy Clubs (5 scrapers)
  new CraicDenScraper(),
  new HensTeethScraper(),
  new InternationalBarScraper(),
  new StageworksScraper(),
  new CabotHallScraper(),

  // Group 4: Music Venues (6 scrapers)
  new VicarStreetScraper(),
  new WhelansScraper(),
  new GrandSocialScraper(),
  new SoundHouseScraper(),
  new DogstarScraper(),
  new LiquidDublinScraper(),

  // Group 5: Festivals (8 scrapers)
  new DublinPrideScraper(),
  new BloomsdayFestivalScraper(),
  new TradfestScraper(),
  new DublinFringeFestivalScraper(),
  new IrishTheatreFestivalScraper(),
  new DublinBookFestivalScraper(),
  new DublinJazzFestivalScraper(),
  new BeadfestScraper(),

  // Group 6: Cultural Venues (7 scrapers)
  new NationalConcertHallScraper(),
  new RDSScraper(),
  new TheHelixDCUScraper(),
  new BordGaisScraper(),
  new SampsonPlaceScraper(),
  new DublinTheatreFestivalScraper(),
  new ConventionCentreScraper(),

  // Group 7: Stadiums (5 scrapers)
  new AvivaStadiumScraper(),
  new CrokeParkScraper(),
  new LandoweScraper(),
  new TallinkScraper(),
  new RushanScraper(),

  // Group 8: Event Blogs & Aggregators (6 scrapers)
  new Nialler9Scraper(),
  new DiffIeScraper(),
  new TotallyDublinScraper(),
  new TheSkinnyDublinScraper(),
  new DublinDecodedScraper(),
  new IrishMusicTourScraper(),

  // Group 9: Large Venues/Arenas (1 scraper)
  new ArenaScraper(),
]

async function runScrapers() {
  console.log('🚀 Starting Dublin Events Scraper')
  console.log(`📍 Running ${scraperRegistry.length} scrapers...`)
  console.log('---')

  const results = {
    total: scraperRegistry.length,
    successful: 0,
    failed: 0,
    eventsAdded: 0,
    events: 0, // Alias for eventsAdded for job processor compatibility
    processed: 0,
  }

  for (const scraper of scraperRegistry) {
    try {
      console.log(`\n⏳ Running: ${scraper.constructor.name}...`)
      const events = await scraper.scrape()
      results.successful++
      results.eventsAdded += events.length
      results.events += events.length // Update alias
      results.processed++
      console.log(`✅ ${scraper.constructor.name} completed (${events.length} events)`)
    } catch (error) {
      results.failed++
      console.error(`❌ ${scraper.constructor.name} failed:`, error)
    }
  }

  console.log('\n---')
  console.log('📊 Scraping Summary:')
  console.log(`   ✅ Successful: ${results.successful}/${results.total}`)
  console.log(`   ❌ Failed: ${results.failed}/${results.total}`)
  console.log(`   📝 Events added: ${results.eventsAdded}`)
  console.log('---')

  return results
}

// Run if executed directly
if (process.env.NODE_ENV !== 'production' || process.argv.includes('--force')) {
  runScrapers().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { runScrapers }
