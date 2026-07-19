const { Pool } = require('pg');
require('dotenv').config();

// Initialize the Postgres connection pool using the secure URI string
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for secure cloud hosting certificates
    }
});

// Diagnostic connectivity execution block
pool.connect((err, client, release) => {
    if (err) {
        console.error('[Database Error]: Connection to Postgres failed!', err.stack);
    } else {
        console.log('[Database]: Successfully connected to the Cloud PostgreSQL cluster!');
        release(); // Release the client back to the available pool
    }
});

// Export a modern query helper function
module.exports = {
    query: (text, params) => pool.query(text, params),
};