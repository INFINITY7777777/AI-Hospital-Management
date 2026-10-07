// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const { Pool, types } = require("pg");
require("dotenv").config();

// Override PostgreSQL DATE parser (OID 1082)
// Returns DATE values as raw strings "YYYY-MM-DD" to avoid UTC timezone shifts
types.setTypeParser(1082, (val) => val);

// ==========================================================
// INITIALIZE POSTGRES CONNECTION POOL
// ==========================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ==========================================================
// DATABASE CONNECTIVITY CHECK
// ==========================================================

pool.connect((err, client, release) => {
  if (err) {
    console.error(
      "[Database Error]: Connection to Postgres failed!",
      err.stack
    );
    return;
  }

  console.log(
    "[Database]: Successfully connected to the Cloud PostgreSQL cluster!"
  );

  release();
});

// ==========================================================
// EXPORT DATABASE POOL
// ==========================================================

module.exports = pool;