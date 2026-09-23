// ==========================================================
// CLINICAL NOTE CONTROLLER
// Handles creation, retrieval, updating and deletion
// of clinical notes with RBAC enforcement
// ==========================================================

const db = require("../config/db");

// ==========================================================
// HELPER: DOCTOR ASSIGNMENT GUARD
// ==========================================================
const verifyDoctorPatientAssignment = async (userId, patientId) => {
    const docCheck = await db.query(
        `
        SELECT u.full_name, u.email, d.id as doc_table_id, d.doctor_name 
        FROM users u 
        LEFT JOIN doctors d ON (
            LOWER(TRIM(d.email)) = LOWER(TRIM(u.email)) 
            OR LOWER(TRIM(d.doctor_name)) = LOWER(TRIM(u.full_name))
        )
        WHERE u.id = $1
        `,
        [userId]
    );

    const docInfo = docCheck.rows[0] || {};

    const patientCheck = await db.query(
        `SELECT doctor FROM patients WHERE id = $1`,
        [patientId]
    );

    if (patientCheck.rows.length === 0) return { exists: false, isAssigned: false };

    const patientDoc = String(patientCheck.rows[0].doctor || "").toLowerCase().trim();

    const isAssigned = 
        patientDoc !== "" && (
            patientDoc === (docInfo.full_name || "").toLowerCase().trim() ||
            patientDoc === (docInfo.doctor_name || "").toLowerCase().trim() ||
            patientDoc === String(userId).toLowerCase().trim() ||
            (docInfo.doc_table_id && patientDoc === String(docInfo.doc_table_id).toLowerCase().trim())
        );

    return { exists: true, isAssigned };
};

// ==========================================================
// ADD CLINICAL NOTE
// ==========================================================
const addClinicalNote = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { noteType, title, content } = req.body;
        const { id: authorId, role } = req.user;
        const normalizedRole = String(role || "").toLowerCase().trim();

        if (!content || content.trim() === "") {
            return res.status(400).json({
                error: "Clinical note content is required"
            });
        }

        // Check Doctor Assignment
        if (normalizedRole === "doctor") {
            const { exists, isAssigned } = await verifyDoctorPatientAssignment(authorId, patientId);
            if (!exists) return res.status(404).json({ error: "Patient not found" });
            if (!isAssigned) {
                return res.status(403).json({
                    error: "Access denied: You can only add clinical notes for your assigned patients."
                });
            }
        } else {
            const patientResult = await db.query(
                `SELECT id FROM patients WHERE id = $1`,
                [patientId]
            );
            if (patientResult.rows.length === 0) {
                return res.status(404).json({ error: "Patient not found" });
            }
        }

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
                noteType || (normalizedRole === "doctor" ? "Clinical Impression" : "Nursing Note"),
                title || null,
                content.trim()
            ]
        );

        res.status(201).json({
            message: "Clinical note added successfully",
            note: result.rows[0]
        });
    } catch (error) {
        console.error("[Clinical Note Add Error]:", error);
        res.status(500).json({ error: "Failed to add clinical note" });
    }
};

// ==========================================================
// GET ALL NOTES FOR A PATIENT
// ==========================================================
const getPatientClinicalNotes = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { id: userId, role } = req.user;
        const normalizedRole = String(role || "").toLowerCase().trim();

        if (normalizedRole === "doctor") {
            const { isAssigned } = await verifyDoctorPatientAssignment(userId, patientId);
            if (!isAssigned) {
                return res.status(403).json({
                    error: "Access denied: You can only view clinical notes for your assigned patients."
                });
            }
        }

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
            INNER JOIN users u ON cn.author_id = u.id
            WHERE cn.patient_id = $1
            ORDER BY cn.created_at DESC;
            `,
            [patientId]
        );

        res.status(200).json({ notes: result.rows });
    } catch (error) {
        console.error("[Clinical Notes Fetch Error]:", error);
        res.status(500).json({ error: "Failed to fetch clinical notes" });
    }
};

// ==========================================================
// GET SINGLE CLINICAL NOTE
// ==========================================================
const getClinicalNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        const normalizedRole = String(role || "").toLowerCase().trim();

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
            INNER JOIN users u ON cn.author_id = u.id
            WHERE cn.id = $1;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Clinical note not found" });
        }

        const note = result.rows[0];

        if (normalizedRole === "doctor") {
            const { isAssigned } = await verifyDoctorPatientAssignment(userId, note.patient_id);
            if (!isAssigned) {
                return res.status(403).json({
                    error: "Access denied: You do not have permission to view this note."
                });
            }
        }

        res.status(200).json({ note });
    } catch (error) {
        console.error("[Clinical Note Fetch Error]:", error);
        res.status(500).json({ error: "Failed to fetch clinical note" });
    }
};

// ==========================================================
// UPDATE CLINICAL NOTE
// ==========================================================
const updateClinicalNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { noteType, title, content } = req.body;
        const { id: userId, role } = req.user;
        const normalizedRole = String(role || "").toLowerCase().trim();

        if (!content || content.trim() === "") {
            return res.status(400).json({ error: "Clinical note content is required" });
        }

        const noteCheck = await db.query(
            `SELECT * FROM clinical_notes WHERE id = $1`,
            [id]
        );

        if (noteCheck.rows.length === 0) {
            return res.status(404).json({ error: "Clinical note not found" });
        }

        const existingNote = noteCheck.rows[0];

        // Enforce update permissions: Doctors on assigned patients or original authors
        if (normalizedRole === "doctor") {
            const { isAssigned } = await verifyDoctorPatientAssignment(userId, existingNote.patient_id);
            if (!isAssigned && existingNote.author_id !== userId) {
                return res.status(403).json({
                    error: "Access denied: You can only edit notes for your assigned patients."
                });
            }
        } else if (normalizedRole === "staff" || normalizedRole === "nurse") {
            if (existingNote.author_id !== userId) {
                return res.status(403).json({
                    error: "Access denied: Staff can only edit notes created by themselves."
                });
            }
        }

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
                noteType || existingNote.note_type,
                title !== undefined ? title : existingNote.title,
                content.trim(),
                id
            ]
        );

        res.status(200).json({
            message: "Clinical note updated successfully",
            note: result.rows[0]
        });
    } catch (error) {
        console.error("[Clinical Note Update Error]:", error);
        res.status(500).json({ error: "Failed to update clinical note" });
    }
};

// ==========================================================
// DELETE CLINICAL NOTE (ADMIN ONLY)
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
            return res.status(404).json({ error: "Clinical note not found" });
        }

        res.status(200).json({
            message: "Clinical note deleted successfully",
            note: result.rows[0]
        });
    } catch (error) {
        console.error("[Clinical Note Delete Error]:", error);
        res.status(500).json({ error: "Failed to delete clinical note" });
    }
};

module.exports = {
    addClinicalNote,
    getPatientClinicalNotes,
    getClinicalNoteById,
    updateClinicalNote,
    deleteClinicalNote
};