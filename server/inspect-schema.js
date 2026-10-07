
require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function inspectSchema() {
    try {
        await client.connect();

        const tables = [
            "beds",
            "admissions",
            "patient_stay_history",
            "patients"
        ];

        const columns = await client.query(
            `SELECT table_name, column_name, data_type, is_nullable
             FROM information_schema.columns
             WHERE table_schema = $1
               AND table_name = ANY($2)
             ORDER BY table_name, ordinal_position`,
            ["public", tables]
        );

        console.log("\n=== TABLE COLUMNS ===");
        console.table(columns.rows);

        const constraints = await client.query(
            `SELECT tc.table_name, tc.constraint_name,
                    tc.constraint_type, kcu.column_name,
                    ccu.table_name AS foreign_table,
                    ccu.column_name AS foreign_column
             FROM information_schema.table_constraints tc
             LEFT JOIN information_schema.key_column_usage kcu
               ON tc.constraint_name = kcu.constraint_name
              AND tc.constraint_schema = kcu.constraint_schema
             LEFT JOIN information_schema.constraint_column_usage ccu
               ON tc.constraint_name = ccu.constraint_name
              AND tc.constraint_schema = ccu.constraint_schema
             WHERE tc.table_schema = $1
               AND tc.table_name = ANY($2)
             ORDER BY tc.table_name, tc.constraint_name`,
            ["public", tables]
        );

        console.log("\n=== TABLE CONSTRAINTS ===");
        console.table(constraints.rows);
    } catch (error) {
        console.error("Schema inspection failed:", error.message);
        process.exitCode = 1;
    } finally {
        await client.end().catch(() => {});
    }
}

inspectSchema();