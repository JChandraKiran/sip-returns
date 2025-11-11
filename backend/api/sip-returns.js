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

  const { cryptocurrency, method, date, frequency, amount } = req.body;

  if (!cryptocurrency || !method || !date || !frequency || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const pool = getPool();

    // Example: symbol mapping
    const symbol = cryptocurrency.toUpperCase(); // crude 'BTC' from 'bitcoin'

    let query = `
      SELECT value, timestamp
      FROM btc
      WHERE symbol = ?
        AND DATE(timestamp) >= STR_TO_DATE(?, '%Y-%m-%d')
    `;

    // Apply frequency-based filter (simplified)
    if (frequency === "daily") {
      query = `
            SELECT DATE(timestamp) AS date, AVG(value) AS value
            FROM btc
            WHERE symbol = ?
                AND DATE(timestamp) >= STR_TO_DATE(?, '%Y-%m-%d')
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp)
            `;
    }

    const [rows] = await pool.execute(query, [symbol, date]);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found for given query" });
    }

    // Perform the SIP logic
    let totalUnits = 0;
    for (const row of rows) {
      totalUnits += amount / row.value;
    }
    const investedValue = rows.length * amount;
    const avgPrice = rows.reduce((sum, r) => sum + r.value, 0) / rows.length;

    res.status(200).json({
      cryptocurrency,
      frequency,
      dataPoints: rows.length,
      totalUnits,
      avgPrice,
      investedValue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
