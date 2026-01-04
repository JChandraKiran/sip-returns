import { getPool } from "../db.js";

export async function fetchHourlyPrices(symbol, fromDate, toDate) {
  const pool = getPool();
  const query = `
                SELECT value as price_usd, timestamp as price_date_time
                FROM prices
                WHERE symbol = $1
                  AND DATE(timestamp) >= $2
                  AND DATE(timestamp) <= $3
                ORDER BY timestamp ASC
              `;
  const queryParams = [symbol, fromDate, toDate];
  const result = await pool.query(query, queryParams);
  return result.rows;
}

export async function fetchDailyPrices(symbol, fromDate, toDate) {
  const pool = getPool();
  const query = `
                SELECT price_date, price_usd
                FROM daily_prices
                WHERE symbol = $1
                  AND price_date BETWEEN $2 AND $3
                ORDER BY price_date ASC
              `;
  const queryParams = [symbol.toUpperCase(), fromDate, toDate];
  const result = await pool.query(query, queryParams);
  return result.rows;
}

export async function fetchWeeklyPrices(symbol, fromDate, toDate, dayOfWeek) {
  const pool = getPool();

  // Map day of week string to PostgreSQL EXTRACT(DOW) value (0=Sunday, 6=Saturday)
  const dowMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const dow = dowMap[dayOfWeek.toLowerCase()];
  if (dow === undefined) {
    throw new Error(
      "Invalid dayOfWeek. Use: sunday, monday, tuesday, wednesday, thursday, friday, saturday"
    );
  }

  const query = `
        SELECT price_date, price_usd
        FROM daily_prices
        WHERE symbol = $1
          AND price_date BETWEEN $2 AND $3
          AND EXTRACT(DOW FROM price_date) = $4
        ORDER BY price_date ASC
      `;
  const queryParams = [symbol.toUpperCase(), fromDate, toDate, dow];
  const result = await pool.query(query, queryParams);
  return result.rows;
}

export async function fetchMonthlyPrices(symbol, fromDate, toDate) {
  const pool = getPool();
  const query = `
        SELECT price_date, price_usd
        FROM daily_prices
        WHERE symbol = $1
          AND price_date BETWEEN $2 AND $3
          AND EXTRACT(DAY FROM price_date) = 1
        ORDER BY price_date ASC
      `;
  const queryParams = [symbol.toUpperCase(), fromDate, toDate];
  const result = await pool.query(query, queryParams);
  return result.rows;
}

export async function fetchCurrentPrice(symbol) {
  const pool = getPool();
  let currentPriceQuery = `SELECT price_usd FROM current_prices WHERE symbol=$1`;
  const result = await pool.query(currentPriceQuery, [symbol]);
  let todayPrice = result.rows[0].price_usd;
  return todayPrice;
}
