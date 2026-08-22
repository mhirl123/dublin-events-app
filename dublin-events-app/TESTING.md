# Dublin Events App - Testing Guide

**Coverage Target:** 80%+  
**Last Updated:** August 21, 2026

---

## Testing Strategy

### Test Pyramid
```
                    E2E Tests
                   /         \
                 /             \
              Integration Tests
            /                     \
          /                         \
        Unit Tests
      /                               \
```

- **Unit Tests (60%)** - Individual functions and utilities
- **Integration Tests (30%)** - API endpoints and database
- **E2E Tests (10%)** - Full user workflows

---

## Running Tests

### Setup

```bash
# Install testing dependencies (if not already installed)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Generate Jest config
npm init jest
```

### Run All Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm test -- --watch

# With coverage report
npm test -- --coverage
```

### Run Specific Test Suite

```bash
npm test -- __tests__/api/events.test.ts
npm test -- __tests__/api/stats.test.ts
```

---

## Unit Tests

### API Utils

Test utility functions used across API endpoints:

```typescript
// __tests__/utils/validators.test.ts
describe('Date Validators', () => {
  it('should validate ISO date format', () => {
    expect(isValidDate('2026-08-21')).toBe(true)
    expect(isValidDate('invalid')).toBe(false)
  })
})

// __tests__/utils/filters.test.ts
describe('Event Filters', () => {
  it('should apply genre filter', () => {
    const events = [
      { genre: 'Music', title: 'Concert' },
      { genre: 'Comedy', title: 'Show' },
    ]
    const filtered = filterByGenre(events, 'Music')
    expect(filtered).toHaveLength(1)
  })
})
```

### Database Models

Test Prisma operations:

```typescript
// __tests__/lib/models/events.test.ts
describe('Event Model', () => {
  it('should fetch event by ID', async () => {
    const event = await getEventById('event-1')
    expect(event).toBeDefined()
    expect(event?.id).toBe('event-1')
  })

  it('should search events by title', async () => {
    const results = await searchEvents('Taylor')
    expect(results.length).toBeGreaterThan(0)
  })
})
```

---

## Integration Tests

### API Endpoints

Test full request/response cycle:

**Location:** `__tests__/api/events.test.ts` (already provided)

```bash
# Start dev server first
npm run dev

# In another terminal
npm test -- __tests__/api/events.test.ts
```

### Database Integration

Test data operations:

```typescript
// __tests__/db/events.integration.test.ts
describe('Event Database Operations', () => {
  beforeAll(async () => {
    await seedDatabase()
  })

  afterAll(async () => {
    await cleanupDatabase()
  })

  it('should create and retrieve event', async () => {
    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        dateStart: new Date(),
        genre: 'Music',
      },
    })

    const retrieved = await prisma.event.findUnique({
      where: { id: event.id },
    })

    expect(retrieved?.title).toBe('Test Event')
  })
})
```

### Job Queue Integration

Test background jobs:

```typescript
// __tests__/queue/scraper.integration.test.ts
describe('Scraper Job Queue', () => {
  it('should queue and process scrape job', async () => {
    const jobId = await queueScrapeJob({ type: 'full' })
    expect(jobId).toBeDefined()

    // Wait for job completion
    const result = await waitForJob(jobId, 30000)
    expect(result.success).toBe(true)
    expect(result.eventsAdded).toBeGreaterThan(0)
  })
})
```

---

## E2E Tests (Cypress/Playwright)

### Installation

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Test Examples

```typescript
// __tests__/e2e/search.e2e.ts
import { test, expect } from '@playwright/test'

test.describe('Event Search', () => {
  test('should search and filter events', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000')

    // Select genre filter
    await page.click('[data-testid="genre-music"]')

    // Set date range
    await page.fill('[data-testid="date-from"]', '2026-09-01')

    // Click search
    await page.click('[data-testid="search-button"]')

    // Verify results
    await page.waitForSelector('[data-testid="event-card"]')
    const cards = await page.locator('[data-testid="event-card"]').count()
    expect(cards).toBeGreaterThan(0)
  })

  test('should navigate to event detail', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Click first event
    await page.click('[data-testid="event-card"]')

    // Verify detail page
    await page.waitForURL('/events/*')
    await expect(page.locator('h1')).toBeDefined()
  })

  test('should filter by price', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Select price range
    await page.click('[data-testid="price-free"]')

    // Search
    await page.click('[data-testid="search-button"]')

    // Verify all events are free
    const prices = await page.locator('[data-testid="event-price"]').allTextContents()
    prices.forEach((price) => {
      expect(price).toContain('Free') || expect(price).toContain('€0')
    })
  })
})
```

### Run E2E Tests

```bash
# Start dev server
npm run dev

# In another terminal
npx playwright test

# With UI
npx playwright test --ui

# Specific test
npx playwright test search.e2e.ts
```

---

## Performance Tests

### Response Time Benchmarks

```typescript
// __tests__/performance/api-response-time.test.ts
describe('API Performance', () => {
  it('should respond to search in <500ms', async () => {
    const start = Date.now()
    await fetch('/api/events?limit=20')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(500)
  })

  it('should return stats in <1000ms', async () => {
    const start = Date.now()
    await fetch('/api/stats')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(1000)
  })
})
```

### Load Testing

```bash
# Install load testing tool
npm install --save-dev artillery

# Create load test config
cat > artillery-config.yml << 'EOF'
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 10
      name: "Ramp down"

scenarios:
  - name: "Search Events"
    flow:
      - get:
          url: "/api/events?genres=Music&limit=20"
      - think: 2
      - get:
          url: "/api/stats"
EOF

# Run load test
artillery run artillery-config.yml
```

---

## Security Tests

### SQL Injection Prevention

```typescript
// __tests__/security/sql-injection.test.ts
describe('SQL Injection Prevention', () => {
  it('should safely handle malicious search input', async () => {
    const malicious = "'; DROP TABLE events; --"
    const response = await fetch(
      `/api/events?search=${encodeURIComponent(malicious)}`
    )

    expect(response.status).toBe(200)
    // Verify database still exists
    const stats = await fetch('/api/stats')
    expect(stats.status).toBe(200)
  })
})
```

### XSS Prevention

```typescript
// __tests__/security/xss.test.ts
describe('XSS Prevention', () => {
  it('should escape user input in event titles', async () => {
    const xssPayload = '<img src=x onerror="alert(1)">'
    const response = await fetch(`/api/events?search=${encodeURIComponent(xssPayload)}`)
    const data = await response.json()

    // Verify no script tags in response
    const responseText = JSON.stringify(data)
    expect(responseText).not.toContain('<script>')
    expect(responseText).not.toContain('onerror=')
  })
})
```

---

## Test Coverage

### Generate Coverage Report

```bash
npm test -- --coverage

# Output
# ┌──────────────┬──────┬──────┬────────┐
# │ File         │ % St │ % Br │ % Func │
# ├──────────────┼──────┼──────┼────────┤
# │ api/events   │ 92   │ 88   │ 95     │
# │ lib/filters  │ 87   │ 81   │ 90     │
# │ components   │ 75   │ 68   │ 80     │
# │ Total        │ 82   │ 78   │ 85     │
# └──────────────┴──────┴──────┴────────┘
```

### Coverage Thresholds

Set in `jest.config.js`:

```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
}
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

Configuration: `.github/workflows/ci.yml`

View results:
1. Push code to GitHub
2. Go to "Actions" tab
3. Click workflow run
4. See test results

---

## Manual Testing Checklist

### Smoke Tests (Quick)

- [ ] Home page loads
- [ ] Search returns results
- [ ] Filter by genre works
- [ ] Event detail page loads
- [ ] Dashboard stats display
- [ ] API health check passes

### Functional Tests (Comprehensive)

- [ ] Search with all filter combinations
- [ ] Pagination works (page 1, 2, last)
- [ ] Sorting by date ascending/descending
- [ ] Sorting by price
- [ ] Free events filter
- [ ] Date range filtering
- [ ] Event detail shows all info
- [ ] Links to ticket purchase work
- [ ] Dashboard updates after scrape
- [ ] Error messages display correctly

### Cross-Browser Testing

Test on:
- Chrome (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Edge

### Mobile Testing

- [ ] Responsive layout works
- [ ] Touch interactions work
- [ ] Search filters accessible
- [ ] Event cards readable
- [ ] Navigation works

### Performance Testing

- [ ] Homepage loads in <3s
- [ ] Search results in <500ms
- [ ] Dashboard loads in <2s
- [ ] Images optimized
- [ ] No console errors
- [ ] Network waterfall reasonable

---

## Debugging Failed Tests

### View Detailed Logs

```bash
# Increase verbosity
npm test -- --verbose

# Show individual test results
npm test -- --listTests
```

### Debug Mode

```bash
# Node debugger
node --inspect-brk node_modules/.bin/jest

# Playwright inspector
PWDEBUG=1 npx playwright test
```

### Common Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | DB/Redis not running | `docker-compose up` |
| `Timeout after 5000ms` | Server not responding | Check `npm run dev` |
| `Cannot find module` | Missing import | `npm install` |
| `CORS error` | API headers | Check CORS config |

---

## Test Data Management

### Seed Test Database

```bash
npm run db:seed
```

### Clean Up Between Tests

```typescript
afterEach(async () => {
  // Clear test data
  await prisma.event.deleteMany()
  await prisma.venue.deleteMany()
})
```

### Use Database Snapshots

```bash
# Create snapshot
pg_dump $DATABASE_URL > snapshot.sql

# Restore
psql $DATABASE_URL < snapshot.sql
```

---

## Continuous Testing

### Watch Mode

```bash
npm test -- --watch
```

Auto-runs tests when files change.

### Test on Every Commit

```bash
# Install husky
npm install --save-dev husky

# Setup hook
npx husky install
npx husky add .husky/pre-commit "npm test"

# Now tests run before each commit
git commit -m "My changes"  # Tests run first
```

---

## Success Criteria

- ✅ 80%+ code coverage
- ✅ All API endpoints tested
- ✅ E2E workflows covered
- ✅ Performance benchmarks met
- ✅ Security tests passing
- ✅ CI/CD fully automated
- ✅ Zero critical bugs
- ✅ <5s homepage load time

---

**Testing Status:** Comprehensive ✅  
**Next Review:** Monthly  
**Maintainer:** Your Team
