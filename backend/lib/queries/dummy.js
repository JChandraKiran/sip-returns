// else if (frequency === "weekly") {
//   // 2) Weekly SIP style (e.g. every Sunday)
//   if (!dayOfWeek) {
//     return res
//       .status(400)
//       .json({ error: "dayOfWeek is required for weekly frequency" });
//   }

//   const dowMap = {
//     sunday: 1,
//     monday: 2,
//     tuesday: 3,
//     wednesday: 4,
//     thursday: 5,
//     friday: 6,
//     saturday: 7,
//   };

//   const dow = dowMap[dayOfWeek.toLowerCase()];
//   if (!dow) {
//     return res.status(400).json({
//       error:
//         "Invalid dayOfWeek. Use: sunday, monday, tuesday, wednesday, thursday, friday, saturday",
//     });
//   }

//   query = `
//           SELECT price_date, price_usd
//           FROM daily_prices
//           WHERE symbol = ?
//             AND price_date BETWEEN ? AND ?
//             AND DAYOFWEEK(price_date) = ?
//           ORDER BY price_date ASC
//           `;
//   queryParams = [symbol.toUpperCase(), fromDate, toDate, dow];
// }
