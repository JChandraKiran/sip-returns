import { getPool } from "../db.js";
export async function fetchHourlyPrices(symbol, fromDate, toDate) {
  const pool = getPool();
  const query = `
                SELECT price_usd, price_date_time
                FROM prices
                WHERE symbol = ?
                  AND DATE(price_date_time) >= ?
                  AND DATE(price_date_time) <= ?
                ORDER BY price_date_time ASC
              `;
  const queryParams = [symbol, fromDate, toDate];
  const [rows] = await pool.execute(query, queryParams);
  return rows;
}
export async function fetchDailyPrices(symbol, fromDate, toDate) {
  const pool = getPool();
  const query = `
                SELECT price_date, price_usd
                FROM daily_prices
                WHERE symbol = ?
                  AND price_date BETWEEN ? AND ?
                ORDER BY price_date ASC
              `;
  const queryParams = [symbol.toUpperCase(), fromDate, toDate];
  const [rows] = await pool.execute(query, queryParams);
  return rows;
}

export async function fetchWeeklyPrices(symbol, fromDate, toDate, dayOfWeek) {
  const pool = getPool();

  // Map day of week string to MySQL DAYOFWEEK value
  const dowMap = {
    sunday: 1,
    monday: 2,
    tuesday: 3,
    wednesday: 4,
    thursday: 5,
    friday: 6,
    saturday: 7,
  };

  const dow = dowMap[dayOfWeek.toLowerCase()];
  if (!dow) {
    throw new Error(
      "Invalid dayOfWeek. Use: sunday, monday, tuesday, wednesday, thursday, friday, saturday"
    );
  }

  const query = `
        SELECT price_date, price_usd
        FROM daily_prices
        WHERE symbol = ?
          AND price_date BETWEEN ? AND ?
          AND DAYOFWEEK(price_date) = ?
        ORDER BY price_date ASC
      `;
  const queryParams = [symbol.toUpperCase(), fromDate, toDate, dow];
  const [rows] = await pool.execute(query, queryParams);
  return rows;
}

export async function fetchMonthlyPrices(symbol, fromDate, toDate) {
  const pool = getPool();
  const query = `
        SELECT price_date, price_usd
        FROM daily_prices
        WHERE symbol = ?
          AND price_date BETWEEN ? AND ?
          AND DAY(price_date) = 1
        ORDER BY price_date ASC
      `;
  const queryParams = [symbol.toUpperCase(), fromDate, toDate];
  const [rows] = await pool.execute(query, queryParams);
  return rows;
}

export async function fetchCurrentPrice(symbol) {
  const pool = getPool();
  let currentPriceQuery = `SELECT price_usd FROM current_prices WHERE symbol=?`;
  const [currentPriceRows] = await pool.execute(currentPriceQuery, [symbol]);
  let todayPrice = currentPriceRows[0].price_usd;
  return todayPrice;
}
