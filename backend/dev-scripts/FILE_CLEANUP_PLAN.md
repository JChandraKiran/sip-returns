# Backend File Cleanup Plan

## ✅ KEEP - Required for Deployment

### API Endpoints (Required)
- `api/dwmqReturns.js` - API endpoint for returns calculation
- `api/min-dates.js` - API endpoint for minimum dates
- `api/sip-returns.js` - API endpoint for SIP returns
- `api/test.js` - API test endpoint (could remove if not needed)

### Core Infrastructure (Required)
- `lib/db.js` - Database connection pool
- `lib/queries/priceQueries.js` - Database query functions
- `lib/queries/dummy.js` - Query helper (check if used)

### Scripts (Required for Vercel Cron)
- `scripts/fetch-prices.js` - Cron job to update current prices daily

### Configuration (Required)
- `package.json` - Dependencies
- `package-lock.json` - Dependency lock file
- `vercel.json` - Vercel deployment config
- `.env` - Environment variables (not deployed, only for local)
- `.vercel/project.json` - Vercel project config

---

## ❌ REMOVE - Development/One-time Use Scripts

### Database Setup Scripts (One-time use)
- `check-date-range.js` - Debug script to check date ranges
- `check-supabase-data.js` - Script to analyze database coverage
- `check-symbols.js` - Script to check symbols across tables
- `debug-insert.js` - Debug script for insert issues
- `fix-sequence.js` - One-time fix for sequence issues
- `test-supabase-connection.js` - Connection test script

### Data Population Scripts (One-time use)
- `update-current-prices.js` - One-time update of current prices
- `update-daily-prices.js` - One-time update of daily prices (Dec 10 - Jan 3)
- `update-hourly-prices.js` - One-time update of hourly prices (Nov 12 - Jan 3)
- `update-link-hourly.js` - One-time update for LINK hourly data
- `scripts/fetch-daily-prices.js` - Old/duplicate script (check if needed)

### Legacy/Unused Files
- `historical_prices.js` - Check if this is used anywhere

---

## 🤔 NEED TO VERIFY

### Files to Check
1. `api/test.js` - Is this needed in production?
2. `lib/queries/dummy.js` - Is this actually used?
3. `historical_prices.js` - What is this for?
4. `scripts/fetch-daily-prices.js` - Is this different from update-daily-prices.js?

---

## Recommended Actions

1. **Create a `dev-scripts/` folder** and move all one-time scripts there
2. **Add to .vercelignore** to prevent deploying dev scripts
3. **Keep scripts organized** for future database updates