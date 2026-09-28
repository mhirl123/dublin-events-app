'use client'

import { useState } from 'react'

interface SearchParams {
  query: string
  dateFrom: string
  dateTo: string
  genres: string[]
  priceRanges: Array<{ min: number; max: number }>
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

  const toggleSection = (section: keyof typeof expandedSections) => {
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

      {/* Genre - Playful Style with Multi-select */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('genre')}
          className="w-full flex items-center justify-between font-semibold text-sm mb-3 text-gray-700 hover:text-[#7c3aed]"
        >
          <span>Vibe</span>
          <span className="text-lg">{expandedSections.genre ? '−' : '+'}</span>
        </button>
        {expandedSections.genre && (
          <div>
            {/* Select All / Clear All buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    genres: GENRES.map(g => g.name),
                  })
                }}
                className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-all"
              >
                ✓ All
              </button>
              <button
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    genres: [],
                  })
                }}
                className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
              >
                ✕ None
              </button>
            </div>

            {/* Genre checkboxes */}
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.name}
                  onClick={() => {
                    const isSelected = searchParams.genres.includes(g.name)
                    setSearchParams({
                      ...searchParams,
                      genres: isSelected
                        ? searchParams.genres.filter(genre => genre !== g.name)
                        : [...searchParams.genres, g.name],
                    })
                  }}
                  className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    searchParams.genres.includes(g.name)
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {g.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Range - Multi-select */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-semibold text-sm mb-3 text-gray-700 hover:text-[#7c3aed]"
        >
          <span>Budget</span>
          <span className="text-lg">{expandedSections.price ? '−' : '+'}</span>
        </button>
        {expandedSections.price && (
          <div>
            {/* Select All / Clear All buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    priceRanges: PRICE_RANGES,
                  })
                }}
                className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-all"
              >
                ✓ All
              </button>
              <button
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    priceRanges: [],
                  })
                }}
                className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
              >
                ✕ None
              </button>
            </div>

            {/* Price range checkboxes */}
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center text-sm cursor-pointer hover:text-[#7c3aed] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={searchParams.priceRanges.some(
                      (pr) => pr.min === range.min && pr.max === range.max
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSearchParams({
                          ...searchParams,
                          priceRanges: [...searchParams.priceRanges, range],
                        })
                      } else {
                        setSearchParams({
                          ...searchParams,
                          priceRanges: searchParams.priceRanges.filter(
                            (pr) => !(pr.min === range.min && pr.max === range.max)
                          ),
                        })
                      }
                    }}
                    className="mr-3 w-4 h-4 accent-purple-600"
                  />
                  {range.label}
                </label>
              ))}
            </div>
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
            genres: [],
            priceRanges: [],
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
