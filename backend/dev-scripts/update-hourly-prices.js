import { getPool } from "./lib/db.js";
import dotenv from "dotenv";

dotenv.config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Tokens to update
const TOKENS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "LTC", "BCH", "TRX"];

// Date range - split into 30-day chunks (Alchemy 1h interval limit)
const START_DATE = new Date("2025-11-12T00:00:00.000Z");

// Get yesterday's date (don't fetch today's data - will be fetched by cron)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setUTCHours(23, 59, 0, 0);
const END_DATE = yesterday;

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Calculate days between dates
function daysBetween(start, end) {
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function toISOStringNoMs(date) {
  return date.toISOString().split(".")[0] + "Z";
}

async function fetchBatch(symbol, startTime, endTime) {
  const response = await fetch(
    `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        startTime: toISOStringNoMs(startTime),
        endTime: toISOStringNoMs(endTime),
        interval: "1h",
      }),
    }
  );

  const json = await response.json();

  if (json.error) {
    console.error(`   ❌ API Error: ${json.error.message}`);
    return [];
  }

  return json.data || [];
}

async function insertPrices(symbol, data) {
  const pool = getPool();
  const insertQuery = `
    INSERT INTO prices (symbol, value, timestamp)
    VALUES ($1, $2, $3)
    ON CONFLICT (symbol, timestamp) DO UPDATE
    SET value = EXCLUDED.value
  `;

  for (const entry of data) {
    const value = parseFloat(parseFloat(entry.value).toFixed(5));
    const timestamp = new Date(entry.timestamp).toISOString();
    await pool.query(insertQuery, [symbol, value, timestamp]);
  }
}

async function updateToken(symbol) {
  console.log(`\n📦 Updating ${symbol} hourly prices...`);
  const totalDays = daysBetween(START_DATE, END_DATE);
  console.log(`   Period: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]} (${totalDays} days)`);

  let currentStart = START_DATE;
  let batchCount = 1;
  let totalRecords = 0;

  while (currentStart < END_DATE) {
    // Alchemy limit: max 30 days for 1h interval
    const daysRemaining = daysBetween(currentStart, END_DATE);
    const daysToFetch = Math.min(29, daysRemaining); // Use 29 to be safe

    const currentEnd = addDays(currentStart, daysToFetch);
    const actualEnd = currentEnd > END_DATE ? END_DATE : currentEnd;

    const batchDays = daysBetween(currentStart, actualEnd);
    console.log(`   Batch ${batchCount}: ${toISOStringNoMs(currentStart).split('T')[0]} → ${toISOStringNoMs(actualEnd).split('T')[0]} (${batchDays} days)`);

    const data = await fetchBatch(symbol, currentStart, actualEnd);

    if (data.length > 0) {
      await insertPrices(symbol, data);
      totalRecords += data.length;
      console.log(`   ✅ Inserted ${data.length} records`);
    } else {
      console.log(`   ⚠️  No data for this batch`);
    }

    currentStart = addDays(actualEnd, 1); // Move to next day after batch end
    batchCount++;

    // Delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`   ✅ Total: ${totalRecords} records inserted for ${symbol}`);
}

async function runAll() {
  console.log("🚀 Updating Hourly Prices");
  console.log("=".repeat(60));
  console.log(`Date Range: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);
  console.log(`Tokens: ${TOKENS.join(", ")}`);
  console.log("=".repeat(60));

  for (const token of TOKENS) {
    await updateToken(token);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Hourly prices update completed!");
  console.log("=".repeat(60));
  process.exit(0);
}

runAll().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});