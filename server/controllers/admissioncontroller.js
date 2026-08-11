// ==========================================================
// ADMISSION CONTROLLER
// Handles all admission-related database operations.
// ==========================================================

const pool = require("../config/db");


// ==========================================================
// CREATE ADMISSION
// POST /api/admissions
// ==========================================================

// ==========================================================
// CREATE ADMISSION
// POST /api/admissions
// Creates admission and assigns bed safely in one transaction
// ==========================================================

const addAdmission = async (req, res) => {

    // ==========================================================
    // START DATABASE CLIENT
    // ==========================================================

    const client = await pool.connect();

    try {

        const {
            patientId,
            bedId,
            admissionDate,
            admissionReason,
            diagnosis
        } = req.body;


        // ==========================================================
        // VALIDATION
        // ==========================================================

        if (!patientId) {

            return res.status(400).json({
                error: "Patient is required"
            });

        }


        if (!admissionDate) {

            return res.status(400).json({
                error: "Admission date is required"
            });

        }


        // ==========================================================
        // START TRANSACTION
        // ==========================================================

        await client.query("BEGIN");


        // ==========================================================
        // CHECK PATIENT
        // ==========================================================

        const patientResult = await client.query(

            `
            SELECT
                id,
                patient_name
            FROM patients
            WHERE id = $1
            `,

            [patientId]

        );


        if (patientResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Patient not found"
            });

        }


        // ==========================================================
        // CHECK FOR EXISTING ACTIVE ADMISSION
        // ==========================================================

        const activeAdmissionResult = await client.query(

            `
            SELECT
                id,
                bed_id
            FROM admissions
            WHERE patient_id = $1
            AND status = 'Admitted'
            LIMIT 1
            `,

            [patientId]

        );


        if (activeAdmissionResult.rows.length > 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({

                error:
                    "Patient already has an active admission"

            });

        }


        // ==========================================================
        // CHECK BED
        // ==========================================================

        if (bedId) {

            const bedResult = await client.query(

                `
                SELECT
                    id,
                    bed_number,
                    status,
                    patient_id
                FROM beds
                WHERE id = $1
                FOR UPDATE
                `,

                [bedId]

            );


            // ======================================================
            // BED NOT FOUND
            // ======================================================

            if (bedResult.rows.length === 0) {

                await client.query("ROLLBACK");

                return res.status(404).json({

                    error: "Bed not found"

                });

            }


            const bed = bedResult.rows[0];


            // ======================================================
            // BED NOT AVAILABLE
            // ======================================================

            if (bed.status !== "Available") {

                await client.query("ROLLBACK");

                return res.status(400).json({

                    error:
                        "Selected bed is not available"

                });

            }


            // ======================================================
            // SAFETY CHECK
            // ======================================================

            if (bed.patient_id !== null) {

                await client.query("ROLLBACK");

                return res.status(400).json({

                    error:
                        "Selected bed is already assigned to a patient"

                });

            }

        }


        // ==========================================================
        // CREATE ADMISSION
        // ==========================================================

        const admissionResult = await client.query(

            `
            INSERT INTO admissions
            (
                patient_id,
                bed_id,
                admission_date,
                admission_reason,
                diagnosis,
                status
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                'Admitted'
            )

            RETURNING *
            `,

            [

                patientId,

                bedId || null,

                admissionDate,

                admissionReason || "",

                diagnosis || ""

            ]

        );


        // ==========================================================
        // ASSIGN BED
        // ==========================================================

        if (bedId) {

            await client.query(

                `
                UPDATE beds

                SET

                    status = 'Occupied',

                    patient_id = $1

                WHERE id = $2
                `,

                [

                    patientId,

                    bedId

                ]

            );

        }


        // ==========================================================
        // COMMIT TRANSACTION
        // ==========================================================

        await client.query("COMMIT");


        // ==========================================================
        // SUCCESS
        // ==========================================================

        return res.status(201).json({

            message:
                "Patient admitted successfully",

            admission:
                admissionResult.rows[0]

        });

    }

    catch (error) {

        // ==========================================================
        // ROLLBACK
        // ==========================================================

        try {

            await client.query("ROLLBACK");

        }

        catch (rollbackError) {

            console.error(
                "[Admission Rollback Error]:",
                rollbackError
            );

        }


        // ==========================================================
        // LOG ERROR
        // ==========================================================

        console.error(

            "[Admission Error]:",

            error

        );


        // ==========================================================
        // SEND ERROR
        // ==========================================================

        return res.status(500).json({

            error:
                "Failed to create admission"

        });

    }

    finally {

        // ==========================================================
        // RELEASE DATABASE CONNECTION
        // ==========================================================

        client.release();

    }

};


// ==========================================================
// GET ALL ADMISSIONS
// GET /api/admissions
// ==========================================================

const getAdmissions = async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT
                a.id,
                a.patient_id,
                p.patient_name,

                a.bed_id,
                b.bed_number,

                a.admission_date,
                a.admission_reason,
                a.diagnosis,
                a.status,
                a.discharge_date,
                a.discharge_reason,

                a.created_at,
                a.updated_at

            FROM admissions a

            INNER JOIN patients p
                ON a.patient_id = p.id

            LEFT JOIN beds b
                ON a.bed_id = b.id

            ORDER BY a.created_at DESC`

        );


        return res.status(200).json({

            admissions: result.rows

        });

    }

    catch (error) {

        console.error(

            "[Get Admissions Error]:",

            error

        );


        return res.status(500).json({

            error: "Failed to fetch admissions"

        });

    }

};


// ==========================================================
// GET ADMISSION BY ID
// GET /api/admissions/:id
// ==========================================================

const getAdmissionById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(

            `SELECT
                a.id,
                a.patient_id,
                p.patient_name,
                p.age,
                p.gender,
                p.blood_group,
                p.phone,

                a.bed_id,
                b.bed_number,
                b.ward,
                b.bed_type,

                a.admission_date,
                a.admission_reason,
                a.diagnosis,
                a.status,
                a.discharge_date,
                a.discharge_reason,

                a.created_at,
                a.updated_at

            FROM admissions a

            INNER JOIN patients p
                ON a.patient_id = p.id

            LEFT JOIN beds b
                ON a.bed_id = b.id

            WHERE a.id = $1`,

            [id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Admission not found"

            });

        }


        return res.status(200).json({

            admission: result.rows[0]

        });

    }

    catch (error) {

        console.error(

            "[Admission Details Error]:",

            error

        );


        return res.status(500).json({

            error: "Failed to fetch admission"

        });

    }

};


// ==========================================================
// UPDATE ADMISSION
// PUT /api/admissions/:id
// ==========================================================

const updateAdmission = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            admissionDate,
            admissionReason,
            diagnosis
        } = req.body;


        const result = await pool.query(

            `UPDATE admissions

             SET
                admission_date = COALESCE($1, admission_date),
                admission_reason = COALESCE($2, admission_reason),
                diagnosis = COALESCE($3, diagnosis),
                updated_at = CURRENT_TIMESTAMP

             WHERE id = $4

             RETURNING *`,

            [
                admissionDate || null,
                admissionReason || null,
                diagnosis || null,
                id
            ]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Admission not found"

            });

        }


        return res.status(200).json({

            message: "Admission updated successfully",

            admission: result.rows[0]

        });

    }

    catch (error) {

        console.error(

            "[Update Admission Error]:",

            error

        );


        return res.status(500).json({

            error: "Failed to update admission"

        });

    }

};


// ==========================================================
// DISCHARGE PATIENT
// PUT /api/admissions/:id/discharge
// Discharges patient and releases bed safely in one transaction
// ==========================================================

const dischargePatient = async (req, res) => {

    // ==========================================================
    // GET DATABASE CLIENT
    // ==========================================================

    const client = await pool.connect();

    try {

        const { id } = req.params;

        const {
            dischargeDate,
            dischargeReason
        } = req.body;


        // ==========================================================
        // START TRANSACTION
        // ==========================================================

        await client.query("BEGIN");


        // ==========================================================
        // FIND ADMISSION
        // ==========================================================

        const admissionResult = await client.query(

            `
            SELECT
                id,
                patient_id,
                bed_id,
                status
            FROM admissions
            WHERE id = $1
            FOR UPDATE
            `,

            [id]

        );


        // ==========================================================
        // ADMISSION NOT FOUND
        // ==========================================================

        if (admissionResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({

                error: "Admission not found"

            });

        }


        const admission = admissionResult.rows[0];


        // ==========================================================
        // CHECK CURRENT STATUS
        // ==========================================================

        if (admission.status === "Discharged") {

            await client.query("ROLLBACK");

            return res.status(400).json({

                error: "Patient is already discharged"

            });

        }


        // ==========================================================
        // UPDATE ADMISSION
        // ==========================================================

        const result = await client.query(

            `
            UPDATE admissions

            SET

                status = 'Discharged',

                discharge_date =
                    COALESCE($1, CURRENT_DATE),

                discharge_reason = $2,

                updated_at = CURRENT_TIMESTAMP

            WHERE id = $3

            RETURNING *
            `,

            [

                dischargeDate || null,

                dischargeReason || "",

                id

            ]

        );


        // ==========================================================
        // RELEASE BED
        // ==========================================================

        if (admission.bed_id) {

            await client.query(

                `
                UPDATE beds

                SET

                    status = 'Available',

                    patient_id = NULL

                WHERE id = $1
                `,

                [admission.bed_id]

            );

        }


        // ==========================================================
        // COMMIT TRANSACTION
        // ==========================================================

        await client.query("COMMIT");


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            message:
                "Patient discharged successfully",

            admission:
                result.rows[0]

        });

    }

    catch (error) {

        // ==========================================================
        // ROLLBACK
        // ==========================================================

        try {

            await client.query("ROLLBACK");

        }

        catch (rollbackError) {

            console.error(

                "[Discharge Rollback Error]:",

                rollbackError

            );

        }


        // ==========================================================
        // LOG ERROR
        // ==========================================================

        console.error(

            "[Discharge Error]:",

            error

        );


        // ==========================================================
        // ERROR RESPONSE
        // ==========================================================

        return res.status(500).json({

            error:
                "Failed to discharge patient"

        });

    }

    finally {

        // ==========================================================
        // RELEASE DATABASE CONNECTION
        // ==========================================================

        client.release();

    }

};


// ==========================================================
// DELETE ADMISSION
// DELETE /api/admissions/:id
// Only discharged admissions can be deleted.
// ==========================================================

const deleteAdmission = async (req, res) => {

    try {

        const { id } = req.params;


        // ==========================================================
        // FIND ADMISSION
        // ==========================================================

        const admissionResult = await pool.query(

            `SELECT
                id,
                status
             FROM admissions
             WHERE id = $1`,

            [id]

        );


        // ==========================================================
        // CHECK IF ADMISSION EXISTS
        // ==========================================================

        if (admissionResult.rows.length === 0) {

            return res.status(404).json({

                error: "Admission not found"

            });

        }


        const admission = admissionResult.rows[0];


        // ==========================================================
        // PREVENT DELETING ACTIVE ADMISSION
        // ==========================================================

        if (admission.status !== "Discharged") {

            return res.status(400).json({

                error:
                    "Active admissions cannot be deleted. Discharge the patient first."

            });

        }


        // ==========================================================
        // DELETE ADMISSION
        // ==========================================================

        const result = await pool.query(

            `DELETE FROM admissions
             WHERE id = $1
             RETURNING *`,

            [id]

        );


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            message: "Admission deleted successfully",

            admission: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(

            "[Delete Admission Error]:",

            error

        );


        return res.status(500).json({

            error: "Failed to delete admission"

        });

    }

};

// ==========================================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================================

module.exports = {

    addAdmission,

    getAdmissions,

    getAdmissionById,

    updateAdmission,

    dischargePatient,

    deleteAdmission

};