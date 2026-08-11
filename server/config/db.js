// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const { Pool } = require("pg");

require("dotenv").config();


// ==========================================================
// INITIALIZE POSTGRES CONNECTION POOL
// ==========================================================

const pool = new Pool({

    connectionString: process.env.DATABASE_URL,

    ssl: {

        rejectUnauthorized: false

    }

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