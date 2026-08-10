// ==========================================================
// DOCTOR CONTROLLER
// Handles all doctor-related database operations
// ==========================================================

// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");

// ==========================================================
// ADD DOCTOR
// Saves a new doctor into the database
// ==========================================================

const addDoctor = async (req, res) => {

    try {

        // ======================================================
        // GET DATA FROM REQUEST BODY
        // ======================================================

        const {
            doctorName,
            specialization,
            phone,
            email,
            department,
            experience
        } = req.body;

        console.log("[ADD DOCTOR]:", req.body);

        // ======================================================
        // VALIDATION
        // ======================================================

        if (!doctorName || !specialization) {

            return res.status(400).json({
                error: "Doctor name and specialization are required."
            });

        }

        // ======================================================
        // INSERT DOCTOR
        // ======================================================

        const result = await db.query(
            `
            INSERT INTO doctors (
                doctor_name,
                specialization,
                phone,
                email,
                department,
                experience
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            RETURNING *;
            `,
            [
                doctorName,
                specialization,
                phone || null,
                email || null,
                department || null,
                experience || null
            ]
        );

        // ======================================================
        // SUCCESS RESPONSE
        // ======================================================

        res.status(201).json({

            message: "Doctor added successfully",

            doctor: result.rows[0]

        });

    } catch (error) {

        console.error(
            "[Doctor Add Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to add doctor"

        });

    }

};

// ==========================================================
// GET ALL DOCTORS
// ==========================================================

const getAllDoctors = async (req, res) => {

    try {

        const result = await db.query(
            `
            SELECT *
            FROM doctors
            ORDER BY created_at DESC
            `
        );

        res.status(200).json({

            doctors: result.rows

        });

    } catch (error) {

        console.error(
            "[Doctor Fetch Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch doctors"

        });

    }

};

// ==========================================================
// GET DOCTOR BY ID
// ==========================================================

const getDoctorById = async (req, res) => {

    try {

        // ======================================================
        // GET ID FROM URL
        // ======================================================

        const { id } = req.params;

        // ======================================================
        // FIND DOCTOR
        // ======================================================

        const result = await db.query(
            `
            SELECT *
            FROM doctors
            WHERE id = $1
            `,
            [id]
        );

        // ======================================================
        // CHECK IF DOCTOR EXISTS
        // ======================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Doctor not found"

            });

        }

        // ======================================================
        // SUCCESS RESPONSE
        // ======================================================

        res.status(200).json({

            doctor: result.rows[0]

        });

    } catch (error) {

        console.error(
            "[Doctor Fetch Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch doctor"

        });

    }

};

// ==========================================================
// UPDATE DOCTOR
// ==========================================================

const updateDoctor = async (req, res) => {

    try {

        // ======================================================
        // GET DOCTOR ID
        // ======================================================

        const { id } = req.params;

        // ======================================================
        // GET UPDATED DATA
        // ======================================================

        const {
            doctorName,
            specialization,
            phone,
            email,
            department,
            experience
        } = req.body;

        // ======================================================
        // VALIDATION
        // ======================================================

        if (!doctorName || !specialization) {

            return res.status(400).json({

                error: "Doctor name and specialization are required."

            });

        }

        // ======================================================
        // UPDATE DOCTOR
        // ======================================================

        const result = await db.query(
            `
            UPDATE doctors
            SET
                doctor_name = $1,
                specialization = $2,
                phone = $3,
                email = $4,
                department = $5,
                experience = $6
            WHERE id = $7
            RETURNING *;
            `,
            [
                doctorName,
                specialization,
                phone || null,
                email || null,
                department || null,
                experience || null,
                id
            ]
        );

        // ======================================================
        // CHECK IF DOCTOR EXISTS
        // ======================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Doctor not found"

            });

        }

        // ======================================================
        // SUCCESS RESPONSE
        // ======================================================

        res.status(200).json({

            message: "Doctor updated successfully",

            doctor: result.rows[0]

        });

    } catch (error) {

        console.error(
            "[Doctor Update Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to update doctor"

        });

    }

};

// ==========================================================
// DELETE DOCTOR
// ==========================================================

const deleteDoctor = async (req, res) => {

    try {

        // ======================================================
        // GET DOCTOR ID
        // ======================================================

        const { id } = req.params;

        // ======================================================
        // DELETE DOCTOR
        // ======================================================

        const result = await db.query(
            `
            DELETE FROM doctors
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        // ======================================================
        // CHECK IF DOCTOR EXISTS
        // ======================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Doctor not found"

            });

        }

        // ======================================================
        // SUCCESS RESPONSE
        // ======================================================

        res.status(200).json({

            message: "Doctor deleted successfully",

            doctor: result.rows[0]

        });

    } catch (error) {

        console.error(
            "[Doctor Delete Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to delete doctor"

        });

    }

};

// ==========================================================
// EXPORT CONTROLLERS
// ==========================================================

module.exports = {

    addDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor

};