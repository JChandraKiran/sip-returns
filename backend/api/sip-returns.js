// api/sip-returns.js
import {
  fetchHourlyPrices,
  fetchDailyPrices,
  fetchWeeklyPrices,
  fetchMonthlyPrices,
  fetchCurrentPrice,
} from "../lib/queries/priceQueries.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    cryptocurrency,
    method,
    fromDate,
    toDate,
    frequency,
    amount,
    dayOfWeek,
  } = req.query;

  // Validate common required fields
  if (!cryptocurrency || !method || !fromDate || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate method-specific fields
  if (method.toLowerCase() === "dca" && (!toDate || !frequency)) {
    return res.status(400).json({ error: "toDate and frequency are required for DCA method" });
  }
  if (method.toLowerCase() === "dca") {
    try {
      const symbol = cryptocurrency.toUpperCase();
      let rows;

      // Fetch prices based on frequency
      if (frequency.toLowerCase() === "hourly") {
        rows = await fetchHourlyPrices(symbol, fromDate, toDate);
      } else if (frequency.toLowerCase() === "daily") {
        rows = await fetchDailyPrices(symbol, fromDate, toDate);
      } else if (frequency.toLowerCase() === "weekly") {
        if (!dayOfWeek) {
          return res
            .status(400)
            .json({ error: "dayOfWeek is required for weekly frequency" });
        }
        rows = await fetchWeeklyPrices(symbol, fromDate, toDate, dayOfWeek);
      } else if (frequency.toLowerCase() === "monthly") {
        rows = await fetchMonthlyPrices(symbol, fromDate, toDate);
      } else {
        return res.status(400).json({ error: "Invalid frequency" });
      }

      if (!rows.length) {
        return res.status(404).json({ error: "No data found for given query" });
      }

      // SIP Variables
      let noOfInvestments;
      let totalInvested;
      let todayPrice;
      let accumulatedUnits = 0;
      let ValueOfAccumulatedUnits;
      let averagePrice = 0;

      // Chart Variables
      let chartData = [];

      if (frequency.toLowerCase() === "hourly") {
        const dailySnapshots = {};
        for (const row of rows) {
          accumulatedUnits += amount / row.price_usd;

          // Chart Calculations
          const dateKey = row.price_date_time.toISOString().split("T")[0];
          if (!dailySnapshots[dateKey]) {
            dailySnapshots[dateKey] = {
              lastPrice: 0,
              investedOnThisDay: 0,
              unitsOnThisDay: 0,
            };
          }
          dailySnapshots[dateKey].lastPrice = row.price_usd;
          dailySnapshots[dateKey].investedOnThisDay += parseFloat(amount);
          dailySnapshots[dateKey].unitsOnThisDay += amount / row.price_usd;
        }
        let runningInvested = 0;
        let runningUnits = 0;
        const sortedDates = Object.keys(dailySnapshots).sort();

        for (const date of sortedDates) {
          const snapshot = dailySnapshots[date];
          runningInvested += snapshot.investedOnThisDay;
          runningUnits += snapshot.unitsOnThisDay;

          chartData.push({
            timestamp: date,
            price: snapshot.lastPrice,
            investedValue: runningInvested,
            portfolioValue: runningUnits * snapshot.lastPrice,
            totalUnits: runningUnits,
          });
        }
      } else if (
        frequency.toLowerCase() === "weekly" ||
        frequency.toLowerCase() === "monthly"
      ) {
        // Weekly/Monthly: Invest on specific days, but show daily chart
        const dailyPrices = await fetchDailyPrices(symbol, fromDate, toDate);

        // Create a set of investment dates for quick lookup
        const investmentDates = new Set();
        for (const row of rows) {
          const investDate = row.price_date.toISOString().split("T")[0];
          investmentDates.add(investDate);
        }

        // Generate chart data with daily prices
        let runningUnits = 0;
        let runningInvested = 0;

        for (const dailyPrice of dailyPrices) {
          const priceDate = dailyPrice.price_date.toISOString().split("T")[0];

          // Check if investment happens on this date
          if (investmentDates.has(priceDate)) {
            runningUnits += amount / parseFloat(dailyPrice.price_usd);
            runningInvested += parseFloat(amount);
            accumulatedUnits += amount / parseFloat(dailyPrice.price_usd);
          }

          chartData.push({
            timestamp: priceDate,
            price: parseFloat(dailyPrice.price_usd),
            investedValue: runningInvested,
            portfolioValue: runningUnits * parseFloat(dailyPrice.price_usd),
            totalUnits: runningUnits,
          });
        }
      } else {
        // Daily
        for (const row of rows) {
          accumulatedUnits += amount / row.price_usd;
          chartData.push({
            timestamp: row.price_date,
            price: row.price_usd,
            investedValue: (rows.indexOf(row) + 1) * amount,
            portfolioValue: accumulatedUnits * row.price_usd,
            totalUnits: accumulatedUnits,
          });
        }
      }

      // Get today Price
      todayPrice = await fetchCurrentPrice(symbol);

      noOfInvestments = rows.length;
      totalInvested = noOfInvestments * amount;
      averagePrice = totalInvested / accumulatedUnits;
      ValueOfAccumulatedUnits = accumulatedUnits * todayPrice;

      res.status(200).json({
        cryptocurrency,
        frequency,
        // rows,
        noOfInvestments,
        totalInvested,
        todayPrice,
        accumulatedUnits,
        averagePrice,
        ValueOfAccumulatedUnits,
        chartData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message, sql: err.sql || null });
    }
  } else if (method.toLowerCase() === "lumpsum") {
    try {
      const symbol = cryptocurrency.toUpperCase();

      // Fetch price at investment date
      const investmentDatePrices = await fetchDailyPrices(symbol, fromDate, fromDate);

      if (!investmentDatePrices.length) {
        return res.status(404).json({
          error: "No price data found for the investment date. Please select a different date."
        });
      }

      const investmentPrice = parseFloat(investmentDatePrices[0].price_usd);
      const unitsPurchased = parseFloat(amount) / investmentPrice;

      // Get current price
      const currentPrice = await fetchCurrentPrice(symbol);

      // Calculate returns
      const currentValue = unitsPurchased * currentPrice;
      const absoluteReturns = currentValue - parseFloat(amount);
      const percentageReturns = ((currentValue - parseFloat(amount)) / parseFloat(amount)) * 100;

      // Fetch daily prices from investment date to today for chart
      const today = new Date();
      today.setDate(today.getDate() - 1); // Yesterday
      const toDate = today.toISOString().split('T')[0];

      const dailyPrices = await fetchDailyPrices(symbol, fromDate, toDate);

      // Generate chart data
      const chartData = dailyPrices.map(row => ({
        timestamp: row.price_date,
        price: parseFloat(row.price_usd),
        portfolioValue: unitsPurchased * parseFloat(row.price_usd),
        totalUnits: unitsPurchased,
        investedValue: parseFloat(amount)
      }));

      res.status(200).json({
        cryptocurrency,
        method,
        investmentDate: fromDate,
        investmentAmount: parseFloat(amount),
        investmentPrice,
        unitsPurchased,
        currentPrice,
        currentValue,
        absoluteReturns,
        percentageReturns,
        chartData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message, sql: err.sql || null });
    }
  }
}
