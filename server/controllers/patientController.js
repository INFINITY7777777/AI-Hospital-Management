// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");

// ==========================================================
// ADD PATIENT
// Saves a new patient into the database
// ==========================================================

const addPatient = async (req, res) => {

    try {

        // ==========================================================
        // GET DATA FROM REQUEST BODY
        // ==========================================================

        const {

            patientName,
            age,
            gender,
            bloodGroup,
            phone,
            address,
            emergencyContact,
            doctor,
            ward,
            bedNumber,
            diagnosis,
            admissionDate

        } = req.body;

        console.log(req.body);

        // ==========================================================
        // INSERT PATIENT INTO DATABASE
        // ==========================================================

        const result = await db.query(
            `
            INSERT INTO patients (
                patient_name,
                age,
                gender,
                blood_group,
                phone,
                address,
                emergency_contact,
                doctor,
                ward,
                bed_number,
                diagnosis,
                admission_date
            )
            VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12
            )
            RETURNING *;
            `,
            [
                patientName,
                age,
                gender,
                bloodGroup,
                phone,
                address,
                emergencyContact,
                doctor,
                ward,
                bedNumber,
                diagnosis,
                admissionDate
            ]
        );

        // ==========================================================
        // SEND SUCCESS RESPONSE
        // ==========================================================

        res.status(201).json({
            message: "Patient added successfully",
            patient: result.rows[0]
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Internal Server Error"
        });

    }

};

module.exports = {

    addPatient

};