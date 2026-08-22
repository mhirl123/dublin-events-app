/**
 * API Tests for Stats/Analytics Endpoints
 */

describe('GET /api/stats', () => {
  it('should return complete statistics', async () => {
    const response = await fetch('http://localhost:3000/api/stats')
    expect(response.status).toBe(200)

    const data = await response.json()

    // Verify structure
    expect(data).toHaveProperty('overview')
    expect(data).toHaveProperty('genre')
    expect(data).toHaveProperty('venues')
    expect(data).toHaveProperty('recent')
    expect(data).toHaveProperty('timeline')

    // Verify overview fields
    expect(data.overview).toHaveProperty('totalEvents')
    expect(data.overview).toHaveProperty('upcomingEvents')
    expect(data.overview).toHaveProperty('eventsThisWeek')
    expect(data.overview).toHaveProperty('eventsThisMonth')
    expect(data.overview).toHaveProperty('totalVenues')
    expect(data.overview).toHaveProperty('totalSources')

    // Verify types
    expect(typeof data.overview.totalEvents).toBe('number')
    expect(Array.isArray(data.genre.distribution)).toBe(true)
    expect(Array.isArray(data.venues.top)).toBe(true)
  })

  it('should return genre distribution', async () => {
    const response = await fetch('http://localhost:3000/api/stats')
    expect(response.status).toBe(200)

    const data = await response.json()
    data.genre.distribution.forEach((genre: any) => {
      expect(genre).toHaveProperty('name')
      expect(genre).toHaveProperty('count')
      expect(genre).toHaveProperty('percentage')
      expect(typeof genre.count).toBe('number')
    })
  })

  it('should return top venues', async () => {
    const response = await fetch('http://localhost:3000/api/stats')
    expect(response.status).toBe(200)

    const data = await response.json()
    data.venues.top.forEach((venue: any) => {
      expect(venue).toHaveProperty('id')
      expect(venue).toHaveProperty('name')
      expect(venue).toHaveProperty('eventCount')
    })
  })
})

describe('GET /api/genres', () => {
  it('should return all genres', async () => {
    const response = await fetch('http://localhost:3000/api/genres')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('genres')
    expect(data).toHaveProperty('total')
    expect(Array.isArray(data.genres)).toBe(true)

    data.genres.forEach((genre: any) => {
      expect(genre).toHaveProperty('name')
      expect(genre).toHaveProperty('count')
    })
  })
})

describe('GET /api/venues', () => {
  it('should return all venues', async () => {
    const response = await fetch('http://localhost:3000/api/venues')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('venues')
    expect(data).toHaveProperty('pagination')
    expect(Array.isArray(data.venues)).toBe(true)
  })

  it('should support venue search', async () => {
    const response = await fetch('http://localhost:3000/api/venues?search=Abbey')
    expect(response.status).toBe(200)

    const data = await response.json()
    if (data.venues.length > 0) {
      data.venues.forEach((venue: any) => {
        expect(venue.name.toLowerCase()).toContain('abbey')
      })
    }
  })
})

describe('GET /api/sources', () => {
  it('should return scraper sources', async () => {
    const response = await fetch('http://localhost:3000/api/sources')
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('sources')
    expect(data).toHaveProperty('summary')
    expect(Array.isArray(data.sources)).toBe(true)

    // Verify summary fields
    expect(data.summary).toHaveProperty('totalSources')
    expect(data.summary).toHaveProperty('activeSources')
    expect(data.summary).toHaveProperty('healthPercentage')
  })

  it('should report source health', async () => {
    const response = await fetch('http://localhost:3000/api/sources')
    expect(response.status).toBe(200)

    const data = await response.json()
    data.sources.forEach((source: any) => {
      expect(source).toHaveProperty('name')
      expect(source).toHaveProperty('status')
      expect(source).toHaveProperty('lastScrapedAt')
      expect(source).toHaveProperty('daysSinceLastScrape')
      expect(source).toHaveProperty('isStale')
    })
  })
})

describe('GET /api/queue/health', () => {
  it('should return queue health status', async () => {
    const response = await fetch('http://localhost:3000/api/queue/health')
    expect([200, 503]).toContain(response.status)

    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('redis')
    expect(data).toHaveProperty('queue')
  })

  it('should report queue job counts', async () => {
    const response = await fetch('http://localhost:3000/api/queue/health')
    expect([200, 503]).toContain(response.status)

    const data = await response.json()
    expect(data.queue).toHaveProperty('waiting')
    expect(data.queue).toHaveProperty('active')
    expect(data.queue).toHaveProperty('completed')
    expect(data.queue).toHaveProperty('failed')
  })
})
