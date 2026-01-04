import { getPool } from "./lib/db.js";
import "dotenv/config";

async function fixSequence() {
  try {
    const pool = getPool();

    console.log("🔧 Fixing daily_prices sequence...\n");

    // Get the current max ID
    const maxIdQuery = "SELECT MAX(id) as max_id FROM daily_prices";
    const maxIdResult = await pool.query(maxIdQuery);
    const maxId = maxIdResult.rows[0].max_id;

    console.log(`Current max ID in table: ${maxId}`);

    // Get current sequence value
    const seqQuery = "SELECT last_value FROM daily_prices_id_seq";
    const seqResult = await pool.query(seqQuery);
    const currentSeq = seqResult.rows[0].last_value;

    console.log(`Current sequence value: ${currentSeq}`);

    if (currentSeq < maxId) {
      console.log(`\n⚠️  Sequence is behind! Fixing...`);

      // Reset sequence to max_id + 1
      const newSeq = maxId + 1;
      await pool.query(`SELECT setval('daily_prices_id_seq', $1, false)`, [newSeq]);

      console.log(`✅ Sequence reset to: ${newSeq}`);
    } else {
      console.log(`\n✅ Sequence is already correct!`);
    }

    // Also fix prices table sequence
    console.log("\n🔧 Fixing prices sequence...\n");

    const pricesMaxQuery = "SELECT MAX(id) as max_id FROM prices";
    const pricesMaxResult = await pool.query(pricesMaxQuery);
    const pricesMaxId = pricesMaxResult.rows[0].max_id;

    console.log(`Current max ID in prices table: ${pricesMaxId}`);

    const pricesSeqQuery = "SELECT last_value FROM prices_id_seq";
    const pricesSeqResult = await pool.query(pricesSeqQuery);
    const pricesCurrentSeq = pricesSeqResult.rows[0].last_value;

    console.log(`Current prices sequence value: ${pricesCurrentSeq}`);

    if (pricesCurrentSeq < pricesMaxId) {
      console.log(`\n⚠️  Prices sequence is behind! Fixing...`);

      const pricesNewSeq = pricesMaxId + 1;
      await pool.query(`SELECT setval('prices_id_seq', $1, false)`, [pricesNewSeq]);

      console.log(`✅ Prices sequence reset to: ${pricesNewSeq}`);
    } else {
      console.log(`\n✅ Prices sequence is already correct!`);
    }

    console.log("\n🎉 All sequences fixed!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixSequence();