const pool = require("../config/db");

const globalSearch = async (req, res) => {
    try {
        const queryStr = String(req.query.q || req.query.search || "").trim();

        if (!queryStr) {
            return res.status(200).json({
                patients: [],
                doctors: [],
                staff: []
            });
        }

        const searchPattern = `%${queryStr}%`;

        // 1. Query Patients
        const patientsQuery = pool.query(
            `SELECT 
                id, 
                patient_name AS name, 
                ward, 
                bed_number, 
                phone, 
                'patient' AS type
             FROM patients
             WHERE LOWER(patient_name) LIKE LOWER($1)
                OR LOWER(COALESCE(phone, '')) LIKE LOWER($1)
                OR CAST(id AS TEXT) LIKE $1
             LIMIT 10`,
            [searchPattern]
        );

        // 2. Query Doctors
        const doctorsQuery = pool.query(
            `SELECT 
                id, 
                doctor_name AS name, 
                specialization, 
                phone, 
                'doctor' AS type
             FROM doctors
             WHERE LOWER(doctor_name) LIKE LOWER($1)
                OR LOWER(COALESCE(specialization, '')) LIKE LOWER($1)
             LIMIT 10`,
            [searchPattern]
        );

        // 3. Query Users / Staff
        const staffQuery = pool.query(
            `SELECT 
                id, 
                full_name AS name, 
                role, 
                email, 
                'staff' AS type
             FROM users
             WHERE LOWER(full_name) LIKE LOWER($1)
                OR LOWER(COALESCE(email, '')) LIKE LOWER($1)
                OR LOWER(COALESCE(role, '')) LIKE LOWER($1)
             LIMIT 10`,
            [searchPattern]
        );

        const [patientsRes, doctorsRes, staffRes] = await Promise.all([
            patientsQuery.catch(() => ({ rows: [] })),
            doctorsQuery.catch(() => ({ rows: [] })),
            staffQuery.catch(() => ({ rows: [] }))
        ]);

        return res.status(200).json({
            patients: patientsRes.rows,
            doctors: doctorsRes.rows,
            staff: staffRes.rows
        });
    } catch (error) {
        console.error("Global search error:", error.message);
        return res.status(500).json({ error: "Failed to perform global search" });
    }
};

module.exports = { globalSearch };