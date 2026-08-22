# Dublin Events App - Deployment Guide

**Status:** Production Ready ✅  
**Version:** 1.0.0  
**Last Updated:** August 21, 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Railway Deployment](#railway-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Management](#database-management)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling & Performance](#scaling--performance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- **Node.js** 20+
- **Docker** 24+ and **Docker Compose** 2+
- **Git** for version control
- **PostgreSQL** 16+ (for local dev or via Docker)
- **Redis** 7+ (for job queue)

### Accounts Required for Production
- **Railway** (or alternative hosting platform)
- **GitHub** (for CI/CD integration)
- **Optional:** Sentry (error monitoring)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/dublin-events-app.git
cd dublin-events-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dublin_events"

# Redis for job queue
REDIS_URL="redis://localhost:6379"

# Environment
NODE_ENV="development"
LOG_LEVEL="DEBUG"

# Optional: Error Monitoring
# SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### 4. Run with Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Next.js)
docker-compose up

# Database setup happens automatically on first run
# App available at http://localhost:3000

# Seed test data (if needed)
docker-compose exec app npm run db:seed

# Stop services
docker-compose down
```

### 5. Or Manual Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Install Redis (macOS)
brew install redis
brew services start redis

# Setup database
npm run db:push
npm run db:generate

# Seed test data (optional)
npm run db:seed

# Start development server
npm run dev
```

Access at `http://localhost:3000`

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t dublin-events:latest .
```

### Run Docker Container

```bash
docker run -d \
  --name dublin-events-prod \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/db" \
  -e REDIS_URL="redis://redis-host:6379" \
  -e NODE_ENV="production" \
  dublin-events:latest
```

### Health Check

```bash
docker ps
# Should show container running

# Test health endpoint
curl http://localhost:3000/api/queue/health
```

### Container Logs

```bash
docker logs -f dublin-events-prod
```

---

## Railway Deployment

### 1. Prepare Repository

Ensure these files exist:
- `Dockerfile` ✅
- `.dockerignore` ✅
- `package.json` with build script ✅

### 2. Connect GitHub to Railway

1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub account
3. Import repository
4. Select `dublin-events-app`

### 3. Add Services

**PostgreSQL Database:**
- Click "Add Service" → PostgreSQL
- Railway auto-configures connection string
- No additional setup needed

**Redis Cache:**
- Click "Add Service" → Redis
- Railway auto-configures REDIS_URL

### 4. Configure Environment Variables

In Railway project settings:

```bash
DATABASE_URL=<Auto-populated by PostgreSQL service>
REDIS_URL=<Auto-populated by Redis service>
NODE_ENV=production
LOG_LEVEL=INFO
SENTRY_DSN=<optional>
```

### 5. Deploy

```bash
# Option A: Manual
- Push to GitHub main branch
- Railway auto-deploys

# Option B: CLI
railway up --service app
```

### 6. Run Migrations

```bash
# In Railway project
railway run npm run db:push
railway run npm run db:seed
```

### 7. Verify Deployment

1. Visit deployed URL (provided by Railway)
2. Test endpoints:

```bash
curl https://your-app.railway.app/api/events
curl https://your-app.railway.app/api/stats
curl https://your-app.railway.app/api/queue/health
```

---

## Environment Configuration

### Development Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dublin_events
REDIS_URL=redis://localhost:6379
NODE_ENV=development
LOG_LEVEL=DEBUG
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production Environment Variables

```bash
DATABASE_URL=postgresql://user:secure-password@prod-db.railway.app:5432/db
REDIS_URL=redis://:password@prod-redis.railway.app:6379
NODE_ENV=production
LOG_LEVEL=WARN
NEXT_PUBLIC_API_URL=https://dublin-events.app
SENTRY_DSN=https://key@sentry.io/project
```

### Optional: Scheduled Job Configuration

```bash
# Scraper scheduling
SCRAPER_CRON="0 2 * * *"           # Daily at 2 AM
SCRAPER_TIMEZONE="Europe/Dublin"
SCRAPER_DELAY_MIN=1000             # Min delay between requests
SCRAPER_DELAY_MAX=5000             # Max delay between requests

# Job queue
JOB_QUEUE_RETENTION_DAYS=7         # Keep job history for 7 days
MAX_CONCURRENT_JOBS=1              # Sequential scraping
```

---

## Database Management

### Initial Setup

```bash
# Create schema
npm run db:push

# Generate types
npm run db:generate

# Seed test data
npm run db:seed
```

### Backup Database

**Railway:**
```bash
# Via Railway dashboard
# Data → PostgreSQL → Backups → Create Backup

# Or CLI
railway data export
```

**Self-hosted PostgreSQL:**
```bash
pg_dump \
  postgresql://user:password@host:5432/dublin_events \
  > backup-$(date +%Y-%m-%d).sql

# Restore
psql -U user -h host -d dublin_events < backup.sql
```

### Database Migrations

When schema changes:

```bash
# Create migration
npx prisma migrate dev --name description

# Apply to production
npx prisma migrate deploy

# View migration history
npx prisma migrate status
```

### Query Optimization

Monitor slow queries:

```bash
# View Prisma query logs
# Set LOG_LEVEL=DEBUG in .env

# Database connection pooling
# Prisma handles automatically
# For large scale, consider PgBouncer
```

---

## Monitoring & Logging

### Application Logs

**Local:**
```bash
tail -f /var/log/dublin-events.log
```

**Docker:**
```bash
docker logs -f dublin-events-prod
```

**Railway:**
- Dashboard → Logs tab
- Real-time streaming
- Searchable history

### Error Monitoring (Sentry)

1. Sign up at [sentry.io](https://sentry.io)
2. Create project for Next.js
3. Add DSN to environment:

```bash
SENTRY_DSN=https://key@sentry.io/project
```

4. Errors automatically reported
5. View dashboard for error analytics

### Health Checks

Automated health monitoring endpoints:

```bash
# Queue health
curl https://dublin-events.app/api/queue/health

# Scraper sources status
curl https://dublin-events.app/api/sources

# System status
curl https://dublin-events.app/api/stats
```

### Alerts

Setup Railway alerts:
1. Project Settings → Alerts
2. Add metrics (CPU, Memory, Error Rate)
3. Set thresholds
4. Configure notifications (Email, Slack, etc.)

---

## Scaling & Performance

### Database Performance

- ✅ Indexes created on frequently queried columns
- ✅ Query optimization with Prisma
- ✅ Connection pooling enabled

**Monitor:**
```bash
# Check index usage
SELECT * FROM pg_stat_user_indexes;

# Long-running queries
SELECT * FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC;
```

### Application Performance

- ✅ Next.js static optimization
- ✅ Image optimization
- ✅ API response caching (via Redis)

**Improve:**
```bash
# Build analysis
npm run build:analyze

# Check bundle size
npm run build
# Review .next/static size
```

### Horizontal Scaling

For high traffic:

1. **Railway Pro** - Auto-scaling available
2. **Load Balancer** - Distribute traffic
3. **Database Replica** - Read replicas for reports
4. **Redis Cluster** - For distributed queue

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check PostgreSQL running
docker ps | grep postgres

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. Redis Connection Failed

**Error:** `Redis connection error: ECONNREFUSED`

**Solution:**
```bash
# Check Redis running
docker ps | grep redis

# Verify REDIS_URL
echo $REDIS_URL

# Test connection
redis-cli PING
```

#### 3. Build Failures

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### 4. Job Queue Not Processing

**Error:** Jobs stuck in "waiting" state

**Solution:**
```bash
# Restart queue
docker restart dublin-events-cache

# Check job processor logs
LOG_LEVEL=DEBUG npm run dev

# Manual job trigger
curl -X POST http://localhost:3000/api/jobs/scrape \
  -H "Content-Type: application/json" \
  -d '{"type":"full"}'
```

#### 5. Scraper Timeouts

**Error:** `ScrapingError: Timeout after 30000ms`

**Solution:**
```bash
# Increase timeouts in .env
SCRAPER_TIMEOUT=60000
PUPPETEER_TIMEOUT=60000

# Reduce concurrent scrapers
MAX_CONCURRENT_JOBS=1

# Check target websites
curl -I https://target-venue.ie
```

### Debug Mode

Enable detailed logging:

```bash
# Terminal 1: Start with debug logging
LOG_LEVEL=DEBUG npm run dev

# Terminal 2: Watch logs
tail -f ~/.pm2/logs/dublin-events-out.log

# Terminal 3: Database profiling
psql $DATABASE_URL -c "
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
  SET log_min_duration_statement = 100;
"
```

### Performance Profiling

```bash
# Node.js profiling
node --prof src/scrapers/runner.js
node --prof-process isolate-*.log > profile.txt

# Check hot paths
cat profile.txt | head -30
```

---

## Rollback Procedure

If deployment fails:

**Via Railway:**
1. Project → Deployments
2. Select previous successful deployment
3. Click "Redeploy"

**Via Docker:**
```bash
# Pull previous image
docker pull dublin-events:v1.0.0

# Stop current
docker stop dublin-events-prod

# Start previous
docker run -d --name dublin-events-prod dublin-events:v1.0.0
```

**Database Rollback:**
```bash
# View migrations
npx prisma migrate status

# Rollback to previous
npx prisma migrate resolve --rolled-back migration_name
```

---

## Success Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Test data seeded (or empty schema ready)
- [ ] Health checks passing
- [ ] Error monitoring configured
- [ ] Backups enabled
- [ ] Alerts configured
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Team trained on deployment

---

## Support & Maintenance

### Regular Maintenance

- **Daily:** Monitor logs and alerts
- **Weekly:** Review database performance
- **Monthly:** Update dependencies
- **Quarterly:** Security audit

### Getting Help

- **Railway Support:** help@railway.app
- **GitHub Issues:** bugs/feature requests
- **Documentation:** See README.md and API_DOCUMENTATION.md

---

**Deployment Status:** Ready for Production ✅  
**Next Review Date:** September 21, 2026  
**Contact:** your-email@example.com
