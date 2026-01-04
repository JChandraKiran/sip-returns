import { getPool } from "./lib/db.js";
import "dotenv/config";

async function checkDateRange() {
  try {
    const pool = getPool();

    console.log("🔍 Checking daily_prices date range...\n");

    // Check what dates exist for each token
    const query = `
      SELECT
        symbol,
        MIN(price_date) as min_date,
        MAX(price_date) as max_date,
        COUNT(*) as total
      FROM daily_prices
      WHERE symbol IN ('BTC', 'ETH', 'SOL')
      GROUP BY symbol
      ORDER BY symbol;
    `;

    const result = await pool.query(query);

    console.log("Symbol | Min Date   | Max Date   | Total Records");
    console.log("-------|------------|------------|---------------");
    result.rows.forEach(row => {
      console.log(`${row.symbol.padEnd(6)} | ${row.min_date} | ${row.max_date} | ${row.total}`);
    });

    console.log("\n🔍 Checking specific dates around Dec 10 - Jan 3...\n");

    // Check if Dec 10 - Jan 3 data exists
    const detailQuery = `
      SELECT symbol, price_date, price_usd
      FROM daily_prices
      WHERE symbol = 'BTC'
        AND price_date >= '2025-12-10'
        AND price_date <= '2026-01-03'
      ORDER BY price_date;
    `;

    const detailResult = await pool.query(detailQuery);

    if (detailResult.rows.length > 0) {
      console.log("BTC prices from Dec 10, 2025 to Jan 3, 2026:");
      console.log("Date       | Price USD");
      console.log("-----------|----------");
      detailResult.rows.forEach(row => {
        console.log(`${row.price_date} | $${row.price_usd.toFixed(2)}`);
      });
    } else {
      console.log("❌ No BTC data found for Dec 10 - Jan 3 range!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDateRange();