import { getPool } from "./lib/db.js";
import "dotenv/config";

async function testConnection() {
  try {
    console.log("🔌 Testing Supabase connection...");
    console.log(`Host: ${process.env.PG_HOST}`);
    console.log(`Database: ${process.env.PG_NAME}`);
    console.log(`User: ${process.env.PG_USER}`);
    console.log("");

    const pool = getPool();

    // Test basic connection
    console.log("1️⃣ Testing basic connection...");
    const versionResult = await pool.query("SELECT version()");
    console.log("✅ Connection successful!");
    console.log(`   PostgreSQL version: ${versionResult.rows[0].version.split(" ")[1]}`);
    console.log("");

    // Test table access - prices
    console.log("2️⃣ Testing prices table...");
    const pricesCount = await pool.query("SELECT COUNT(*) FROM prices");
    console.log(`✅ Prices table: ${pricesCount.rows[0].count} records`);

    const pricesMinMax = await pool.query(`
      SELECT
        symbol,
        MIN(timestamp) as min_date,
        MAX(timestamp) as max_date,
        COUNT(*) as count
      FROM prices
      GROUP BY symbol
      ORDER BY symbol
    `);
    console.log("   Hourly data by symbol:");
    pricesMinMax.rows.forEach((row) => {
      console.log(
        `   - ${row.symbol}: ${row.count} records (${row.min_date
          .toISOString()
          .split("T")[0]} to ${row.max_date.toISOString().split("T")[0]})`
      );
    });
    console.log("");

    // Test table access - daily_prices
    console.log("3️⃣ Testing daily_prices table...");
    const dailyCount = await pool.query("SELECT COUNT(*) FROM daily_prices");
    console.log(`✅ Daily prices table: ${dailyCount.rows[0].count} records`);

    const dailyMinMax = await pool.query(`
      SELECT
        symbol,
        MIN(price_date) as min_date,
        MAX(price_date) as max_date,
        COUNT(*) as count
      FROM daily_prices
      GROUP BY symbol
      ORDER BY symbol
    `);
    console.log("   Daily data by symbol:");
    dailyMinMax.rows.forEach((row) => {
      console.log(
        `   - ${row.symbol}: ${row.count} records (${row.min_date} to ${row.max_date})`
      );
    });
    console.log("");

    // Test table access - current_prices
    console.log("4️⃣ Testing current_prices table...");
    const currentPrices = await pool.query(
      "SELECT * FROM current_prices ORDER BY symbol"
    );
    console.log(`✅ Current prices table: ${currentPrices.rows.length} records`);
    currentPrices.rows.forEach((row) => {
      console.log(
        `   - ${row.symbol}: $${parseFloat(row.price_usd).toFixed(2)} (updated: ${new Date(
          row.last_updated
        ).toLocaleString()})`
      );
    });
    console.log("");

    console.log("🎉 All tests passed! Supabase connection is working perfectly!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Test your API endpoints");
    console.log("2. Update frontend if needed");
    console.log("3. Deploy to production");

    process.exit(0);
  } catch (error) {
    console.error("❌ Connection test failed!");
    console.error("Error:", error.message);
    console.error("");
    console.error("Troubleshooting:");
    console.error("1. Check .env file has correct Supabase credentials");
    console.error("2. Verify PG_HOST, PG_USER, PG_PASS are correct");
    console.error("3. Check if data was imported successfully in Supabase dashboard");
    console.error("4. Try disabling VPN or firewall temporarily");
    process.exit(1);
  }
}

testConnection();
