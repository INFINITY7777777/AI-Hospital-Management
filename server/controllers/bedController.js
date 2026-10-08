const pool = require("../config/db");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const isValidId = (id) =>
    id !== undefined &&
    id !== null &&
    /^\d+$/.test(String(id)) &&
    Number(id) > 0;

const getRole = (req) =>
    String(req.user?.role || "").toLowerCase();

const getUserId = (req) =>
    req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

const doctorPatientCondition = (patientAlias = "p", userAlias = "u") => `
    LOWER(TRIM(COALESCE(${patientAlias}.doctor, ''))) =
    LOWER(TRIM(COALESCE(${userAlias}.full_name, '')))
`;

// --------------------------------------------------
// ADD BED
// --------------------------------------------------

const addBed = async (req, res) => {
    const { bed_number, ward, bed_type } = req.body;

    if (!bed_number || !String(bed_number).trim() ||
        !ward || !String(ward).trim()) {
        return res.status(400).json({
            success: false,
            message: "Bed number and ward are required.",
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO beds (bed_number, ward, bed_type, status, patient_id)
             VALUES ($1, $2, $3, 'Available', NULL)
             RETURNING *`,
            [
                String(bed_number).trim(),
                String(ward).trim(),
                bed_type || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Bed added successfully.",
            bed: result.rows[0],
        });
    } catch (error) {
        console.error("addBed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add bed.",
        });
    }
};

// --------------------------------------------------
// GET ALL BEDS
// Doctors see all available beds and occupied beds
// assigned to their patients.
// --------------------------------------------------

const getAllBeds = async (req, res) => {
    const role = getRole(req);
    const userId = getUserId(req);

    try {
        let query = `
            SELECT 
                b.*, 
                p.patient_name, 
                p.phone AS patient_phone, 
                p.age AS patient_age, 
                p.gender AS patient_gender, 
                p.doctor
            FROM beds b
            LEFT JOIN patients p ON p.id = b.patient_id
        `;
        let params = [];

        if (role === "doctor") {
            if (!isValidId(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Doctor account could not be verified.",
                });
            }

            query += `
                JOIN users u ON u.id = $1
                WHERE (
                    (
                        LOWER(COALESCE(b.status, '')) = 'available'
                        AND b.patient_id IS NULL
                    )
                    OR (
                        LOWER(COALESCE(b.status, '')) = 'occupied'
                        AND b.patient_id IS NOT NULL
                        AND ${doctorPatientCondition("p", "u")}
                    )
                )
            `;
            params = [Number(userId)];
        }

        query += ` ORDER BY b.id ASC`;

        const result = await pool.query(query, params);

        return res.status(200).json({
            success: true,
            beds: result.rows,
        });
    } catch (error) {
        console.error("getAllBeds:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve beds.",
        });
    }
};

// --------------------------------------------------
// GET BED BY ID
// --------------------------------------------------

const getBedById = async (req, res) => {
    const { id } = req.params;
    const role = getRole(req);
    const userId = getUserId(req);

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid bed ID.",
        });
    }

    try {
        let query = `
            SELECT 
                b.*, 
                p.patient_name, 
                p.phone AS patient_phone, 
                p.age AS patient_age, 
                p.gender AS patient_gender, 
                p.doctor
            FROM beds b
            LEFT JOIN patients p ON p.id = b.patient_id
            WHERE b.id = $1
        `;
        let params = [Number(id)];

        if (role === "doctor") {
            if (!isValidId(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Doctor account could not be verified.",
                });
            }

            query = `
                SELECT 
                    b.*, 
                    p.patient_name, 
                    p.phone AS patient_phone, 
                    p.age AS patient_age, 
                    p.gender AS patient_gender, 
                    p.doctor
                FROM beds b
                LEFT JOIN patients p ON p.id = b.patient_id
                JOIN users u ON u.id = $2
                WHERE b.id = $1
                  AND (
                    (
                        LOWER(COALESCE(b.status, '')) = 'available'
                        AND b.patient_id IS NULL
                    )
                    OR (
                        LOWER(COALESCE(b.status, '')) = 'occupied'
                        AND b.patient_id IS NOT NULL
                        AND ${doctorPatientCondition("p", "u")}
                    )
                  )
            `;
            params = [Number(id), Number(userId)];
        }

        const result = await pool.query(query, params);

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Bed not found or access denied.",
            });
        }

        return res.status(200).json({
            success: true,
            bed: result.rows[0],
        });
    } catch (error) {
        console.error("getBedById:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve bed.",
        });
    }
};

// --------------------------------------------------
// UPDATE BED DETAILS
// Occupied beds cannot be edited.
// --------------------------------------------------

const updateBed = async (req, res) => {
    const { id } = req.params;
    const { bed_number, ward, bed_type } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid bed ID.",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existing = await client.query(
            "SELECT * FROM beds WHERE id = $1 FOR UPDATE",
            [Number(id)]
        );

        if (!existing.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Bed not found.",
            });
        }

        const bed = existing.rows[0];

        if (
            String(bed.status).toLowerCase() === "occupied" ||
            bed.patient_id !== null
        ) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Occupied or assigned beds cannot be edited.",
            });
        }

        const result = await client.query(
            `UPDATE beds
             SET bed_number = $1,
                 ward = $2,
                 bed_type = $3
             WHERE id = $4
             RETURNING *`,
            [
                bed_number === undefined ? bed.bed_number : bed_number,
                ward === undefined ? bed.ward : ward,
                bed_type === undefined ? bed.bed_type : bed_type,
                Number(id),
            ]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Bed updated successfully.",
            bed: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("updateBed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update bed.",
        });
    } finally {
        client.release();
    }
};

// --------------------------------------------------
// DELETE BED
// Historical references prevent deletion.
// --------------------------------------------------

const deleteBed = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid bed ID.",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existing = await client.query(
            "SELECT * FROM beds WHERE id = $1 FOR UPDATE",
            [Number(id)]
        );

        if (!existing.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Bed not found.",
            });
        }

        const bed = existing.rows[0];

        if (
            String(bed.status).toLowerCase() === "occupied" ||
            bed.patient_id !== null
        ) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "An occupied or assigned bed cannot be deleted.",
            });
        }

        const history = await client.query(
            "SELECT id FROM patient_stay_history WHERE bed_id = $1 LIMIT 1",
            [Number(id)]
        );

        if (history.rows.length) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "This bed has historical stay records and cannot be deleted.",
            });
        }

        const admissions = await client.query(
            "SELECT id FROM admissions WHERE bed_id = $1 LIMIT 1",
            [Number(id)]
        );

        if (admissions.rows.length) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "This bed is referenced by admission records and cannot be deleted.",
            });
        }

        await client.query("DELETE FROM beds WHERE id = $1", [
            Number(id),
        ]);

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Bed deleted successfully.",
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("deleteBed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete bed.",
        });
    } finally {
        client.release();
    }
};

// --------------------------------------------------
// ASSIGN BED TO AN ACTIVE ADMISSION
// --------------------------------------------------

const assignBed = async (req, res) => {
    const { patient_id, bed_id } = req.body;

    if (!isValidId(patient_id) || !isValidId(bed_id)) {
        return res.status(400).json({
            success: false,
            message: "Valid patient_id and bed_id are required.",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const patientResult = await client.query(
            "SELECT id FROM patients WHERE id = $1 FOR UPDATE",
            [Number(patient_id)]
        );

        if (!patientResult.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        const existingOccupiedBed = await client.query(
            `SELECT id
             FROM beds
             WHERE patient_id = $1
               AND LOWER(COALESCE(status, '')) = 'occupied'
             LIMIT 1`,
            [Number(patient_id)]
        );

        if (existingOccupiedBed.rows.length) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "This patient already has an occupied bed. Reconcile that record before assigning another bed.",
            });
        }

        const admissionResult = await client.query(
            `SELECT *
             FROM admissions
             WHERE patient_id = $1
               AND LOWER(COALESCE(status, '')) = 'admitted'
             FOR UPDATE`,
            [Number(patient_id)]
        );

        if (admissionResult.rows.length !== 1) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Exactly one active admission is required to assign a bed.",
            });
        }

        const admission = admissionResult.rows[0];

        if (admission.bed_id !== null) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "This admission already has a bed assigned.",
            });
        }

        const bedResult = await client.query(
            "SELECT * FROM beds WHERE id = $1 FOR UPDATE",
            [Number(bed_id)]
        );

        if (!bedResult.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Bed not found.",
            });
        }

        const bed = bedResult.rows[0];

        if (
            String(bed.status).toLowerCase() !== "available" ||
            bed.patient_id !== null
        ) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Selected bed is not available.",
            });
        }

        const activeStay = await client.query(
            `SELECT id
             FROM patient_stay_history
             WHERE admission_id = $1
               AND LOWER(COALESCE(status, '')) = 'active'
             LIMIT 1`,
            [admission.id]
        );

        if (activeStay.rows.length) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "An active stay already exists for this admission.",
            });
        }

        await client.query(
            `UPDATE beds
             SET status = 'Occupied', patient_id = $1
             WHERE id = $2`,
            [Number(patient_id), Number(bed_id)]
        );

        await client.query(
            "UPDATE admissions SET bed_id = $1 WHERE id = $2",
            [Number(bed_id), admission.id]
        );

        await client.query(
            `INSERT INTO patient_stay_history (
                patient_id, admission_id, bed_id,
                ward, bed_number, start_date, status
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'Active')`,
            [
                Number(patient_id),
                admission.id,
                Number(bed_id),
                bed.ward,
                bed.bed_number,
            ]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Bed assigned successfully.",
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("assignBed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to assign bed.",
        });
    } finally {
        client.release();
    }
};

// --------------------------------------------------
// RELEASE BED
// --------------------------------------------------

const releaseBed = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid bed ID.",
        });
    }

    let client;
    let transactionStarted = false;

    try {
        client = await pool.connect();
        await client.query("BEGIN");
        transactionStarted = true;

        const bedResult = await client.query(
            "SELECT * FROM beds WHERE id = $1 FOR UPDATE",
            [Number(id)]
        );

        if (bedResult.rows.length !== 1) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Bed not found.",
            });
        }

        const bed = bedResult.rows[0];

        if (
            String(bed.status).toLowerCase() !== "occupied" ||
            bed.patient_id === null
        ) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Bed is not occupied or has no assigned patient.",
            });
        }

        const patientId = Number(bed.patient_id);

        const patientResult = await client.query(
            "SELECT id FROM patients WHERE id = $1 FOR UPDATE",
            [patientId]
        );

        if (patientResult.rows.length !== 1) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "The assigned patient does not exist. No records were changed.",
            });
        }

        const admissionResult = await client.query(
            `SELECT id, patient_id, bed_id, status
             FROM admissions
             WHERE patient_id = $1
               AND LOWER(TRIM(COALESCE(status, ''))) = 'admitted'
             FOR UPDATE`,
            [patientId]
        );

        const activeAdmissions = admissionResult.rows;

        if (activeAdmissions.length > 1) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Multiple active admissions exist for this patient. Resolve the conflicting admissions before releasing the bed.",
            });
        }

        let admission = activeAdmissions[0] || null;
        let activeStays = [];

        if (admission) {
            if (
                admission.bed_id !== null &&
                Number(admission.bed_id) !== Number(id)
            ) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    success: false,
                    message: "The patient's active admission references a different bed. No records were changed.",
                });
            }

            const stayResult = await client.query(
                `SELECT id, patient_id, admission_id, bed_id, start_date
                 FROM patient_stay_history
                 WHERE admission_id = $1
                   AND LOWER(TRIM(COALESCE(status, ''))) = 'active'
                 FOR UPDATE`,
                [admission.id]
            );

            activeStays = stayResult.rows;

            const conflictingStay = activeStays.some(
                (stay) =>
                    Number(stay.patient_id) !== patientId ||
                    Number(stay.bed_id) !== Number(id)
            );

            if (conflictingStay || activeStays.length > 1) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    success: false,
                    message: "Conflicting active stay-history records exist. No records were changed.",
                });
            }
        } else {
            const conflictingStays = await client.query(
                `SELECT id
                 FROM patient_stay_history
                 WHERE (
                     bed_id = $1 OR patient_id = $2
                 )
                   AND LOWER(TRIM(COALESCE(status, ''))) = 'active'
                 FOR UPDATE`,
                [Number(id), patientId]
            );

            if (conflictingStays.rows.length > 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    success: false,
                    message: "Active stay history exists without a matching active admission. Reconcile the records before releasing this bed.",
                });
            }
        }

        if (admission && activeStays.length === 1) {
            const stay = activeStays[0];

            const stayUpdate = await client.query(
                `UPDATE patient_stay_history
                 SET status = 'Completed',
                     end_date = CURRENT_DATE,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1
                   AND status = 'Active'
                 RETURNING id`,
                [stay.id]
            );

            if (stayUpdate.rows.length !== 1) {
                throw new Error("Could not complete the active stay-history record.");
            }
        }

        if (admission && admission.bed_id !== null) {
            const admissionUpdate = await client.query(
                `UPDATE admissions
                 SET bed_id = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1
                   AND bed_id = $2
                 RETURNING id`,
                [admission.id, Number(id)]
            );

            if (admissionUpdate.rows.length !== 1) {
                throw new Error("Could not clear the admission's bed assignment.");
            }
        }

        const bedUpdate = await client.query(
            `UPDATE beds
             SET status = 'Available',
                 patient_id = NULL
             WHERE id = $1
               AND patient_id = $2
               AND LOWER(TRIM(COALESCE(status, ''))) = 'occupied'
             RETURNING id`,
            [Number(id), patientId]
        );

        if (bedUpdate.rows.length !== 1) {
            throw new Error("Bed could not be released because its assignment changed.");
        }

        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(200).json({
            success: true,
            message: admission
                ? "Bed released successfully. The admission remains active."
                : "Bed released successfully. No active admission or active stay history was present.",
        });
    } catch (error) {
        if (client && transactionStarted) {
            await client.query("ROLLBACK").catch(() => {});
            transactionStarted = false;
        }

        console.error("[Release Bed Error]", {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
        });

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to release bed.",
        });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    addBed,
    getAllBeds,
    getBedById,
    updateBed,
    deleteBed,
    assignBed,
    releaseBed,
};