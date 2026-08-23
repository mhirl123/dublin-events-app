# Dublin Events App - API Documentation

**Version:** 1.0  
**Last Updated:** August 21, 2026

Complete API reference for the Dublin Events aggregation application.

---

## Base URL

```
http://localhost:3000/api
```

All endpoints return JSON responses with consistent formatting.

---

## Authentication

Currently, all API endpoints are public. Authentication will be added in Phase 4.

---

## Response Format

### Success Response
```json
{
  "data": { },
  "pagination": { },
  "filters": { },
  "metadata": {
    "timestamp": "2026-08-21T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error explanation",
  "timestamp": "2026-08-21T10:30:00Z"
}
```

---

## Events API

### GET /api/events

Search and filter events with comprehensive filtering options.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Full-text search on title & description | `search=Taylor+Swift` |
| `dateFrom` | date | No | Start date (ISO 8601) | `dateFrom=2026-09-15` |
| `dateTo` | date | No | End date (ISO 8601) | `dateTo=2026-12-31` |
| `genre` | string | No | Single genre filter | `genre=Music` |
| `genres` | string | No | Multiple genres (comma-separated) | `genres=Music,Theater` |
| `priceMin` | number | No | Minimum ticket price (€) | `priceMin=0` |
| `priceMax` | number | No | Maximum ticket price (€) | `priceMax=100` |
| `venues` | string | No | Venue IDs (comma-separated) | `venues=uuid1,uuid2` |
| `sort` | string | No | Sort order | `sort=date-asc` |
| `page` | integer | No | Page number (default: 1) | `page=2` |
| `limit` | integer | No | Results per page (default: 20, max: 100) | `limit=50` |

#### Sort Options

- `date-asc` - Events earliest first (default)
- `date-desc` - Events latest first
- `price-asc` - Cheapest tickets first
- `price-desc` - Most expensive first
- `relevance` - Relevance-based (when searching)

#### Example Requests

**Get all upcoming events:**
```
GET /api/events?dateFrom=2026-08-21&limit=20
```

**Search for comedy events:**
```
GET /api/events?genres=Comedy&dateFrom=2026-09-01&dateTo=2026-09-30
```

**Budget filtering with price range:**
```
GET /api/events?priceMin=0&priceMax=50&sort=price-asc
```

**Multi-venue search:**
```
GET /api/events?venues=venue-id-1,venue-id-2&sort=date-asc
```

#### Response Example

```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Event Name",
      "dateStart": "2026-09-15T20:00:00Z",
      "dateEnd": "2026-09-15T23:00:00Z",
      "genre": "Music",
      "description": "Event description",
      "ticketPriceMin": 25,
      "ticketPriceMax": 75,
      "ticketUrl": "https://tickets.example.com/event",
      "imageUrl": "https://cdn.example.com/image.jpg",
      "venueName": "Venue Name",
      "venue": {
        "id": "venue-id",
        "name": "Venue Name",
        "address": "Street Address, Dublin"
      },
      "eventSources": [
        {
          "source": {
            "id": "source-id",
            "name": "Ticketmaster",
            "url": "ticketmaster.ie"
          },
          "sourceUrl": "https://ticketmaster.ie/event"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "search": null,
    "dateFrom": "2026-08-21",
    "dateTo": null,
    "genres": null,
    "priceRange": null,
    "venues": null,
    "sort": "date-asc"
  }
}
```

#### Status Codes
- `200` - Success
- `400` - Invalid parameters
- `500` - Server error

---

## Venues API

### GET /api/venues

Get list of all venues with event counts.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Venue name search |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 50) |

#### Example Request

```
GET /api/venues?search=Abbey&limit=10
```

#### Response Example

```json
{
  "venues": [
    {
      "id": "uuid",
      "name": "Abbey Theatre",
      "address": "Lower Abbey Street, Dublin",
      "website": "https://abbeytheatre.ie",
      "eventCount": 24
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 47,
    "pages": 1
  }
}
```

---

## Genres API

### GET /api/genres

Get all available event genres with event counts.

#### Query Parameters
None

#### Example Request

```
GET /api/genres
```

#### Response Example

```json
{
  "genres": [
    {
      "name": "Music",
      "count": 145
    },
    {
      "name": "Theater",
      "count": 89
    },
    {
      "name": "Comedy",
      "count": 67
    }
  ],
  "total": 7
}
```

---

## Sources API

### GET /api/sources

Get scraper sources and their health status.

#### Query Parameters
None

#### Example Request

```
GET /api/sources
```

#### Response Example

```json
{
  "sources": [
    {
      "id": "source-id",
      "name": "Abbey Theatre",
      "url": "https://www.abbeytheatre.ie",
      "scraperType": "cheerio",
      "status": "active",
      "eventCount": 24,
      "lastScrapedAt": "2026-08-21T02:00:00Z",
      "nextScrapedAt": "2026-08-22T02:00:00Z",
      "daysSinceLastScrape": 0,
      "isStale": false
    }
  ],
  "summary": {
    "totalSources": 47,
    "activeSources": 45,
    "inactiveSources": 2,
    "disabledSources": 0,
    "staleSources": 0,
    "healthPercentage": 96
  }
}
```

---

## Statistics API

### GET /api/stats

Get comprehensive event statistics and analytics.

#### Query Parameters
None

#### Example Request

```
GET /api/stats
```

#### Response Example

```json
{
  "overview": {
    "totalEvents": 483,
    "upcomingEvents": 342,
    "eventsThisWeek": 45,
    "eventsThisMonth": 189,
    "totalVenues": 47,
    "totalSources": 47
  },
  "genre": {
    "distribution": [
      {
        "name": "Music",
        "count": 145,
        "percentage": "30.0"
      }
    ]
  },
  "venues": {
    "top": [
      {
        "id": "venue-id",
        "name": "3 Arena",
        "eventCount": 42
      }
    ]
  },
  "recent": {
    "events": [
      {
        "id": "event-id",
        "title": "Event Name",
        "date": "2026-09-15T20:00:00Z",
        "venue": "Venue Name",
        "createdAt": "2026-08-21T10:30:00Z"
      }
    ]
  },
  "timeline": {
    "pastSevenDays": 127,
    "pastThirtyDays": 483
  }
}
```

---

## Job Queue API

### Job Management

#### POST /api/jobs/scrape

Trigger a manual scrape job.

##### Request Body

```json
{
  "type": "full",
  "scraperNames": ["AbbeyTheatreScraper"],
  "notifyOnComplete": true,
  "maxConcurrency": 1
}
```

##### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `full` | `full` or `selective` |
| `scraperNames` | array | - | Scraper names (selective only) |
| `notifyOnComplete` | boolean | `true` | Send notification when done |
| `maxConcurrency` | number | `1` | Parallel scrapers (1 recommended) |

##### Response

```json
{
  "success": true,
  "jobId": "job-123",
  "status": "queued",
  "data": {
    "type": "full",
    "notifyOnComplete": true
  },
  "message": "Scrape job job-123 has been queued"
}
```

#### GET /api/jobs/scrape

Get job status.

##### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jobId` | string | Yes | Job ID to check |

##### Example Request

```
GET /api/jobs/scrape?jobId=job-123
```

##### Response Example

```json
{
  "jobId": "job-123",
  "state": "completed",
  "progress": 100,
  "isCompleted": true,
  "isFailed": false,
  "data": {
    "type": "full"
  },
  "result": {
    "success": true,
    "startTime": "2026-08-21T02:00:00Z",
    "endTime": "2026-08-21T02:15:30Z",
    "duration": 930000,
    "scrapersRun": 47,
    "eventsAdded": 127,
    "statistics": {
      "totalEvents": 483,
      "totalVenues": 47,
      "totalSources": 47,
      "eventsByGenre": {
        "Music": 145,
        "Theater": 89
      }
    }
  },
  "finishedOn": 1724232930000,
  "processedOn": 1724232900000
}
```

#### GET /api/jobs/status

Get queue and recent job status.

##### Example Request

```
GET /api/jobs/status
```

##### Response Example

```json
{
  "status": {
    "waiting": 2,
    "active": 1,
    "completed": 148,
    "failed": 3,
    "delayed": 0,
    "paused": 0
  },
  "recentJobs": [
    {
      "id": "job-123",
      "state": "completed",
      "progress": 100,
      "data": {
        "type": "full"
      },
      "result": { }
    }
  ]
}
```

#### GET /api/queue/health

Check Redis and queue health.

##### Example Request

```
GET /api/queue/health
```

##### Response Example

```json
{
  "status": "healthy",
  "redis": "connected",
  "queue": {
    "waiting": 0,
    "active": 0,
    "completed": 200,
    "failed": 2,
    "delayed": 0,
    "paused": 0
  },
  "lastCheck": "2026-08-21T10:30:00Z"
}
```

---

## Error Handling

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Invalid parameters | Missing or malformed query parameters |
| 404 | Resource not found | Job or resource doesn't exist |
| 500 | Server error | Database or internal error |
| 503 | Service unavailable | Redis/queue connection issue |

### Error Response Format

```json
{
  "error": "Failed to fetch events",
  "message": "Database connection timeout",
  "timestamp": "2026-08-21T10:30:00Z"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This will be added in Phase 4.

Recommended client-side limits:
- Max 10 requests per second
- Max 1000 requests per hour per IP

---

## Pagination

All list endpoints support cursor-based pagination:

- `page`: Page number (starts at 1)
- `limit`: Results per page (default 20, max 100)

**Example:**
```
GET /api/events?page=2&limit=50
```

Response includes:
```json
{
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 483,
    "pages": 10,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## Filtering Guide

### Text Search

Full-text search on titles and descriptions:

```
GET /api/events?search=Taylor+Swift
```

### Date Filtering

Date range filtering (ISO 8601 format):

```
GET /api/events?dateFrom=2026-09-01&dateTo=2026-09-30
```

### Genre Filtering

Single genre:
```
GET /api/events?genre=Music
```

Multiple genres:
```
GET /api/events?genres=Music,Theater,Comedy
```

### Price Filtering

Price range filtering (in euros):

```
GET /api/events?priceMin=20&priceMax=100
```

### Venue Filtering

By venue IDs (comma-separated):

```
GET /api/events?venues=venue-id-1,venue-id-2
```

### Combined Filters

All filters can be combined:

```
GET /api/events?search=concert&dateFrom=2026-09-01&genres=Music&priceMax=75&sort=price-asc&limit=20
```

---

## Examples

### Find free events this month

```
GET /api/events?priceMin=0&priceMax=0&dateFrom=2026-08-21&dateTo=2026-09-21
```

### Get comedy shows next 2 weeks

```
GET /api/events?genre=Comedy&dateFrom=2026-08-21&dateTo=2026-09-04&sort=date-asc
```

### Search concerts by price

```
GET /api/events?genre=Music&priceMin=50&priceMax=150&sort=price-asc&limit=50
```

### Get theater events at specific venues

```
GET /api/events?genres=Theater&venues=abbey-theatre-id,gate-theatre-id&sort=date-asc
```

### Dashboard statistics

```
GET /api/stats
```

### Monitor scraper health

```
GET /api/sources
GET /api/queue/health
```

---

## Webhook Support

Webhooks are planned for Phase 4:
- Event added notifications
- Scraper completion events
- Error alerts

---

## Deprecation Policy

API versions will follow semantic versioning:
- `v1.x` - Current version
- `v2.0` - Major breaking changes
- Deprecated endpoints will be supported for 6 months

---

## Support & Issues

- **Documentation**: See `API_DOCUMENTATION.md`
- **Issues**: Check `IMPLEMENTATION_STATUS.md`
- **Configuration**: See `.env.example`

---

**Last Updated:** August 21, 2026  
**Status:** Phase 3 - API Implementation Complete  
**Next:** Frontend integration and testing
