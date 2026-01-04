import axios from "axios";
import { getPool } from "./lib/db.js";
import "dotenv/config";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const TOKENS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOGE", "LTC", "BCH", "TRX", "LINK"];

const pool = getPool();

async function fetchAndStorePrices() {
  try {
    console.log("🚀 Updating current prices for all tokens...\n");

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
      for (const [symbol, value, lastUpdated] of values) {
        await pool.query(
          `
          INSERT INTO current_prices (symbol, price_usd, last_updated)
          VALUES ($1, $2, $3)
          ON CONFLICT (symbol) DO UPDATE
          SET price_usd = EXCLUDED.price_usd,
              last_updated = EXCLUDED.last_updated
          `,
          [symbol, value, lastUpdated]
        );
        console.log(`✅ Updated ${symbol} price in database: $${value}`);
      }
      console.log(`\n✅ Successfully updated ${values.length} token prices!`);
    } else {
      console.warn("⚠️ No valid token prices to insert.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fetchAndStorePrices();