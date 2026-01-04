import { getPool } from "./lib/db.js";
import "dotenv/config";

async function debugInsert() {
  try {
    const pool = getPool();

    // Try to insert one test record for Dec 10
    const testDate = "2025-12-10";
    const testSymbol = "BTC";
    const testPrice = 99999.99;

    console.log("🧪 Testing insert for:", testSymbol, testDate, testPrice);

    try {
      const insertQuery = `
        INSERT INTO daily_prices (symbol, price_usd, price_date)
        VALUES ($1, $2, $3)
        RETURNING id, symbol, price_date, price_usd;
      `;
      const result = await pool.query(insertQuery, [testSymbol, testPrice, testDate]);
      console.log("✅ Insert successful!");
      console.log("Inserted record:", result.rows[0]);

      // Now check if it exists
      const checkQuery = `
        SELECT * FROM daily_prices
        WHERE symbol = $1 AND price_date = $2;
      `;
      const checkResult = await pool.query(checkQuery, [testSymbol, testDate]);
      console.log("\n📊 Record in database:", checkResult.rows[0]);

      // Delete the test record
      await pool.query("DELETE FROM daily_prices WHERE id = $1", [result.rows[0].id]);
      console.log("\n🗑️  Test record deleted");

    } catch (err) {
      console.error("❌ Insert failed!");
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error detail:", err.detail);

      // Check what exists for that date
      const checkQuery = `
        SELECT * FROM daily_prices
        WHERE symbol = $1 AND price_date = $2;
      `;
      const checkResult = await pool.query(checkQuery, [testSymbol, testDate]);

      if (checkResult.rows.length > 0) {
        console.log("\n📊 Existing record found:");
        console.log(checkResult.rows[0]);
      } else {
        console.log("\n❓ No existing record found - this is strange!");
      }
    }

    // Also check the actual count for Dec 10 - Jan 3
    const countQuery = `
      SELECT COUNT(*) as count
      FROM daily_prices
      WHERE symbol = 'BTC'
        AND price_date >= '2025-12-10'
        AND price_date <= '2026-01-03';
    `;
    const countResult = await pool.query(countQuery);
    console.log(`\n📈 Total BTC records between Dec 10 - Jan 3: ${countResult.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

debugInsert();