// ==========================================================
// PATIENT CONTROLLER
// Handles all patient-related operations with role-based filtering
// ==========================================================

const db = require("../config/db");

// ==========================================================
// ADD PATIENT
// ==========================================================
const addPatient = async (req, res) => {
    try {
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

        if (!patientName || !age || !gender) {
            return res.status(400).json({
                error: "Patient name, age and gender are required."
            });
        }

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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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

        return res.status(201).json({
            message: "Patient added successfully",
            patient: result.rows[0]
        });
    } catch (error) {
        console.error("[ADD PATIENT ERROR]:", error);
        return res.status(500).json({
            error: "Failed to add patient."
        });
    }
};

// ==========================================================
// GET ALL PATIENTS (ROLE-FILTERED)
// ==========================================================
const getAllPatients = async (req, res) => {
    try {
        const { id: userId, role } = req.user || {};
        const normalizedRole = String(role || "").toLowerCase().trim();

        let query = "";
        let queryParams = [];

        if (normalizedRole === "doctor") {
            // Doctors see patients assigned to them (matching assigned doctor column by name or ID)
            query = `
                SELECT DISTINCT p.*
                FROM patients p
                LEFT JOIN users u ON u.id = $1
                LEFT JOIN doctors d ON (
                    LOWER(TRIM(d.email)) = LOWER(TRIM(u.email)) 
                    OR LOWER(TRIM(d.doctor_name)) = LOWER(TRIM(u.full_name))
                )
                WHERE 
                    p.doctor IS NOT NULL AND (
                        LOWER(TRIM(p.doctor)) = LOWER(TRIM(u.full_name))
                        OR LOWER(TRIM(p.doctor)) = LOWER(TRIM(d.doctor_name))
                        OR TRIM(p.doctor) = CAST($1 AS TEXT)
                        OR (d.id IS NOT NULL AND TRIM(p.doctor) = CAST(d.id AS TEXT))
                    )
                ORDER BY p.created_at DESC
            `;
            queryParams = [userId];
        } else if (normalizedRole === "staff" || normalizedRole === "nurse") {
            // Staff see actively admitted patients or ward patients
            query = `
                SELECT *
                FROM patients
                WHERE ward IS NOT NULL OR bed_number IS NOT NULL
                ORDER BY created_at DESC
            `;
        } else {
            // Admin sees all patients
            query = `
                SELECT *
                FROM patients
                ORDER BY created_at DESC
            `;
        }

        const result = await db.query(query, queryParams);

        return res.status(200).json({
            patients: result.rows
        });
    } catch (error) {
        console.error("[GET ALL PATIENTS ERROR]:", error);
        return res.status(500).json({
            error: "Failed to fetch patients."
        });
    }
};

// ==========================================================
// GET PATIENT BY ID (ROLE-GUARDED)
// ==========================================================
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user || {};
        const normalizedRole = String(role || "").toLowerCase().trim();

        const result = await db.query(
            `
            SELECT *
            FROM patients
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Patient not found."
            });
        }

        const patient = result.rows[0];

        // Enforce doctor ownership guard if accessed directly via URL
        if (normalizedRole === "doctor") {
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
            const patientDoc = String(patient.doctor || "").toLowerCase().trim();
            
            const isAssigned = 
                patientDoc !== "" && (
                    patientDoc === (docInfo.full_name || "").toLowerCase().trim() ||
                    patientDoc === (docInfo.doctor_name || "").toLowerCase().trim() ||
                    patientDoc === String(userId).toLowerCase().trim() ||
                    (docInfo.doc_table_id && patientDoc === String(docInfo.doc_table_id).toLowerCase().trim())
                );

            if (!isAssigned) {
                return res.status(403).json({
                    error: "Access denied: You are not the assigned doctor for this patient."
                });
            }
        }

        return res.status(200).json({
            patient
        });
    } catch (error) {
        console.error("[GET PATIENT ERROR]:", error);
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

        if (!patientName || !age || !gender) {
            return res.status(400).json({
                error: "Patient name, age and gender are required."
            });
        }

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

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Patient not found."
            });
        }

        return res.status(200).json({
            message: "Patient updated successfully",
            patient: result.rows[0]
        });
    } catch (error) {
        console.error("[UPDATE PATIENT ERROR]:", error);
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

        const result = await db.query(
            `
            DELETE FROM patients
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Patient not found."
            });
        }

        return res.status(200).json({
            message: "Patient deleted successfully",
            patient: result.rows[0]
        });
    } catch (error) {
        console.error("[DELETE PATIENT ERROR]:", error);
        return res.status(500).json({
            error: "Failed to delete patient."
        });
    }
};

module.exports = {
    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
};