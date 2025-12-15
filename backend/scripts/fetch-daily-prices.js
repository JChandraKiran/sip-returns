import { getPool } from "../lib/db.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY; // your key here

async function fetchAndSave(symbol, start, end) {
  try {
    // API request
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

    // Check if response is ok before parsing
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log(data);
    if (!data?.data?.length) return console.log("No price data returned.");

    // MySQL connection
    const pool = getPool();

    // Insert into DB
    const insertQuery = `INSERT IGNORE INTO daily_prices (symbol, price_usd, price_date) VALUES (?, ?, ?)`;

    let insertCount = 0;
    for (const row of data.data) {
      let price = row.value;
      let time = row.timestamp;

      await pool.execute(insertQuery, [symbol, price, time]);
      insertCount++;
    }

    console.log(`Stored ${insertCount} records for ${symbol}.`);
    // await pool.end();
  } catch (err) {
    console.log("Error:", err);
  }
}

// Example usage - run sequentially with async/await
async function runAll() {
  await fetchAndSave(
    "LTC",
    "2013-01-01T00:00:00.000Z",
    "2013-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2014-01-01T00:00:00.000Z",
    "2014-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2015-01-01T00:00:00.000Z",
    "2015-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2016-01-01T00:00:00.000Z",
    "2016-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2017-01-01T00:00:00.000Z",
    "2017-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2018-01-01T00:00:00.000Z",
    "2018-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2019-01-01T00:00:00.000Z",
    "2019-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2020-01-01T00:00:00.000Z",
    "2020-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2021-01-01T00:00:00.000Z",
    "2021-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2022-01-01T00:00:00.000Z",
    "2022-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2023-01-01T00:00:00.000Z",
    "2023-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2024-01-01T00:00:00.000Z",
    "2024-12-31T23:59:00.000Z"
  );
  await fetchAndSave(
    "LTC",
    "2025-01-01T00:00:00.000Z",
    "2025-12-31T23:59:00.000Z"
  );

  console.log("All data fetched successfully!");
  process.exit(0);
}

runAll();
