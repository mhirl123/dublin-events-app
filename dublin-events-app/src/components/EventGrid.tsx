'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Event {
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
  venue: {
    name: string
    address: string | null
  } | null
}

interface EventGridProps {
  events: Event[]
  isLoading: boolean
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

const GRADIENT_COLORS = [
  'from-purple-500 to-pink-500',
  'from-pink-500 to-orange-400',
  'from-blue-500 to-purple-500',
  'from-orange-400 to-red-500',
  'from-green-400 to-blue-500',
  'from-indigo-500 to-pink-500',
]

export default function EventGrid({ events, isLoading }: EventGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7c3aed] mb-4"></div>
          </div>
          <p className="text-gray-600 text-lg font-semibold">Loading events...</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">🔍 No events found</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters to discover more events</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">
          What's Happening This Week?
        </h2>
        <p className="text-gray-500">
          ✨ {events.length} exciting {events.length === 1 ? 'event' : 'events'} waiting for you
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            gradientIndex={index % GRADIENT_COLORS.length}
          />
        ))}
      </div>
    </div>
  )
}

function EventCard({
  event,
  gradientIndex,
}: {
  event: Event
  gradientIndex: number
}) {
  const eventDate = new Date(event.dateStart)
  const priceDisplay =
    event.ticketPriceMin && event.ticketPriceMax
      ? `€${event.ticketPriceMin} - €${event.ticketPriceMax}`
      : event.ticketPriceMin
      ? `from €${event.ticketPriceMin}`
      : 'Price TBA'

  const genreEmoji = GENRE_EMOJIS[event.genre || ''] || '🎪'
  const gradientClass = GRADIENT_COLORS[gradientIndex]

  return (
    <Link href={`/events/${event.id}`}>
      <div className="card overflow-hidden rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
      {/* Image/Color Section */}
      <div
        className={`w-full h-48 bg-gradient-to-br ${gradientClass} flex items-center justify-center text-6xl relative overflow-hidden`}
      >
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        {!event.imageUrl && <span>{genreEmoji}</span>}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-base font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-[#7c3aed] transition-colors">
          {event.title}
        </h3>

        {/* Genre Badge */}
        {event.genre && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{genreEmoji}</span>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {event.genre}
            </span>
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span className="font-medium">
              {eventDate.toLocaleDateString('en-IE', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              {' • '}
              {eventDate.toLocaleTimeString('en-IE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {event.venue && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="font-medium">{event.venue.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <span>💰</span>
            <span className="font-bold bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">
              {priceDisplay}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-400/50 transition-all text-center text-sm"
          >
            🎟️ Get Tickets
          </a>
        )}
      </div>
      </div>
    </Link>
  )
}
