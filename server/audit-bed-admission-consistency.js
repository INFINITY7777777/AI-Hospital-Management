
require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        p.id AS patient_id,
        COUNT(DISTINCT b.id)::int AS bed_references,
        COUNT(DISTINCT a.id)::int AS admission_records,
        COUNT(DISTINCT h.id)::int AS stay_history_records
      FROM patients p
      LEFT JOIN beds b ON b.patient_id = p.id
      LEFT JOIN admissions a ON a.patient_id = p.id
      LEFT JOIN patient_stay_history h ON h.patient_id = p.id
      WHERE p.id IN (13, 14)
      GROUP BY p.id
      ORDER BY p.id;
    `);

    console.table(result.rows);
  } catch (error) {
    console.error("Inspection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();