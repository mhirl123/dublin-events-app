'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import EventGrid from '@/components/EventGrid'
import SearchFilters from '@/components/SearchFilters'

interface SearchParams {
  query: string
  dateFrom: string
  dateTo: string
  genres: string[]
  priceRanges: Array<{ min: number; max: number }>
  venues: string[]
  sort: string
}

export default function Home() {
  const urlSearchParams = useSearchParams()
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    dateFrom: '',
    dateTo: '',
    genres: [],
    priceRanges: [],
    venues: [],
    sort: 'date-asc',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from URL params and auto-search on component mount
  useEffect(() => {
    if (isInitialized) return

    // Read URL parameters
    const query = urlSearchParams.get('search') || ''
    const dateFrom = urlSearchParams.get('dateFrom') || ''
    const dateTo = urlSearchParams.get('dateTo') || ''
    const genresParam = urlSearchParams.get('genres') || ''
    const priceRangesParam = urlSearchParams.get('priceRanges') || ''
    const sort = urlSearchParams.get('sort') || 'date-asc'

    const genres = genresParam ? genresParam.split(',') : []
    let priceRanges: Array<{ min: number; max: number }> = []

    if (priceRangesParam) {
      try {
        priceRanges = JSON.parse(priceRangesParam)
      } catch (e) {
        priceRanges = []
      }
    }

    const params: SearchParams = {
      query,
      dateFrom,
      dateTo,
      genres,
      priceRanges,
      venues: [],
      sort,
    }

    setSearchParams(params)
    setIsInitialized(true)
  }, [urlSearchParams, isInitialized])

  // Auto-search when params are initialized
  useEffect(() => {
    if (isInitialized) {
      handleSearch()
    }
  }, [isInitialized])

  const handleSearch = async (paramsOverride?: SearchParams) => {
    setIsLoading(true)
    const params = paramsOverride || searchParams

    try {
      const urlParams = new URLSearchParams()
      if (params.query) urlParams.append('search', params.query)
      if (params.dateFrom) urlParams.append('dateFrom', params.dateFrom)
      if (params.dateTo) urlParams.append('dateTo', params.dateTo)
      if (params.genres.length > 0)
        urlParams.append('genres', params.genres.join(','))

      // Handle multiple price ranges
      if (params.priceRanges.length > 0) {
        urlParams.append('priceRanges', JSON.stringify(params.priceRanges))
      }

      if (params.venues.length > 0)
        urlParams.append('venues', params.venues.join(','))
      if (params.sort) urlParams.append('sort', params.sort)

      // Update URL without page reload
      const queryString = urlParams.toString()
      window.history.replaceState({}, '', queryString ? `?${queryString}` : '/')

      const response = await fetch(`/api/events?${urlParams.toString()}`)
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newParams: SearchParams) => {
    setSearchParams(newParams)
    // Trigger search with new params
    handleSearch(newParams)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Sidebar - Left */}
      <div className="lg:col-span-1">
        <SearchFilters
          searchParams={searchParams}
          setSearchParams={handleFilterChange}
          onSearch={() => handleSearch(searchParams)}
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
