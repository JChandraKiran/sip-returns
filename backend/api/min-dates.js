import { getPool } from "../lib/db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const pool = getPool();

    // Get min dates from hourly prices table
    const hourlyQuery = `
      SELECT symbol, MIN(timestamp) AS min_date
      FROM prices
      GROUP BY symbol
      ORDER BY symbol
    `;

    // Get min dates from daily prices table
    const dailyQuery = `
      SELECT symbol, MIN(price_date) AS min_date
      FROM daily_prices
      GROUP BY symbol
      ORDER BY symbol
    `;

    const [hourlyResult, dailyResult] = await Promise.all([
      pool.query(hourlyQuery),
      pool.query(dailyQuery),
    ]);

    // Transform to nested object structure
    const minDatesObject = {};

    // Process hourly prices
    hourlyResult.rows.forEach((row) => {
      if (!minDatesObject[row.symbol]) {
        minDatesObject[row.symbol] = {};
      }
      minDatesObject[row.symbol].hourly = row.min_date;
    });

    // Process daily prices
    dailyResult.rows.forEach((row) => {
      if (!minDatesObject[row.symbol]) {
        minDatesObject[row.symbol] = {};
      }
      minDatesObject[row.symbol].daily = row.min_date;
    });

    if (Object.keys(minDatesObject).length === 0) {
      return res.status(404).json({ error: "No data found for given query" });
    }

    res.status(200).json(minDatesObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
