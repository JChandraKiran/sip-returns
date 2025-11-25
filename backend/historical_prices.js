// fetch_and_store_prices.js
import mysql from "mysql2/promise";

// 🔑 Alchemy API Key
const ALCHEMY_API_KEY = "21QGlZ9620ld2erifQ0M5g5Ewuho6XJ6"; // Replace this
const API_URL = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`;

// 🧩 MySQL Connection Config
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "FRACAS@22",
  database: "prices",
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

// 🗄️ Ensure MySQL table exists
async function ensureTableExists(connection) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS prices (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      symbol VARCHAR(20),
      value DOUBLE,
      timestamp DATETIME,
      UNIQUE KEY unique_symbol_timestamp (symbol, timestamp)
    )
  `;
  await connection.execute(createTableQuery);
}

// 💾 Insert a batch of rows into MySQL
async function insertPrices(connection, data, symbol) {
  const insertQuery = `
    INSERT IGNORE INTO prices (symbol, value, timestamp)
    VALUES (?, ?, ?)
  `;

  for (const entry of data) {
    // Round to 5 decimal places
    const value = parseFloat(parseFloat(entry.value).toFixed(5));
    const timestamp = new Date(entry.timestamp)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await connection.execute(insertQuery, [symbol, value, timestamp]);
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
  const connection = await mysql.createConnection(dbConfig);
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
      console.log(`✅ Inserted ${data.length} rows into MySQL`);
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
