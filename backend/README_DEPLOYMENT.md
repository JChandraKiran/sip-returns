# Backend Deployment Structure

## 📁 Files Being Deployed (Production)

### API Endpoints
- `api/dwmqReturns.js` - Returns calculation for different frequencies (daily/weekly/monthly/quarterly)
- `api/min-dates.js` - Minimum available dates for each token (hourly vs daily)
- `api/sip-returns.js` - SIP returns calculation
- `api/test.js` - Simple test endpoint to verify deployment
- `api/fetch-prices.js` - Cron job endpoint to update all prices daily

### Core Infrastructure
- `lib/db.js` - PostgreSQL connection pool (Supabase)
- `lib/queries/priceQueries.js` - Database query functions

### Configuration
- `package.json` - Dependencies
- `package-lock.json` - Lock file
- `vercel.json` - Vercel deployment config with cron schedule
- `.vercelignore` - Files to exclude from deployment

---

## 🗂️ Development Scripts (NOT Deployed)

All development and one-time scripts moved to `dev-scripts/` folder:

### Database Analysis Tools
- `check-supabase-data.js` - Check database data coverage and gaps
- `check-symbols.js` - Verify symbols across all tables
- `check-date-range.js` - Check date ranges

### Database Fix Scripts
- `fix-sequence.js` - Fix PostgreSQL sequences after CSV import
- `debug-insert.js` - Debug insert issues

### One-Time Data Population
- `update-daily-prices.js` - Populate missing daily prices
- `update-hourly-prices.js` - Populate missing hourly prices
- `update-link-hourly.js` - Populate LINK hourly data
- `update-current-prices.js` - One-time current prices update

### Legacy/Testing
- `historical_prices.js` - Old script for fetching historical data
- `fetch-daily-prices.js` - Old daily prices script
- `test-supabase-connection.js` - Connection test

---

## 🚀 Deployment Checklist

Before deploying:
- [x] Database fully populated and up to date
- [x] All 11 tokens present in all 3 tables
- [x] Environment variables ready (.env contains Supabase credentials)
- [x] Development scripts moved to dev-scripts/
- [x] .vercelignore configured to exclude dev files
- [ ] Deploy backend: `vercel --prod`
- [ ] Verify cron job in Vercel dashboard
- [ ] Test API endpoints

---

## 📝 Environment Variables Needed in Vercel

When deploying, add these environment variables in Vercel dashboard:

```
PG_HOST=aws-1-ap-south-1.pooler.supabase.com
PG_USER=postgres.zkfyqusvwnfkysqojqaz
PG_PASS=DCA@2025kiran
PG_NAME=postgres
PG_PORT=6543
ALCHEMY_API_KEY=21QGlZ9620ld2erifQ0M5g5Ewuho6XJ6
```

---

## 🔄 Daily Cron Job

Vercel will automatically run `/api/fetch-prices` daily at midnight (00:00 UTC) to update:
- **current_prices**: Latest real-time price for all 11 tokens
- **daily_prices**: Yesterday's daily price for all 11 tokens (1 record per token)
- **prices**: Yesterday's hourly prices for all 11 tokens (~24 records per token)

---

## 📊 Database Tables

- **current_prices**: Latest price for each token (11 records)
- **daily_prices**: Daily historical prices (varies per token, going back years)
- **prices**: Hourly historical prices (last ~3 years for most tokens)

All tokens: BTC, ETH, SOL, BNB, ADA, XRP, DOGE, LTC, BCH, TRX, LINK