'use client'

import { useState, useEffect } from 'react'
import EventGrid from '@/components/EventGrid'
import SearchFilters from '@/components/SearchFilters'

interface SearchParams {
  query: string
  dateFrom: string
  dateTo: string
  genre: string
  priceMin: number
  priceMax: number
  venues: string[]
  sort: string
}

export default function Home() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    dateFrom: '',
    dateTo: '',
    genre: '',
    priceMin: 0,
    priceMax: 1000,
    venues: [],
    sort: 'date-asc',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

  // Auto-search on component mount
  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams()
      if (searchParams.query) params.append('search', searchParams.query)
      if (searchParams.dateFrom) params.append('dateFrom', searchParams.dateFrom)
      if (searchParams.dateTo) params.append('dateTo', searchParams.dateTo)
      if (searchParams.genre) params.append('genre', searchParams.genre)
      if (searchParams.priceMin) params.append('priceMin', searchParams.priceMin.toString())
      if (searchParams.priceMax) params.append('priceMax', searchParams.priceMax.toString())
      if (searchParams.venues.length > 0)
        params.append('venues', searchParams.venues.join(','))
      if (searchParams.sort) params.append('sort', searchParams.sort)

      const response = await fetch(`/api/events?${params.toString()}`)
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Sidebar - Left */}
      <div className="lg:col-span-1">
        <SearchFilters
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content - Right */}
      <div className="lg:col-span-4">
        <EventGrid events={events} isLoading={isLoading} />
      </div>
    </div>
  )
}
