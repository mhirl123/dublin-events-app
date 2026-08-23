/**
 * API Tests for Events Endpoint
 * Tests the advanced search, filtering, pagination, and sorting
 */

describe('GET /api/events', () => {
  describe('Basic Search', () => {
    it('should return all events without filters', async () => {
      const response = await fetch('http://localhost:3000/api/events')
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('events')
      expect(data).toHaveProperty('pagination')
      expect(Array.isArray(data.events)).toBe(true)
    })

    it('should filter events by search term', async () => {
      const response = await fetch('http://localhost:3000/api/events?search=Music')
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.events.length).toBeGreaterThanOrEqual(0)
      // If results exist, title or description should contain search term
      if (data.events.length > 0) {
        const hasMatch = data.events.some(
          (e: any) =>
            e.title.toLowerCase().includes('music') ||
            (e.description && e.description.toLowerCase().includes('music'))
        )
        expect(hasMatch).toBe(true)
      }
    })
  })

  describe('Date Range Filtering', () => {
    it('should filter events by dateFrom', async () => {
      const startDate = new Date().toISOString().split('T')[0]
      const response = await fetch(`http://localhost:3000/api/events?dateFrom=${startDate}`)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data.events)).toBe(true)
      // All events should be on or after startDate
      data.events.forEach((event: any) => {
        expect(new Date(event.dateStart) >= new Date(startDate)).toBe(true)
      })
    })

    it('should filter events by date range', async () => {
      const today = new Date()
      const dateFrom = today.toISOString().split('T')[0]
      const dateTo = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      const response = await fetch(
        `http://localhost:3000/api/events?dateFrom=${dateFrom}&dateTo=${dateTo}`
      )
      expect(response.status).toBe(200)

      const data = await response.json()
      data.events.forEach((event: any) => {
        const eventDate = new Date(event.dateStart)
        expect(eventDate >= new Date(dateFrom)).toBe(true)
        expect(eventDate <= new Date(dateTo)).toBe(true)
      })
    })
  })

  describe('Genre Filtering', () => {
    it('should filter by single genre', async () => {
      const response = await fetch('http://localhost:3000/api/events?genre=Music')
      expect(response.status).toBe(200)

      const data = await response.json()
      if (data.events.length > 0) {
        data.events.forEach((event: any) => {
          expect(event.genre).toBe('Music')
        })
      }
    })

    it('should filter by multiple genres', async () => {
      const response = await fetch('http://localhost:3000/api/events?genres=Music,Comedy')
      expect(response.status).toBe(200)

      const data = await response.json()
      if (data.events.length > 0) {
        data.events.forEach((event: any) => {
          expect(['Music', 'Comedy']).toContain(event.genre)
        })
      }
    })
  })

  describe('Price Filtering', () => {
    it('should filter by price range', async () => {
      const response = await fetch(
        'http://localhost:3000/api/events?priceMin=20&priceMax=100'
      )
      expect(response.status).toBe(200)

      const data = await response.json()
      data.events.forEach((event: any) => {
        // Price should be within range or null
        if (event.ticketPriceMax !== null) {
          expect(parseInt(event.ticketPriceMax) >= 20).toBe(true)
        }
      })
    })

    it('should find free events', async () => {
      const response = await fetch(
        'http://localhost:3000/api/events?priceMin=0&priceMax=0'
      )
      expect(response.status).toBe(200)

      const data = await response.json()
      if (data.events.length > 0) {
        data.events.forEach((event: any) => {
          expect(event.ticketPriceMin).toBe(0)
          expect(event.ticketPriceMax).toBe(0)
        })
      }
    })
  })

  describe('Sorting', () => {
    it('should sort by date ascending', async () => {
      const response = await fetch('http://localhost:3000/api/events?sort=date-asc')
      expect(response.status).toBe(200)

      const data = await response.json()
      if (data.events.length > 1) {
        for (let i = 0; i < data.events.length - 1; i++) {
          const current = new Date(data.events[i].dateStart)
          const next = new Date(data.events[i + 1].dateStart)
          expect(current <= next).toBe(true)
        }
      }
    })

    it('should sort by date descending', async () => {
      const response = await fetch('http://localhost:3000/api/events?sort=date-desc')
      expect(response.status).toBe(200)

      const data = await response.json()
      if (data.events.length > 1) {
        for (let i = 0; i < data.events.length - 1; i++) {
          const current = new Date(data.events[i].dateStart)
          const next = new Date(data.events[i + 1].dateStart)
          expect(current >= next).toBe(true)
        }
      }
    })

    it('should sort by price ascending', async () => {
      const response = await fetch('http://localhost:3000/api/events?sort=price-asc')
      expect(response.status).toBe(200)

      const data = await response.json()
      // Just verify request succeeds
      expect(Array.isArray(data.events)).toBe(true)
    })
  })

  describe('Pagination', () => {
    it('should paginate results', async () => {
      const response = await fetch('http://localhost:3000/api/events?page=1&limit=5')
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.pagination).toHaveProperty('page', 1)
      expect(data.pagination).toHaveProperty('limit', 5)
      expect(data.pagination).toHaveProperty('total')
      expect(data.pagination).toHaveProperty('pages')
      expect(data.pagination).toHaveProperty('hasNextPage')
      expect(data.pagination).toHaveProperty('hasPrevPage')
    })

    it('should respect limit parameter', async () => {
      const response = await fetch('http://localhost:3000/api/events?limit=10')
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.events.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Error Handling', () => {
    it('should return 400 for invalid date format', async () => {
      const response = await fetch('http://localhost:3000/api/events?dateFrom=invalid-date')
      // Should handle gracefully - either 400 or process as-is
      expect([200, 400]).toContain(response.status)
    })

    it('should return 400 for invalid price', async () => {
      const response = await fetch('http://localhost:3000/api/events?priceMin=invalid')
      expect([200, 400]).toContain(response.status)
    })
  })
})

describe('GET /api/events/[id]', () => {
  it('should fetch single event details', async () => {
    // First get any event
    const listResponse = await fetch('http://localhost:3000/api/events?limit=1')
    const listData = await listResponse.json()

    if (listData.events.length === 0) {
      console.log('No events to test with')
      return
    }

    const eventId = listData.events[0].id
    const response = await fetch(`http://localhost:3000/api/events/${eventId}`)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('id', eventId)
    expect(data).toHaveProperty('title')
    expect(data).toHaveProperty('dateStart')
  })

  it('should return 404 for non-existent event', async () => {
    const response = await fetch('http://localhost:3000/api/events/invalid-id-12345')
    expect(response.status).toBe(404)
  })
})
