import { getPool } from "./lib/db.js";
import dotenv from "dotenv";

dotenv.config();
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Tokens to update
const TOKENS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "LTC", "BCH", "TRX", "LINK"];

// Date range to fetch (missing data)
const START_DATE = "2025-12-10T00:00:00.000Z"; // Day after last data

// Get yesterday's date
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setUTCHours(23, 59, 0, 0);
const END_DATE = yesterday.toISOString();

async function fetchAndSave(symbol, start, end) {
  try {
    console.log(`\n📦 Fetching ${symbol} from ${start.split('T')[0]} to ${end.split('T')[0]}...`);

    const response = await fetch(
      `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          startTime: start,
          endTime: end,
          interval: "1d",
          withMarketData: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data?.data?.length) {
      console.log(`   ⚠️  No data returned for ${symbol}`);
      return;
    }

    const pool = getPool();

    let insertCount = 0;
    let skipCount = 0;

    for (const row of data.data) {
      try {
        // Try to insert each record individually
        const insertQuery = `
          INSERT INTO daily_prices (symbol, price_usd, price_date)
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertQuery, [symbol, row.value, row.timestamp]);
        insertCount++;
      } catch (err) {
        // If it already exists, skip it
        if (err.code === '23505') { // Unique violation error code
          skipCount++;
        } else {
          throw err; // Re-throw if it's a different error
        }
      }
    }

    console.log(`   ✅ Processed ${data.data.length} records for ${symbol} (${insertCount} new, ${skipCount} skipped)`);
  } catch (err) {
    console.error(`   ❌ Error for ${symbol}:`, err.message);
  }
}

async function runAll() {
  console.log("🚀 Updating Daily Prices");
  console.log("=".repeat(60));
  console.log(`Date Range: ${START_DATE.split('T')[0]} to ${END_DATE.split('T')[0]}`);
  console.log(`Tokens: ${TOKENS.join(", ")}`);
  console.log("=".repeat(60));

  for (const token of TOKENS) {
    await fetchAndSave(token, START_DATE, END_DATE);
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Daily prices update completed!");
  console.log("=".repeat(60));
  process.exit(0);
}

runAll().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});