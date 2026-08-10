// ==========================================================
// PATIENT CONTROLLER
// Handles all patient-related operations
// ==========================================================

const db = require("../config/db");


// ==========================================================
// ADD PATIENT
// ==========================================================

const addPatient = async (req, res) => {

    try {

        // ==================================================
        // GET DATA FROM REQUEST
        // ==================================================

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


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!patientName || !age || !gender) {

            return res.status(400).json({

                error:
                    "Patient name, age and gender are required."

            });

        }


        // ==================================================
        // INSERT PATIENT
        // ==================================================

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

                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12

            )

            RETURNING *;
            `,

            [

                patientName,
                age,
                gender,
                bloodGroup || null,
                phone || null,
                address || null,
                emergencyContact || null,
                doctor || null,
                ward || null,
                bedNumber || null,
                diagnosis || null,
                admissionDate || null

            ]

        );


        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(201).json({

            message: "Patient added successfully",

            patient: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[ADD PATIENT ERROR]:",
            error
        );

        return res.status(500).json({

            error: "Failed to add patient."

        });

    }

};


// ==========================================================
// GET ALL PATIENTS
// ==========================================================

const getAllPatients = async (req, res) => {

    try {

        const result = await db.query(

            `
            SELECT *
            FROM patients
            ORDER BY created_at DESC
            `

        );


        return res.status(200).json({

            patients: result.rows

        });

    }

    catch (error) {

        console.error(
            "[GET ALL PATIENTS ERROR]:",
            error
        );

        return res.status(500).json({

            error: "Failed to fetch patients."

        });

    }

};


// ==========================================================
// GET PATIENT BY ID
// ==========================================================

const getPatientById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(

            `
            SELECT *
            FROM patients
            WHERE id = $1
            `,

            [id]

        );


        // ==================================================
        // NOT FOUND
        // ==================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Patient not found."

            });

        }


        return res.status(200).json({

            patient: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[GET PATIENT ERROR]:",
            error
        );

        return res.status(500).json({

            error: "Failed to fetch patient."

        });

    }

};


// ==========================================================
// UPDATE PATIENT
// ==========================================================

const updatePatient = async (req, res) => {

    try {

        const { id } = req.params;


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


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!patientName || !age || !gender) {

            return res.status(400).json({

                error:
                    "Patient name, age and gender are required."

            });

        }


        // ==================================================
        // UPDATE
        // ==================================================

        const result = await db.query(

            `
            UPDATE patients

            SET

                patient_name = $1,
                age = $2,
                gender = $3,
                blood_group = $4,
                phone = $5,
                address = $6,
                emergency_contact = $7,
                doctor = $8,
                ward = $9,
                bed_number = $10,
                diagnosis = $11,
                admission_date = $12

            WHERE id = $13

            RETURNING *;
            `,

            [

                patientName,
                age,
                gender,
                bloodGroup || null,
                phone || null,
                address || null,
                emergencyContact || null,
                doctor || null,
                ward || null,
                bedNumber || null,
                diagnosis || null,
                admissionDate || null,
                id

            ]

        );


        // ==================================================
        // NOT FOUND
        // ==================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Patient not found."

            });

        }


        return res.status(200).json({

            message: "Patient updated successfully",

            patient: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[UPDATE PATIENT ERROR]:",
            error
        );

        return res.status(500).json({

            error: "Failed to update patient."

        });

    }

};


// ==========================================================
// DELETE PATIENT
// ==========================================================

const deletePatient = async (req, res) => {

    try {

        const { id } = req.params;


        // ==================================================
        // DELETE
        // ==================================================

        const result = await db.query(

            `
            DELETE FROM patients

            WHERE id = $1

            RETURNING *;
            `,

            [id]

        );


        // ==================================================
        // NOT FOUND
        // ==================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Patient not found."

            });

        }


        return res.status(200).json({

            message: "Patient deleted successfully",

            patient: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[DELETE PATIENT ERROR]:",
            error
        );

        return res.status(500).json({

            error: "Failed to delete patient."

        });

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient

};