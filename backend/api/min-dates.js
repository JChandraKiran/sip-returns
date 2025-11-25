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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const pool = getPool();

    const query = `
    SELECT symbol, MIN(timestamp) AS min_date
    FROM prices
    GROUP BY symbol
    ORDER BY symbol
  `;

    const [rows] = await pool.execute(query);
    if (!rows.length) {
      return res.status(404).json({ error: "No data found for given query" });
    }

    // Transform array to object: { btc: '2019-11-01', eth: '2020-01-15', ... }
    const minDatesObject = rows.reduce((acc, row) => {
      acc[row.symbol] = row.min_date;
      return acc;
    }, {});

    res.status(200).json(minDatesObject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
