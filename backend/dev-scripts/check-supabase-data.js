import { getPool } from "./lib/db.js";
import "dotenv/config";

async function checkSupabaseData() {
  try {
    console.log("📊 Checking Supabase Database Data Coverage");
    console.log("=".repeat(80));
    console.log("");

    const pool = getPool();

    // Get table list
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows.map((r) => r.table_name);

    console.log("📋 Tables found:", tables.join(", "));
    console.log("");

    // Check each table
    for (const table of tables) {
      console.log(`\n📦 Table: ${table.toUpperCase()}`);
      console.log("-".repeat(80));

      // Get table structure
      const columnsQuery = `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;
      const columnsResult = await pool.query(columnsQuery, [table]);
      const columns = columnsResult.rows;

      // Identify date/timestamp column
      let dateColumn = null;
      if (columns.find((c) => c.column_name === "timestamp")) {
        dateColumn = "timestamp";
      } else if (columns.find((c) => c.column_name === "price_date")) {
        dateColumn = "price_date";
      } else if (columns.find((c) => c.column_name === "last_updated")) {
        dateColumn = "last_updated";
      }

      // Check if there's a symbol column
      const hasSymbol = columns.find((c) => c.column_name === "symbol");

      if (hasSymbol) {
        // Group by symbol
        const dataQuery = `
          SELECT
            symbol,
            COUNT(*) as total_records,
            MIN(${dateColumn}) as start_date,
            MAX(${dateColumn}) as end_date,
            MIN(${dateColumn})::date as start_date_only,
            MAX(${dateColumn})::date as end_date_only
          FROM ${table}
          GROUP BY symbol
          ORDER BY symbol;
        `;
        const dataResult = await pool.query(dataQuery);

        if (dataResult.rows.length === 0) {
          console.log("   ⚠️  No data found in this table");
        } else {
          console.log(
            `   Symbol | Records  | Start Date   | End Date     | Days Covered`
          );
          console.log(
            `   ${"─".repeat(6)} | ${"─".repeat(8)} | ${"─".repeat(12)} | ${"─".repeat(
              12
            )} | ${"─".repeat(12)}`
          );

          dataResult.rows.forEach((row) => {
            const startDate = row.start_date_only || row.start_date;
            const endDate = row.end_date_only || row.end_date;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysCovered = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            console.log(
              `   ${row.symbol.padEnd(6)} | ${String(row.total_records).padStart(
                8
              )} | ${startDate.toString().slice(0, 10)} | ${endDate
                .toString()
                .slice(0, 10)} | ${String(daysCovered).padStart(12)}`
            );
          });
        }
      } else {
        // No symbol column - just overall stats
        const dataQuery = `
          SELECT
            COUNT(*) as total_records,
            MIN(${dateColumn}) as start_date,
            MAX(${dateColumn}) as end_date
          FROM ${table};
        `;
        const dataResult = await pool.query(dataQuery);
        const row = dataResult.rows[0];

        if (row.total_records === "0") {
          console.log("   ⚠️  No data found in this table");
        } else {
          console.log(`   Total Records: ${row.total_records}`);
          console.log(`   Start Date: ${row.start_date}`);
          console.log(`   End Date: ${row.end_date}`);
        }
      }
    }

    console.log("");
    console.log("=".repeat(80));
    console.log("");

    // Summary and recommendations
    console.log("📈 DATA GAP ANALYSIS");
    console.log("=".repeat(80));

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    console.log(`Current Date: ${todayStr}`);
    console.log("");

    // Check prices table (hourly)
    const pricesCheck = await pool.query(`
      SELECT
        symbol,
        MAX(timestamp)::date as last_date,
        EXTRACT(DAY FROM NOW() - MAX(timestamp)) as days_behind
      FROM prices
      GROUP BY symbol
      ORDER BY symbol;
    `);

    console.log("🔴 HOURLY PRICES (prices table):");
    console.log("-".repeat(80));
    if (pricesCheck.rows.length > 0) {
      pricesCheck.rows.forEach((row) => {
        const daysBehind = Math.floor(row.days_behind);
        const status = daysBehind > 7 ? "❌ OUT OF DATE" : daysBehind > 1 ? "⚠️  NEEDS UPDATE" : "✅ UP TO DATE";
        console.log(
          `   ${row.symbol}: Last data on ${row.last_date} (${daysBehind} days behind) ${status}`
        );
      });
    } else {
      console.log("   ⚠️  No data in prices table");
    }

    console.log("");

    // Check daily_prices table
    const dailyCheck = await pool.query(`
      SELECT
        symbol,
        MAX(price_date) as last_date,
        EXTRACT(DAY FROM NOW() - MAX(price_date)) as days_behind
      FROM daily_prices
      GROUP BY symbol
      ORDER BY symbol;
    `);

    console.log("🟡 DAILY PRICES (daily_prices table):");
    console.log("-".repeat(80));
    if (dailyCheck.rows.length > 0) {
      dailyCheck.rows.forEach((row) => {
        const daysBehind = Math.floor(row.days_behind);
        const status = daysBehind > 7 ? "❌ OUT OF DATE" : daysBehind > 1 ? "⚠️  NEEDS UPDATE" : "✅ UP TO DATE";
        console.log(
          `   ${row.symbol}: Last data on ${row.last_date} (${daysBehind} days behind) ${status}`
        );
      });
    } else {
      console.log("   ⚠️  No data in daily_prices table");
    }

    console.log("");

    // Check current_prices table
    const currentCheck = await pool.query(`
      SELECT
        symbol,
        last_updated,
        EXTRACT(DAY FROM NOW() - last_updated) as days_behind
      FROM current_prices
      ORDER BY symbol;
    `);

    console.log("🟢 CURRENT PRICES (current_prices table):");
    console.log("-".repeat(80));
    if (currentCheck.rows.length > 0) {
      currentCheck.rows.forEach((row) => {
        const daysBehind = Math.floor(row.days_behind);
        const status = daysBehind > 1 ? "❌ OUT OF DATE" : "✅ UP TO DATE";
        console.log(
          `   ${row.symbol}: Last updated ${row.last_updated.toISOString().split("T")[0]} (${daysBehind} days behind) ${status}`
        );
      });
    } else {
      console.log("   ⚠️  No data in current_prices table");
    }

    console.log("");
    console.log("=".repeat(80));
    console.log("");

    // Recommendations
    console.log("💡 RECOMMENDATIONS:");
    console.log("-".repeat(80));

    const anyOutdated =
      pricesCheck.rows.some((r) => r.days_behind > 1) ||
      dailyCheck.rows.some((r) => r.days_behind > 1);

    if (anyOutdated) {
      console.log("   ⚠️  Your data is outdated. Here's how to update:");
      console.log("");
      console.log("   1️⃣  Update DAILY prices (for historical data):");
      console.log("      node scripts/fetch-daily-prices.js");
      console.log("");
      console.log("   2️⃣  Update HOURLY prices (for recent data):");
      console.log("      node historical_prices.js");
      console.log("");
      console.log("   3️⃣  Update CURRENT prices:");
      console.log("      node scripts/fetch-prices.js");
      console.log("");
      console.log("   📝 Note: Make sure to configure date ranges in the scripts");
      console.log("       to fetch only the missing data.");
    } else {
      console.log("   ✅ Your data looks up to date!");
      console.log("   💡 You can still run update scripts to ensure latest data.");
    }

    console.log("");
    console.log("=".repeat(80));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    console.error(error);
    process.exit(1);
  }
}

checkSupabaseData();
