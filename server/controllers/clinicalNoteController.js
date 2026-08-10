// ==========================================================
// CLINICAL NOTE CONTROLLER
// Handles creation, retrieval, updating and deletion
// of clinical notes
// ==========================================================


// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");


// ==========================================================
// ADD CLINICAL NOTE
// Creates a new clinical note for a patient
// ==========================================================

const addClinicalNote = async (req, res) => {

    try {

        // ======================================================
        // GET PATIENT ID FROM URL
        // ======================================================

        const { patientId } = req.params;


        // ======================================================
        // GET DATA FROM REQUEST BODY
        // ======================================================

        const {
            noteType,
            title,
            content
        } = req.body;


        // ======================================================
        // GET LOGGED-IN USER
        // verifyToken should attach the user to req.user
        // ======================================================

        const authorId = req.user.id;


        // ======================================================
        // VALIDATION
        // ======================================================

        if (!content || content.trim() === "") {

            return res.status(400).json({

                error: "Clinical note content is required"

            });

        }


        // ======================================================
        // CHECK PATIENT EXISTS
        // ======================================================

        const patientResult = await db.query(

            `
            SELECT id
            FROM patients
            WHERE id = $1
            `,

            [patientId]

        );


        if (patientResult.rows.length === 0) {

            return res.status(404).json({

                error: "Patient not found"

            });

        }


        // ======================================================
        // INSERT CLINICAL NOTE
        // ======================================================

        const result = await db.query(

            `
            INSERT INTO clinical_notes (

                patient_id,
                author_id,
                note_type,
                title,
                content

            )

            VALUES ($1, $2, $3, $4, $5)

            RETURNING *;
            `,

            [

                patientId,
                authorId,
                noteType || "General",
                title || null,
                content.trim()

            ]

        );


        // ======================================================
        // SUCCESS RESPONSE
        // ======================================================

        res.status(201).json({

            message: "Clinical note added successfully",

            note: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[Clinical Note Add Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to add clinical note"

        });

    }

};


// ==========================================================
// GET ALL NOTES FOR A PATIENT
// ==========================================================

const getPatientClinicalNotes = async (req, res) => {

    try {

        // ======================================================
        // GET PATIENT ID
        // ======================================================

        const { patientId } = req.params;


        // ======================================================
        // FETCH NOTES
        // Join users so frontend gets author's name and role
        // ======================================================

        const result = await db.query(

            `
            SELECT

                cn.id,
                cn.patient_id,
                cn.author_id,
                cn.note_type,
                cn.title,
                cn.content,
                cn.created_at,
                cn.updated_at,

                u.full_name AS author_name,
                u.role AS author_role

            FROM clinical_notes cn

            INNER JOIN users u
                ON cn.author_id = u.id

            WHERE cn.patient_id = $1

            ORDER BY cn.created_at DESC;
            `,

            [patientId]

        );


        // ======================================================
        // SEND NOTES
        // ======================================================

        res.status(200).json({

            notes: result.rows

        });

    }

    catch (error) {

        console.error(
            "[Clinical Notes Fetch Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch clinical notes"

        });

    }

};


// ==========================================================
// GET SINGLE CLINICAL NOTE
// ==========================================================

const getClinicalNoteById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(

            `
            SELECT

                cn.id,
                cn.patient_id,
                cn.author_id,
                cn.note_type,
                cn.title,
                cn.content,
                cn.created_at,
                cn.updated_at,

                u.full_name AS author_name,
                u.role AS author_role

            FROM clinical_notes cn

            INNER JOIN users u
                ON cn.author_id = u.id

            WHERE cn.id = $1;
            `,

            [id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Clinical note not found"

            });

        }


        res.status(200).json({

            note: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[Clinical Note Fetch Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch clinical note"

        });

    }

};


// ==========================================================
// UPDATE CLINICAL NOTE
// ==========================================================

const updateClinicalNote = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            noteType,
            title,
            content
        } = req.body;


        // ======================================================
        // VALIDATION
        // ======================================================

        if (!content || content.trim() === "") {

            return res.status(400).json({

                error: "Clinical note content is required"

            });

        }


        // ======================================================
        // UPDATE NOTE
        // ======================================================

        const result = await db.query(

            `
            UPDATE clinical_notes

            SET

                note_type = $1,
                title = $2,
                content = $3,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $4

            RETURNING *;
            `,

            [

                noteType || "General",
                title || null,
                content.trim(),
                id

            ]

        );


        // ======================================================
        // CHECK NOTE EXISTS
        // ======================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Clinical note not found"

            });

        }


        res.status(200).json({

            message: "Clinical note updated successfully",

            note: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[Clinical Note Update Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to update clinical note"

        });

    }

};


// ==========================================================
// DELETE CLINICAL NOTE
// ==========================================================

const deleteClinicalNote = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(

            `
            DELETE FROM clinical_notes

            WHERE id = $1

            RETURNING *;
            `,

            [id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Clinical note not found"

            });

        }


        res.status(200).json({

            message: "Clinical note deleted successfully",

            note: result.rows[0]

        });

    }

    catch (error) {

        console.error(
            "[Clinical Note Delete Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to delete clinical note"

        });

    }

};


// ==========================================================
// EXPORT CONTROLLERS
// ==========================================================

module.exports = {

    addClinicalNote,
    getPatientClinicalNotes,
    getClinicalNoteById,
    updateClinicalNote,
    deleteClinicalNote

};