import axios from "axios";
import { getPool } from "../lib/db.js";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const TOKENS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "LTC", "BCH", "TRX", "LINK"];

export default async function handler(req, res) {
  try {
    const pool = getPool();
    const results = {
      current_prices: 0,
      daily_prices: 0,
      hourly_prices: 0,
      errors: []
    };

    // Get yesterday's date for daily and hourly updates
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString();

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setUTCHours(23, 59, 59, 999);
    const yesterdayEndStr = yesterdayEnd.toISOString();

    console.log(`📅 Updating prices for ${TOKENS.length} tokens...`);

    for (const symbol of TOKENS) {
      try {
        // ===== 1. UPDATE CURRENT PRICES =====
        const currentUrl = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?symbols=${symbol}`;
        const currentResponse = await axios.get(currentUrl);
        const tokenData = currentResponse.data?.data?.[0];

        if (tokenData && tokenData.prices?.length) {
          const usdPrice = tokenData.prices.find(p => p.currency.toLowerCase() === "usd");

          if (usdPrice) {
            const value = parseFloat(usdPrice.value);
            const lastUpdatedAt = new Date(usdPrice.lastUpdatedAt)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");

            await pool.query(
              `INSERT INTO current_prices (symbol, price_usd, last_updated)
               VALUES ($1, $2, $3)
               ON CONFLICT (symbol) DO UPDATE
               SET price_usd = EXCLUDED.price_usd,
                   last_updated = EXCLUDED.last_updated`,
              [symbol, value, lastUpdatedAt]
            );
            results.current_prices++;
            console.log(`✅ Updated current price for ${symbol}: $${value}`);
          }
        }

        // ===== 2. UPDATE DAILY PRICES (yesterday only) =====
        const dailyResponse = await fetch(
          `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              symbol,
              startTime: yesterdayStr,
              endTime: yesterdayEndStr,
              interval: "1d",
              withMarketData: false,
            }),
          }
        );

        const dailyData = await dailyResponse.json();
        if (dailyData?.data?.length) {
          for (const row of dailyData.data) {
            try {
              await pool.query(
                `INSERT INTO daily_prices (symbol, price_usd, price_date)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (symbol, price_date) DO UPDATE
                 SET price_usd = EXCLUDED.price_usd`,
                [symbol, row.value, row.timestamp]
              );
              results.daily_prices++;
            } catch (err) {
              if (err.code !== '23505') throw err; // Ignore duplicate key errors
            }
          }
          console.log(`✅ Updated daily price for ${symbol}`);
        }

        // ===== 3. UPDATE HOURLY PRICES (yesterday's 24 hours) =====
        const hourlyResponse = await fetch(
          `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              symbol,
              startTime: yesterdayStr,
              endTime: yesterdayEndStr,
              interval: "1h",
            }),
          }
        );

        const hourlyData = await hourlyResponse.json();
        if (hourlyData?.data?.length) {
          for (const row of hourlyData.data) {
            const value = parseFloat(parseFloat(row.value).toFixed(5));
            const timestamp = new Date(row.timestamp).toISOString();

            await pool.query(
              `INSERT INTO prices (symbol, value, timestamp)
               VALUES ($1, $2, $3)
               ON CONFLICT (symbol, timestamp) DO UPDATE
               SET value = EXCLUDED.value`,
              [symbol, value, timestamp]
            );
            results.hourly_prices++;
          }
          console.log(`✅ Updated hourly prices for ${symbol} (${hourlyData.data.length} records)`);
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        console.error(`❌ Error processing ${symbol}:`, err.message);
        results.errors.push({ symbol, error: err.message });
      }
    }

    console.log("\n📊 Update Summary:");
    console.log(`   Current prices: ${results.current_prices} updated`);
    console.log(`   Daily prices: ${results.daily_prices} records added`);
    console.log(`   Hourly prices: ${results.hourly_prices} records added`);
    console.log(`   Errors: ${results.errors.length}`);

    res.status(200).json({
      success: true,
      message: "Price update completed",
      results
    });

  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}