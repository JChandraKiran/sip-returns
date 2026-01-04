// fetch_and_store_prices.js
import pkg from 'pg';
const { Client } = pkg;
import dotenv from "dotenv";

dotenv.config();

// 🔑 Alchemy API Key
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "21QGlZ9620ld2erifQ0M5g5Ewuho6XJ6";
const API_URL = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`;

// 🧩 PostgreSQL Connection Config
const dbConfig = {
  host: process.env.PG_HOST || "localhost",
  user: process.env.PG_USER || "dcauser",
  password: process.env.PG_PASS || "kiran@0205",
  database: process.env.PG_NAME || "dca",
  port: process.env.PG_PORT || 5432,
};

// 📊 Token and interval
const symbol = "LTC";
const interval = "1h";

// 🕒 Date range
const startDate = new Date("2018-01-01T00:00:00Z");

// ✅ Set end date to end of last month
const now = new Date();
const endOfLastMonth = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59)
);

// 🧮 Helper: add days to ISO date
function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// 🧮 Helper: format date to ISO string (no ms)
function toISOStringNoMs(date) {
  return date.toISOString().split(".")[0] + "Z";
}

// 🗄️ Ensure PostgreSQL table exists
async function ensureTableExists(connection) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20),
      value DOUBLE PRECISION,
      timestamp TIMESTAMP,
      UNIQUE (symbol, timestamp)
    )
  `;
  await connection.query(createTableQuery);
}

// 💾 Insert a batch of rows into PostgreSQL
async function insertPrices(connection, data, symbol) {
  const insertQuery = `
    INSERT INTO prices (symbol, value, timestamp)
    VALUES ($1, $2, $3)
    ON CONFLICT (symbol, timestamp) DO NOTHING
  `;

  for (const entry of data) {
    // Round to 5 decimal places
    const value = parseFloat(parseFloat(entry.value).toFixed(5));
    const timestamp = new Date(entry.timestamp).toISOString();
    await connection.query(insertQuery, [symbol, value, timestamp]);
  }
}

// 🔁 Fetch one 30-day batch
async function fetchBatch(startTime, endTime) {
  const body = JSON.stringify({
    symbol,
    startTime: toISOStringNoMs(startTime),
    endTime: toISOStringNoMs(endTime),
    interval,
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const json = await response.json();

  if (json.error) {
    console.error(`❌ API Error: ${json.error.message}`);
    return [];
  }

  return json.data || [];
}

// 🧠 Main function
async function main() {
  const connection = new pkg.Client(dbConfig);
  await connection.connect();
  await ensureTableExists(connection);

  console.log(
    `📡 Fetching ${symbol} 1-hour prices from 2018 → ${endOfLastMonth
      .toISOString()
      .slice(0, 10)}...`
  );
  let currentStart = startDate;
  let batchCount = 1;

  while (currentStart < endOfLastMonth) {
    const currentEnd = addDays(currentStart, 30);
    console.log(
      `\n📅 Batch ${batchCount}: ${toISOStringNoMs(
        currentStart
      )} → ${toISOStringNoMs(currentEnd)}`
    );

    const data = await fetchBatch(currentStart, currentEnd);

    if (data.length > 0) {
      await insertPrices(connection, data, symbol);
      console.log(`✅ Inserted ${data.length} rows into PostgreSQL`);
    } else {
      console.log(`⚠️ No data returned for this batch`);
    }

    // Move to next 30 days
    currentStart = currentEnd;
    batchCount++;

    // Optional delay to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n🎉 All data fetched and stored successfully!");
  await connection.end();
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
});
