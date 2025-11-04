/**
 * Fetches historical price data for a token using the Alchemy Prices API.
 *
 * NOTE: Replace 'YOUR_ALCHEMY_API_KEY' with your actual API key.
 * This key is essential for the request to be authorized.
 */
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("btc.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS btc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT,
    value REAL,
    timestamp TEXT
  )`);
});

// Function to close the database connection
function closeDb() {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log(`\nDatabase connection closed.`);
    }
  });
}

function insertPrice(symbol, value, timestamp) {
  // CRITICAL IMPROVEMENT: Convert the string value to a float number
  const numericValue = parseFloat(value).toFixed(2);

  const sql = `INSERT INTO btc (symbol, value, timestamp) VALUES (?, ?, ?)`;
  db.run(sql, [symbol, numericValue, timestamp], function (err) {
    if (err) {
      console.error(
        `Error inserting data: ${symbol} at ${timestamp}`,
        err.message
      );
    }
  });
}

async function fetchHistoricalTokenPrices({
  startTime = "2024-01-01T00:00:00Z",
  endTime = "2024-01-02T23:59:59Z",
  interval = "1h",
}) {
  // --- CRUCIAL STEP: REPLACE THIS WITH YOUR REAL API KEY ---
  const apiKey = "21QGlZ9620ld2erifQ0M5g5Ewuho6XJ6";
  // ---------------------------------------------------------

  const url = `https://api.g.alchemy.com/prices/v1/${apiKey}/tokens/historical`;
  const requestBody = {
    symbol: "link",
    startTime: startTime,
    endTime: endTime,
    interval: interval,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the request was successful (status code 200-299)
    if (!response.ok) {
      // Throw an error for bad responses (e.g., 400, 401, 500)
      const errorBody = await response.json().catch(() => ({})); // Attempt to parse error body
      throw new Error(
        `HTTP error! Status: ${response.status}. Message: ${
          errorBody.message || "No specific error message provided."
        }`
      );
    }

    const body = await response.json();
    console.log("Historical Token Price Data Received:");
    // console.log(body);
    const prices = body.data;

    if (prices && prices.length > 0) {
      // ... console.log success message

      // Save data to SQLite <--- THIS IS WHERE IT HAPPENS
      prices.forEach((pricePoint) => {
        insertPrice(body.symbol, pricePoint.value, pricePoint.timestamp);
      });
    }
  } catch (error) {
    console.error("An error occurred during the fetch operation:", error);
  }
}

// Execute the function
// fetchHistoricalTokenPrices({
//   startTime: "2024-01-01T00:00:00Z",
//   endTime: "2024-01-02T23:59:59Z",
//   interval: "1h",
// });

async function fetchAllDataInChunks() {
  // Define the overall date range for the year 2024
  const START_OF_YEAR = new Date("2018-01-01T00:00:00Z");
  const END_OF_YEAR = new Date("2024-12-30T23:59:59Z");

  // The chunk size in days (29 days)
  const CHUNK_DAYS = 30;
  // Milliseconds in 29 days
  const MS_IN_CHUNK = CHUNK_DAYS * 24 * 60 * 60 * 1000;

  let currentStart = START_OF_YEAR;
  let counter = 1;

  console.log(
    `Starting data fetch from ${START_OF_YEAR.toISOString()} to ${END_OF_YEAR.toISOString()} in ${CHUNK_DAYS}-day chunks...`
  );

  // Loop while the current start time is before the end of the target period
  while (currentStart < END_OF_YEAR) {
    // Calculate the end time for the current chunk
    let currentEnd = new Date(currentStart.getTime() + MS_IN_CHUNK - 1000); // Subtract 1 second for a clean 29-day boundary

    // Ensure the currentEnd doesn't exceed the overall END_OF_YEAR
    if (currentEnd > END_OF_YEAR) {
      currentEnd = END_OF_YEAR;
    }

    // Convert Date objects to the required ISO 8601 string format
    const startTimeISO = currentStart.toISOString();
    const endTimeISO = currentEnd.toISOString();

    console.log(`\n--- Chunk ${counter} ---`);
    console.log(`Requesting data from: ${startTimeISO}`);
    console.log(`To: ${endTimeISO}`);

    // Call the fetching function
    await fetchHistoricalTokenPrices({
      startTime: startTimeISO,
      endTime: endTimeISO,
      interval: "1h", // Example interval: 1-hour resolution
    });

    // Move the start time for the next iteration
    // Use the original MS_IN_CHUNK to ensure the start/end times are contiguous
    currentStart = new Date(currentStart.getTime() + MS_IN_CHUNK);

    counter++;

    // Optional: Add a small delay (e.g., 500ms) to be polite to the API
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Stop if the next start is past the end
    if (currentStart > END_OF_YEAR) break;
  }

  console.log(`\n\nProcess complete. Total chunks processed: ${counter - 1}`);
  closeDb(); // Close the database connection when all work is done
}

// Execute the main loop function
fetchAllDataInChunks();
