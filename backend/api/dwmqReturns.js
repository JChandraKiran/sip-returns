import { getPool } from "../lib/db.js";

export default async function handler(req, res) {
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? "https://your-frontend-domain.vercel.app"
      : "http://localhost:5173";

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({
        error: "symbol is required",
      });
    }

    const pool = getPool();

    // Fetch all daily prices from inception to now
    const sql = `
      SELECT price_date, price_usd
      FROM daily_prices
      WHERE symbol = $1
      ORDER BY price_date ASC
    `;
    const result = await pool.query(sql, [symbol.toUpperCase()]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "No data found for this symbol" });
    }

    const rows = result.rows;

    // Calculate returns for all frequencies
    const monthlyReturns = calculateMonthlyReturns(rows);
    const quarterlyReturns = calculateQuarterlyReturns(rows);
    const weeklyReturns = calculateWeeklyReturns(rows);

    return res.status(200).json({
      symbol: symbol.toUpperCase(),
      monthly: monthlyReturns,
      quarterly: quarterlyReturns,
      weekly: weeklyReturns,
    });
  } catch (err) {
    console.error("Error in /api/dwmqReturns:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to calculate monthly returns
function calculateMonthlyReturns(rows) {
  const monthlyData = {};

  // Group by year and month
  const grouped = {};
  rows.forEach((row) => {
    const date = new Date(row.price_date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    const key = `${year}-${month}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  // Calculate returns for each month
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  Object.keys(grouped).forEach((key) => {
    const [year, month] = key.split("-");
    const monthPrices = grouped[key];

    if (monthPrices.length > 0) {
      const startPrice = monthPrices[0].price_usd;
      const endPrice = monthPrices[monthPrices.length - 1].price_usd;
      const returnPct = ((endPrice - startPrice) / startPrice) * 100;

      if (!monthlyData[year]) {
        monthlyData[year] = {};
      }

      monthlyData[year][monthNames[parseInt(month)]] = parseFloat(
        returnPct.toFixed(2)
      );
    }
  });

  return monthlyData;
}

// Helper function to calculate quarterly returns
function calculateQuarterlyReturns(rows) {
  const quarterlyData = {};

  // Group by year and quarter
  const grouped = {};
  rows.forEach((row) => {
    const date = new Date(row.price_date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const quarter = Math.floor(month / 3); // 0-3

    const key = `${year}-Q${quarter + 1}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  // Calculate returns for each quarter
  Object.keys(grouped).forEach((key) => {
    const [year, quarter] = key.split("-");
    const quarterPrices = grouped[key];

    if (quarterPrices.length > 0) {
      const startPrice = quarterPrices[0].price_usd;
      const endPrice = quarterPrices[quarterPrices.length - 1].price_usd;
      const returnPct = ((endPrice - startPrice) / startPrice) * 100;

      if (!quarterlyData[year]) {
        quarterlyData[year] = {};
      }

      quarterlyData[year][quarter] = parseFloat(returnPct.toFixed(2));
    }
  });

  return quarterlyData;
}

// Helper function to calculate weekly returns
function calculateWeeklyReturns(rows) {
  const weeklyData = {};

  // Group by year and week
  const grouped = {};
  rows.forEach((row) => {
    const date = new Date(row.price_date);
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);

    const key = `${year}-W${weekNum}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  // Calculate returns for each week
  Object.keys(grouped).forEach((key) => {
    const [year, week] = key.split("-");
    const weekPrices = grouped[key];

    if (weekPrices.length > 0) {
      const startPrice = weekPrices[0].price_usd;
      const endPrice = weekPrices[weekPrices.length - 1].price_usd;
      const returnPct = ((endPrice - startPrice) / startPrice) * 100;

      if (!weeklyData[year]) {
        weeklyData[year] = {};
      }

      weeklyData[year][week] = parseFloat(returnPct.toFixed(2));
    }
  });

  return weeklyData;
}

// Helper function to get ISO week number
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNum;
}
