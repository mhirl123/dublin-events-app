'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  overview: {
    totalEvents: number
    upcomingEvents: number
    eventsThisWeek: number
    eventsThisMonth: number
    totalVenues: number
    totalSources: number
  }
  genre: {
    distribution: Array<{
      name: string
      count: number
      percentage: string
    }>
  }
  venues: {
    top: Array<{
      id: string
      name: string
      eventCount: number
    }>
  }
  recent: {
    events: Array<{
      id: string
      title: string
      date: string
      venue: string
      createdAt: string
    }>
  }
  timeline: {
    pastSevenDays: number
    pastThirtyDays: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Failed to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">📊 Dublin Events Dashboard</h1>
          <p className="text-gray-600">Real-time event statistics and insights</p>
        </div>
        <Link href="/" className="btn btn-primary">
          ← Back to Events
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-6 rounded-xl">
          <p className="text-sm text-gray-500 font-semibold">Total Events</p>
          <p className="text-4xl font-bold gradient-text mt-2">{stats.overview.totalEvents}</p>
        </div>
        <div className="card p-6 rounded-xl">
          <p className="text-sm text-gray-500 font-semibold">Upcoming</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.overview.upcomingEvents}</p>
        </div>
        <div className="card p-6 rounded-xl">
          <p className="text-sm text-gray-500 font-semibold">This Week</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.overview.eventsThisWeek}</p>
        </div>
        <div className="card p-6 rounded-xl">
          <p className="text-sm text-gray-500 font-semibold">This Month</p>
          <p className="text-4xl font-bold text-pink-600 mt-2">{stats.overview.eventsThisMonth}</p>
        </div>
        <div className="card p-6 rounded-xl">
          <p className="text-sm text-gray-500 font-semibold">Venues</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.overview.totalVenues}</p>
        </div>
        <div className="card p-6 rounded-xl">
          <p className="text-sm text-gray-500 font-semibold">Sources</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">{stats.overview.totalSources}</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genre Distribution */}
        <div className="card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 gradient-text">🎭 Events by Genre</h2>
          <div className="space-y-4">
            {stats.genre.distribution.length === 0 ? (
              <p className="text-gray-500">No genre data available</p>
            ) : (
              stats.genre.distribution.map((genre) => (
                <div key={genre.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{genre.name}</span>
                    <span className="text-sm font-bold text-[#7c3aed]">{genre.count} events</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] h-2 rounded-full"
                      style={{ width: `${parseFloat(genre.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Venues */}
        <div className="card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 gradient-text">📍 Top Venues</h2>
          <div className="space-y-3">
            {stats.venues.top.length === 0 ? (
              <p className="text-gray-500">No venue data available</p>
            ) : (
              stats.venues.top.map((venue, index) => (
                <div key={venue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <span className="font-semibold text-gray-900">{venue.name}</span>
                  </div>
                  <span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent font-bold">
                    {venue.eventCount} events
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Timeline and Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline */}
        <div className="card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 gradient-text">📈 Activity Timeline</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Last 7 Days</span>
                <span className="text-lg font-bold text-[#7c3aed]">{stats.timeline.pastSevenDays}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      (stats.timeline.pastSevenDays / stats.timeline.pastThirtyDays) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Last 30 Days</span>
                <span className="text-lg font-bold text-[#ec4899]">{stats.timeline.pastThirtyDays}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-500 to-orange-500 h-3 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6 gradient-text">🎪 Recently Added</h2>
          <div className="space-y-3">
            {stats.recent.events.length === 0 ? (
              <p className="text-gray-500">No recent events</p>
            ) : (
              stats.recent.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {event.venue} • 📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
