import axios from "axios";
import cron from "node-cron";
import { getPool } from "../lib/db.js";
import "dotenv/config";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY; // your key here
const TOKENS = ["BTC", "ETH", "SOL"]; // add more symbols if needed

const pool = getPool();

async function fetchAndStorePrices() {
  try {
    const values = [];

    for (const symbol of TOKENS) {
      const url = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?symbols=${symbol}`;
      try {
        const response = await axios.get(url);
        const tokenData = response.data?.data?.[0];

        if (!tokenData || !tokenData.prices?.length) {
          console.warn(`⚠️ No price data for ${symbol}`);
          continue;
        }

        const usdPrice = tokenData.prices.find(
          (p) => p.currency.toLowerCase() === "usd"
        );

        if (!usdPrice) {
          console.warn(`⚠️ ${symbol}: USD price not found`);
          continue;
        }

        const value = parseFloat(usdPrice.value);
        const lastUpdatedAt = usdPrice.lastUpdatedAt;

        const updatedAt = new Date(lastUpdatedAt);
        const formattedUpdatedAt = updatedAt
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        values.push([symbol, value, formattedUpdatedAt]);
      } catch (err) {
        console.error(`❌ Error fetching ${symbol}:`, err.message);
      }
    }

    if (values.length) {
      await pool.query(
        `
        INSERT INTO current_prices (symbol, value, last_updated)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          value = VALUES(value),
          last_updated = VALUES(last_updated)
        `,
        [values]
      );
      console.log(`Inserted ${symbol} price in to databse`);
    } else {
      console.warn("⚠️ No valid token prices to insert this cycle.");
    }
  } catch (err) {
    console.error("❌ Outer error:", err.message);
  }
}

// 🕒 Run every 1 minute locally
cron.schedule("*/1 * * * *", fetchAndStorePrices);
console.log("🕒 Fetching Alchemy prices every 1 minute...");
