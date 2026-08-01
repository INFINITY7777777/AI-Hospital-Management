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

// ==========================================================
// GET ALL PATIENTS
// Fetches all patients from the database
// ==========================================================

const getAllPatients = async (req, res) => {

    try {

        // Fetch a;; Patients
        const result = await db.query(
            `SELECT * 
            FROM patients 
            ORDER BY created_at DESC`
        );

        // Sends Patients to Frontend
        res.status(200).json({
            patients : result.rows
        });

    } catch (error) {
        console.error("Pateint Error :- ", error);

        res.status(500).json({
            error : "Failed to fetch Pateints!"
        });

    }

};

// ==========================================================
// GET PATIENT BY ID
// Fetches one specific patient from the database
// ==========================================================

const getPatientById = async (req, res) => {
    try {

        // Get Patient ID from URL
        const { id } = req.params;

        // Find patient in database
        const result = await db.query(
            `SELECT *
            FROM patients
            WHERE id = $1`, [id]
        );

        // Check if Patient exists.
        if(result.rows.length === 0) {
            return res.status(404).json({
                error : "Patient not found"
            });

        }

        // Send patient data.
        res.status(200).json({
            patient : result.rows[0]
        });

    } catch(error) {
        console.error("[Patient Error] :- ", error);

        res.status(500).json({
            error : "Failed to fetch The Patient!"
        });
    }
};

// ==========================================================
// UPDATE PATIENT
// Updates an existing patient's information
// ==========================================================

const updatePatient = async (req, res) => {

    try {

        
        // ==========================================================
        // GET PATIENT ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // GET UPDATED DATA FROM REQUEST BODY
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


        // ==========================================================
        // UPDATE PATIENT IN DATABASE
        // ==========================================================

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
                bloodGroup,
                phone,
                address,
                emergencyContact,
                doctor,
                ward,
                bedNumber,
                diagnosis,
                admissionDate,
                id
            ]
        );


        // ==========================================================
        // CHECK IF PATIENT EXISTS
        // ==========================================================

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Patient not found"
            });

        }


        // ==========================================================
        // SEND SUCCESS RESPONSE
        // ==========================================================

        res.status(200).json({

            message: "Patient updated successfully",

            patient: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Patient Update Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to update patient"

        });

    }

};

// ==========================================================
// DELETE PATIENT
// Deletes a patient from the database
// ==========================================================

const deletePatient = async (req, res) => {

    try {

        // Get patient ID from URL
        const { id } = req.params;

        // Delete patient
        const result = await db.query(
            `
            DELETE FROM patients
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        // Check if patient exists
        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Patient not found"
            });

        }

        // Send success response
        res.status(200).json({

            message: "Patient deleted successfully",

            patient: result.rows[0]

        });

    } catch (error) {

        console.error(
            "[Patient Delete Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to delete patient"

        });

    }

};

module.exports = {

    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,

};