'use client'

import { useState } from 'react'

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

interface SearchFiltersProps {
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  onSearch: () => void
  isLoading: boolean
}

const GENRES = [
  { name: 'Music', emoji: '🎵' },
  { name: 'Theater', emoji: '🎭' },
  { name: 'Comedy', emoji: '😂' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Festival', emoji: '🎪' },
  { name: 'Art', emoji: '🎨' },
  { name: 'Conference', emoji: '💼' },
  { name: 'Workshop', emoji: '🛠️' },
]

const PRICE_RANGES = [
  { label: 'Free', min: 0, max: 0 },
  { label: '€0 - €25', min: 0, max: 25 },
  { label: '€25 - €60', min: 25, max: 60 },
  { label: '€60+', min: 60, max: 1000 },
]

export default function SearchFilters({
  searchParams,
  setSearchParams,
  onSearch,
  isLoading,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    dates: true,
    price: true,
    genre: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="card p-6 sticky top-24 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-6 gradient-text">🎯 Filters</h2>

      {/* Search */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('search')}
          className="w-full flex items-center justify-between font-semibold text-sm mb-3 text-gray-700 hover:text-[#7c3aed]"
        >
          <span>Search Events</span>
          <span className="text-lg">{expandedSections.search ? '−' : '+'}</span>
        </button>
        {expandedSections.search && (
          <input
            type="text"
            placeholder="🔍 Event name..."
            value={searchParams.query}
            onChange={(e) =>
              setSearchParams({ ...searchParams, query: e.target.value })
            }
            className="input text-sm"
          />
        )}
      </div>

      {/* Date Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('dates')}
          className="w-full flex items-center justify-between font-semibold text-sm mb-3 text-gray-700 hover:text-[#7c3aed]"
        >
          <span>When</span>
          <span className="text-lg">{expandedSections.dates ? '−' : '+'}</span>
        </button>
        {expandedSections.dates && (
          <div className="space-y-2">
            <input
              type="date"
              value={searchParams.dateFrom}
              onChange={(e) =>
                setSearchParams({ ...searchParams, dateFrom: e.target.value })
              }
              className="input text-sm"
            />
            <input
              type="date"
              value={searchParams.dateTo}
              onChange={(e) =>
                setSearchParams({ ...searchParams, dateTo: e.target.value })
              }
              className="input text-sm"
            />
          </div>
        )}
      </div>

      {/* Genre - Playful Style */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('genre')}
          className="w-full flex items-center justify-between font-semibold text-sm mb-3 text-gray-700 hover:text-[#7c3aed]"
        >
          <span>Vibe</span>
          <span className="text-lg">{expandedSections.genre ? '−' : '+'}</span>
        </button>
        {expandedSections.genre && (
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g.name}
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    genre: searchParams.genre === g.name ? '' : g.name,
                  })
                }}
                className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                  searchParams.genre === g.name
                    ? 'bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-semibold text-sm mb-3 text-gray-700 hover:text-[#7c3aed]"
        >
          <span>Budget</span>
          <span className="text-lg">{expandedSections.price ? '−' : '+'}</span>
        </button>
        {expandedSections.price && (
          <div className="space-y-2">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.label}
                className="flex items-center text-sm cursor-pointer hover:text-[#7c3aed] transition-colors"
              >
                <input
                  type="radio"
                  name="price"
                  checked={
                    searchParams.priceMin === range.min &&
                    searchParams.priceMax === range.max
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSearchParams({
                        ...searchParams,
                        priceMin: range.min,
                        priceMax: range.max,
                      })
                    }
                  }}
                  className="mr-3"
                />
                {range.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sorting */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={searchParams.sort || 'date-asc'}
          onChange={(e) => {
            setSearchParams({
              ...searchParams,
              sort: e.target.value,
            })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
        >
          <option value="date-asc">📅 Earliest First</option>
          <option value="date-desc">📅 Latest First</option>
          <option value="price-asc">💰 Cheapest First</option>
          <option value="price-desc">💰 Most Expensive</option>
        </select>
      </div>

      {/* Search Button */}
      <button
        onClick={onSearch}
        disabled={isLoading}
        className="w-full btn btn-primary mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '⏳ Searching...' : '🔍 Search Events'}
      </button>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSearchParams({
            query: '',
            dateFrom: '',
            dateTo: '',
            genre: '',
            priceMin: 0,
            priceMax: 1000,
            venues: [],
            sort: 'date-asc',
          })
        }}
        className="w-full btn btn-secondary"
      >
        ✕ Clear Filters
      </button>
    </div>
  )
}
