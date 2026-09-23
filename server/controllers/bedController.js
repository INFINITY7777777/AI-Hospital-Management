const db = require("../config/db");

// ==========================================================
// ADD BED
// ==========================================================
const addBed = async (req, res) => {
    try {
        const { bedNumber, ward, bedType, status } = req.body;

        if (!bedNumber || !ward) {
            return res.status(400).json({ error: "Bed number and ward are required" });
        }

        const result = await db.query(
            `
            INSERT INTO beds (bed_number, ward, bed_type, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
            `,
            [bedNumber, ward, bedType || null, status || "Available"]
        );

        return res.status(201).json({
            message: "Bed added successfully",
            bed: result.rows[0]
        });
    } catch (error) {
        console.error("[Add Bed Error]:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "Bed number already exists" });
        }
        return res.status(500).json({ error: "Failed to add bed" });
    }
};

// ==========================================================
// GET ALL BEDS (Role-filtered Abstraction)
// ==========================================================
const getAllBeds = async (req, res) => {
    try {
        const { role, full_name, name } = req.user;
        const doctorName = full_name || name || "";

        let query = `
            SELECT 
                beds.id,
                beds.bed_number,
                beds.ward,
                beds.bed_type,
                beds.status,
                beds.patient_id,
                beds.created_at,
                patients.patient_name,
                patients.doctor AS patient_doctor
            FROM beds
            LEFT JOIN patients ON beds.patient_id = patients.id
        `;
        const queryParams = [];

        // For Doctor Role: Show all Available/Maintenance beds OR Occupied beds assigned to their patients
        if (role === "doctor") {
            query += `
                WHERE beds.status != 'Occupied' 
                OR LOWER(patients.doctor) LIKE '%' || LOWER($1) || '%'
            `;
            queryParams.push(doctorName);
        }

        query += ` ORDER BY beds.id ASC;`;

        const result = await db.query(query, queryParams);

        return res.status(200).json({
            beds: result.rows
        });
    } catch (error) {
        console.error("[Get Beds Error]:", error);
        return res.status(500).json({ error: "Failed to fetch beds" });
    }
};

// ==========================================================
// GET BED BY ID
// ==========================================================
const getBedById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `
            SELECT 
                beds.id,
                beds.bed_number,
                beds.ward,
                beds.bed_type,
                beds.status,
                beds.patient_id,
                beds.created_at,
                patients.patient_name
            FROM beds
            LEFT JOIN patients ON beds.patient_id = patients.id
            WHERE beds.id = $1;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Bed not found" });
        }

        return res.status(200).json({ bed: result.rows[0] });
    } catch (error) {
        console.error("[Get Bed Error]:", error);
        return res.status(500).json({ error: "Failed to fetch bed" });
    }
};

// ==========================================================
// UPDATE BED
// ==========================================================
const updateBed = async (req, res) => {
    try {
        const { id } = req.params;
        const { bedNumber, ward, bedType, status } = req.body;

        if (!bedNumber || !ward) {
            return res.status(400).json({ error: "Bed number and ward are required" });
        }

        const currentBedResult = await db.query(
            `SELECT id, status, patient_id FROM beds WHERE id = $1;`,
            [id]
        );

        if (currentBedResult.rows.length === 0) {
            return res.status(404).json({ error: "Bed not found" });
        }

        const currentBed = currentBedResult.rows[0];
        const newStatus = status || currentBed.status;

        if (newStatus === "Occupied" && currentBed.status !== "Occupied") {
            return res.status(400).json({
                error: "A bed can only become Occupied by assigning a patient"
            });
        }

        if (currentBed.status === "Occupied" && newStatus !== "Occupied") {
            return res.status(400).json({
                error: "An occupied bed must be released using the Release Bed action"
            });
        }

        const result = await db.query(
            `
            UPDATE beds
            SET bed_number = $1, ward = $2, bed_type = $3, status = $4
            WHERE id = $5
            RETURNING *;
            `,
            [bedNumber, ward, bedType || null, newStatus, id]
        );

        return res.status(200).json({
            message: "Bed updated successfully",
            bed: result.rows[0]
        });
    } catch (error) {
        console.error("[Update Bed Error]:", error);
        if (error.code === "23505") {
            return res.status(400).json({ error: "Bed number already exists" });
        }
        return res.status(500).json({ error: "Failed to update bed" });
    }
};

// ==========================================================
// DELETE BED
// ==========================================================
const deleteBed = async (req, res) => {
    try {
        const { id } = req.params;

        const bedResult = await db.query(
            `SELECT id, bed_number, status, patient_id FROM beds WHERE id = $1;`,
            [id]
        );

        if (bedResult.rows.length === 0) {
            return res.status(404).json({ error: "Bed not found" });
        }

        if (bedResult.rows[0].status === "Occupied") {
            return res.status(400).json({
                error: "Occupied beds cannot be deleted. Release the bed first."
            });
        }

        const result = await db.query(
            `DELETE FROM beds WHERE id = $1 RETURNING *;`,
            [id]
        );

        return res.status(200).json({
            message: "Bed deleted successfully",
            bed: result.rows[0]
        });
    } catch (error) {
        console.error("[Delete Bed Error]:", error);
        return res.status(500).json({ error: "Failed to delete bed" });
    }
};

// ==========================================================
// ASSIGN BED
// ==========================================================
const assignBed = async (req, res) => {
    try {
        const { id } = req.params;
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({ error: "Patient ID is required" });
        }

        const patientResult = await db.query(
            `SELECT id, patient_name FROM patients WHERE id = $1;`,
            [patientId]
        );

        if (patientResult.rows.length === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }

        const bedResult = await db.query(`SELECT * FROM beds WHERE id = $1;`, [id]);

        if (bedResult.rows.length === 0) {
            return res.status(404).json({ error: "Bed not found" });
        }

        const bed = bedResult.rows[0];

        if (bed.status !== "Available") {
            return res.status(400).json({ error: "Bed is not available for assignment" });
        }

        const existingBedResult = await db.query(
            `SELECT id, bed_number FROM beds WHERE patient_id = $1 AND status = 'Occupied' LIMIT 1;`,
            [patientId]
        );

        if (existingBedResult.rows.length > 0) {
            return res.status(400).json({ error: "Patient already has another bed assigned" });
        }

        const admissionResult = await db.query(
            `
            SELECT id, bed_id, status 
            FROM admissions 
            WHERE patient_id = $1 AND status = 'Admitted' 
            ORDER BY created_at DESC LIMIT 1;
            `,
            [patientId]
        );

        const result = await db.query(
            `
            UPDATE beds
            SET patient_id = $1, status = 'Occupied'
            WHERE id = $2
            RETURNING *;
            `,
            [patientId, id]
        );

        if (admissionResult.rows.length > 0) {
            const admission = admissionResult.rows[0];

            if (admission.bed_id && admission.bed_id !== Number(id)) {
                await db.query(
                    `UPDATE beds SET patient_id = NULL, status = 'Available' WHERE id = $1;`,
                    [id]
                );

                return res.status(400).json({
                    error: "Patient's active admission already has another bed assigned"
                });
            }

            await db.query(
                `
                UPDATE admissions 
                SET bed_id = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2;
                `,
                [id, admission.id]
            );
        }

        return res.status(200).json({
            message: "Bed assigned successfully",
            bed: result.rows[0]
        });
    } catch (error) {
        console.error("[Assign Bed Error]:", error);
        return res.status(500).json({ error: "Failed to assign bed" });
    }
};

// ==========================================================
// RELEASE BED
// ==========================================================
const releaseBed = async (req, res) => {
    try {
        const { id } = req.params;

        const bedResult = await db.query(
            `SELECT id, bed_number, patient_id, status FROM beds WHERE id = $1;`,
            [id]
        );

        if (bedResult.rows.length === 0) {
            return res.status(404).json({ error: "Bed not found" });
        }

        const bed = bedResult.rows[0];

        if (bed.status !== "Occupied") {
            return res.status(400).json({ error: "Bed is not currently occupied" });
        }

        const result = await db.query(
            `
            UPDATE beds
            SET patient_id = NULL, status = 'Available'
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (bed.patient_id) {
            await db.query(
                `
                UPDATE admissions
                SET bed_id = NULL, updated_at = CURRENT_TIMESTAMP
                WHERE patient_id = $1 AND status = 'Admitted' AND bed_id = $2;
                `,
                [bed.patient_id, id]
            );
        }

        return res.status(200).json({
            message: "Bed released successfully",
            bed: result.rows[0]
        });
    } catch (error) {
        console.error("[Release Bed Error]:", error);
        return res.status(500).json({ error: "Failed to release bed" });
    }
};

module.exports = {
    addBed,
    getAllBeds,
    getBedById,
    updateBed,
    deleteBed,
    assignBed,
    releaseBed
};