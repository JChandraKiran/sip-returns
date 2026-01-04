import { getPool } from "./lib/db.js";
import "dotenv/config";

async function checkSymbols() {
  try {
    const pool = getPool();

    console.log("🔍 Checking unique symbols in all tables...\n");

    // Get unique symbols from each table
    const currentPricesQuery = `
      SELECT DISTINCT symbol FROM current_prices ORDER BY symbol;
    `;

    const dailyPricesQuery = `
      SELECT DISTINCT symbol FROM daily_prices ORDER BY symbol;
    `;

    const pricesQuery = `
      SELECT DISTINCT symbol FROM prices ORDER BY symbol;
    `;

    const [currentResult, dailyResult, hourlyResult] = await Promise.all([
      pool.query(currentPricesQuery),
      pool.query(dailyPricesQuery),
      pool.query(pricesQuery)
    ]);

    const currentSymbols = currentResult.rows.map(r => r.symbol);
    const dailySymbols = dailyResult.rows.map(r => r.symbol);
    const hourlySymbols = hourlyResult.rows.map(r => r.symbol);

    // Get all unique symbols across all tables
    const allSymbols = [...new Set([...currentSymbols, ...dailySymbols, ...hourlySymbols])].sort();

    console.log("📊 SYMBOLS BY TABLE");
    console.log("=".repeat(80));

    console.log("\n🟢 current_prices:", currentSymbols.join(", "));
    console.log("   Total:", currentSymbols.length);

    console.log("\n🟡 daily_prices:", dailySymbols.join(", "));
    console.log("   Total:", dailySymbols.length);

    console.log("\n🔵 prices (hourly):", hourlySymbols.join(", "));
    console.log("   Total:", hourlySymbols.length);

    console.log("\n" + "=".repeat(80));
    console.log("📋 COMPARISON TABLE");
    console.log("=".repeat(80));
    console.log("Symbol      | current_prices | daily_prices | prices (hourly)");
    console.log("------------|----------------|--------------|----------------");

    for (const symbol of allSymbols) {
      const inCurrent = currentSymbols.includes(symbol) ? "✅" : "❌";
      const inDaily = dailySymbols.includes(symbol) ? "✅" : "❌";
      const inHourly = hourlySymbols.includes(symbol) ? "✅" : "❌";
      console.log(`${symbol.padEnd(11)} | ${inCurrent.padEnd(14)} | ${inDaily.padEnd(12)} | ${inHourly}`);
    }

    // Find missing symbols in each table
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  MISSING SYMBOLS");
    console.log("=".repeat(80));

    const missingFromCurrent = allSymbols.filter(s => !currentSymbols.includes(s));
    const missingFromDaily = allSymbols.filter(s => !dailySymbols.includes(s));
    const missingFromHourly = allSymbols.filter(s => !hourlySymbols.includes(s));

    if (missingFromCurrent.length > 0) {
      console.log("\n🟢 Missing from current_prices:", missingFromCurrent.join(", "));
    } else {
      console.log("\n🟢 current_prices: All symbols present ✅");
    }

    if (missingFromDaily.length > 0) {
      console.log("🟡 Missing from daily_prices:", missingFromDaily.join(", "));
    } else {
      console.log("🟡 daily_prices: All symbols present ✅");
    }

    if (missingFromHourly.length > 0) {
      console.log("🔵 Missing from prices (hourly):", missingFromHourly.join(", "));
    } else {
      console.log("🔵 prices (hourly): All symbols present ✅");
    }

    console.log("\n" + "=".repeat(80));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkSymbols();