'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface EventDetail {
  id: string
  title: string
  description: string | null
  dateStart: string
  dateEnd: string | null
  genre: string | null
  ticketPriceMin: number | null
  ticketPriceMax: number | null
  ticketUrl: string | null
  imageUrl: string | null
  venueName: string | null
  venue: {
    id: string
    name: string
    address: string | null
    website: string | null
  } | null
  eventSources: Array<{
    source: {
      id: string
      name: string
      url: string
    }
    sourceUrl: string | null
  }>
}

const GENRE_EMOJIS: { [key: string]: string } = {
  Music: '🎵',
  Theater: '🎭',
  Comedy: '😂',
  Sports: '⚽',
  Festival: '🎪',
  Art: '🎨',
  Conference: '💼',
  Workshop: '🛠️',
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (!response.ok) throw new Error('Event not found')
        const data = await response.json()
        setEvent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7c3aed] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">❌ Event Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'This event could not be found.'}</p>
          <Link href="/" className="btn btn-primary">
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.dateStart)
  const genreEmoji = GENRE_EMOJIS[event.genre || ''] || '🎪'
  const priceDisplay =
    event.ticketPriceMin && event.ticketPriceMax
      ? `€${event.ticketPriceMin} - €${event.ticketPriceMax}`
      : event.ticketPriceMin
      ? `from €${event.ticketPriceMin}`
      : 'Price TBA'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-[#7c3aed] hover:text-[#ec4899] font-semibold flex items-center gap-2">
          ← Back to Events
        </Link>
        <div className="text-sm text-gray-500">Viewing Event Details</div>
      </div>

      {/* Hero image/color */}
      <div
        className={`w-full h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl overflow-hidden mb-8 flex items-center justify-center text-9xl relative`}
      >
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}
        {!event.imageUrl && <span>{genreEmoji}</span>}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - details */}
        <div className="lg:col-span-2">
          {/* Title and Genre */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 text-gray-900">{event.title}</h1>
            {event.genre && (
              <div className="flex items-center gap-2">
                <span className="text-4xl">{genreEmoji}</span>
                <span className="text-lg font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  {event.genre}
                </span>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="card p-8 mb-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 gradient-text">📋 Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">Date & Time</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {eventDate.toLocaleDateString('en-IE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at{' '}
                  {eventDate.toLocaleTimeString('en-IE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">Price</label>
                <p className="text-lg font-bold bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent mt-1">
                  {priceDisplay}
                </p>
              </div>

              {event.venue && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Venue</label>
                  <div className="mt-1">
                    <p className="text-lg font-semibold text-gray-900">{event.venue.name}</p>
                    {event.venue.address && (
                      <p className="text-gray-600 mt-1">📍 {event.venue.address}</p>
                    )}
                    {event.venue.website && (
                      <a
                        href={event.venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7c3aed] hover:text-[#ec4899] font-semibold mt-2 inline-block"
                      >
                        Visit Venue Website →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="card p-8 mb-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 gradient-text">📖 Description</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>
            </div>
          )}
        </div>

        {/* Right column - CTA and sources */}
        <div className="lg:col-span-1">
          {/* Ticket CTA */}
          {event.ticketUrl && (
            <div className="card p-8 sticky top-24 rounded-2xl mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Get Your Tickets</h3>
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-400/50 transition-all text-center text-lg mb-4 inline-block"
              >
                🎟️ Buy Tickets Now
              </a>
              <p className="text-xs text-gray-500 text-center">
                You will be redirected to the ticketing platform
              </p>
            </div>
          )}

          {/* Sources */}
          {event.eventSources.length > 0 && (
            <div className="card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-900">📰 Found On</h3>
              <div className="space-y-3">
                {event.eventSources.map((es) => (
                  <a
                    key={es.source.id}
                    href={es.sourceUrl || es.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{es.source.name}</p>
                    <p className="text-xs text-gray-500 mt-1">View on source →</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
