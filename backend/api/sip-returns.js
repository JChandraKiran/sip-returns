// api/sip-returns.js
import { getPool } from "../lib/db.js";

export default async function handler(req, res) {
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? "https://your-frontend-domain.vercel.app"
      : "http://localhost:5173";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cryptocurrency, method, fromDate, toDate, frequency, amount } =
    req.body;
  console.log(frequency);
  if (
    !cryptocurrency ||
    !method ||
    !fromDate ||
    !toDate ||
    !frequency ||
    !amount
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const pool = getPool();

    // Example: symbol mapping
    const symbol = cryptocurrency.toUpperCase(); // crude 'BTC' from 'btc'

    let query = `
      SELECT value, timestamp
      FROM prices
      WHERE symbol = ?
        AND DATE(timestamp) >= ?
        AND DATE(timestamp) <= ?
    `;
    let queryParams = [symbol, fromDate, toDate];

    // Apply frequency-based filter
    if (frequency.toLowerCase() === "daily") {
      query = `SELECT
                  DATE(p.timestamp) AS date,
                  p.value AS value
              FROM prices p
              JOIN (
                  SELECT
                      symbol,
                      DATE(timestamp) AS d,
                      MAX(timestamp) AS max_ts
                  FROM prices
                  WHERE symbol = ?
                    AND DATE(timestamp) >= ?
                    AND DATE(timestamp) <= ?
                  GROUP BY symbol, DATE(timestamp)
              ) t
                ON t.max_ts = p.timestamp
                AND p.symbol = t.symbol
              WHERE p.symbol = ?
                AND DATE(p.timestamp) >= ?
                AND DATE(p.timestamp) <= ?
              ORDER BY date;
                `;
      queryParams = [symbol, fromDate, toDate, symbol, fromDate, toDate];
    } else if (frequency.toLowerCase() === "10 days") {
      query = `
                SELECT
                  DATE(p.timestamp) AS the_day,
                  p.value AS value,
                  p.timestamp AS date
                FROM prices p
                WHERE p.symbol = ?
                  AND DATE(p.timestamp) >= ?
                  AND DATE(p.timestamp) <= ?
                  AND p.timestamp = (
                    SELECT MAX(p2.timestamp)
                    FROM prices p2
                    WHERE p2.symbol = p.symbol
                      AND DATE(p2.timestamp) = DATE(p.timestamp)
                  )
                  AND MOD(DATEDIFF(DATE(p.timestamp), ?), 10) = 0
                ORDER BY DATE(p.timestamp);
              `;
      queryParams = [symbol, fromDate, toDate, fromDate];
    }
    console.log("SQL:", query);
    console.log("PARAMS:", queryParams);
    const [rows] = await pool.execute(query, queryParams);
    console.log(rows);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found for given query" });
    }

    // Fetch daily prices for charting (regardless of investment frequency)
    const dailyPriceQuery = `SELECT
                  DATE(p.timestamp) AS date,
                  p.value AS value,
                  p.timestamp
              FROM prices p
              JOIN (
                  SELECT
                      symbol,
                      DATE(timestamp) AS d,
                      MAX(timestamp) AS max_ts
                  FROM prices
                  WHERE symbol = ?
                    AND DATE(timestamp) >= ?
                    AND DATE(timestamp) <= ?
                  GROUP BY symbol, DATE(timestamp)
              ) t
                ON t.max_ts = p.timestamp
                AND p.symbol = t.symbol
              WHERE p.symbol = ?
                AND DATE(p.timestamp) >= ?
                AND DATE(p.timestamp) <= ?
              ORDER BY date;`;
    const [dailyPrices] = await pool.execute(dailyPriceQuery, [symbol, fromDate, toDate, symbol, fromDate, toDate]);

    // Perform the SIP logic on investment dates
    let totalUnits = 0;
    let totalValue = 0;
    let cumulativeInvested = 0;

    // Create a map of investment dates for quick lookup
    const investmentDates = new Set();
    for (const row of rows) {
      const investDate = new Date(row.timestamp || row.date || row.the_day).toISOString().split('T')[0];
      investmentDates.add(investDate);
      totalUnits += amount / row.value;
      totalValue += row.value;
      cumulativeInvested += amount;
    }

    // Generate chart data with daily prices but investment-based portfolio calculation
    const chartData = [];
    let runningUnits = 0;
    let runningInvested = 0;

    for (const dailyPrice of dailyPrices) {
      const priceDate = new Date(dailyPrice.timestamp || dailyPrice.date).toISOString().split('T')[0];

      // Check if investment happens on this date
      if (investmentDates.has(priceDate)) {
        runningUnits += amount / dailyPrice.value;
        runningInvested += amount;
      }

      chartData.push({
        timestamp: dailyPrice.timestamp || dailyPrice.date,
        price: dailyPrice.value,
        totalUnits: runningUnits,
        investedValue: runningInvested,
        portfolioValue: runningUnits * dailyPrice.value
      });
    }

    const investedValue = rows.length * amount;
    const avgPrice = totalValue / rows.length;

    let currentPriceQuery = `SELECT value FROM current_prices WHERE symbol=?`;
    const [currentPriceRows] = await pool.execute(currentPriceQuery, [symbol]);
    const currentValue = totalUnits * currentPriceRows[0].value;

    res.status(200).json({
      cryptocurrency,
      frequency,
      rows,
      dataPoints: rows.length,
      totalUnits,
      avgPrice,
      investedValue,
      currentValue,
      chartData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, sql: err.sql || null });
  }
}
