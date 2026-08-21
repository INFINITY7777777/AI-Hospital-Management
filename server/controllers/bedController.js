// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");


// ==========================================================
// ADD BED
// Creates a new hospital bed
// ==========================================================

const addBed = async (req, res) => {

    try {

        // ==========================================================
        // GET DATA FROM REQUEST BODY
        // ==========================================================

        const {
            bedNumber,
            ward,
            bedType,
            status
        } = req.body;


        // ==========================================================
        // VALIDATION
        // ==========================================================

        if (!bedNumber || !ward) {

            return res.status(400).json({
                error: "Bed number and ward are required"
            });

        }


        // ==========================================================
        // INSERT BED
        // ==========================================================

        const result = await db.query(

            `
            INSERT INTO beds (
                bed_number,
                ward,
                bed_type,
                status
            )

            VALUES (
                $1,
                $2,
                $3,
                $4
            )

            RETURNING *;
            `,

            [
                bedNumber,
                ward,
                bedType || null,
                status || "Available"
            ]

        );


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(201).json({

            message: "Bed added successfully",

            bed: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Add Bed Error]:",
            error
        );


        // ==========================================================
        // DUPLICATE BED NUMBER
        // PostgreSQL unique constraint
        // ==========================================================

        if (error.code === "23505") {

            return res.status(400).json({
                error: "Bed number already exists"
            });

        }


        return res.status(500).json({
            error: "Failed to add bed"
        });

    }

};



// ==========================================================
// GET ALL BEDS
// Returns all hospital beds
// ==========================================================

const getAllBeds = async (req, res) => {

    try {

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

            LEFT JOIN patients
                ON beds.patient_id = patients.id

            ORDER BY beds.id ASC;
            `

        );


        return res.status(200).json({

            beds: result.rows

        });

    }


    catch (error) {

        console.error(
            "[Get Beds Error]:",
            error
        );


        return res.status(500).json({
            error: "Failed to fetch beds"
        });

    }

};



// ==========================================================
// GET BED BY ID
// Returns a single bed
// ==========================================================

const getBedById = async (req, res) => {

    try {

        // ==========================================================
        // GET BED ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // FETCH BED
        // ==========================================================

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

            LEFT JOIN patients
                ON beds.patient_id = patients.id

            WHERE beds.id = $1;
            `,

            [id]

        );


        // ==========================================================
        // BED NOT FOUND
        // ==========================================================

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Bed not found"
            });

        }


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            bed: result.rows[0]

        });

    }


    catch (error) {

        console.error(
            "[Get Bed Error]:",
            error
        );


        return res.status(500).json({
            error: "Failed to fetch bed"
        });

    }

};



// ==========================================================
// UPDATE BED
// Updates bed information
//
// IMPORTANT:
// Occupied status should only be controlled through
// assignBed() and releaseBed().
// ==========================================================

const updateBed = async (req, res) => {

    try {

        // ==========================================================
        // GET BED ID
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // GET DATA FROM REQUEST BODY
        // ==========================================================

        const {
            bedNumber,
            ward,
            bedType,
            status
        } = req.body;


        // ==========================================================
        // VALIDATION
        // ==========================================================

        if (!bedNumber || !ward) {

            return res.status(400).json({
                error: "Bed number and ward are required"
            });

        }


        // ==========================================================
        // CHECK CURRENT BED
        // ==========================================================

        const currentBedResult = await db.query(

            `
            SELECT

                id,
                status,
                patient_id

            FROM beds

            WHERE id = $1;
            `,

            [id]

        );


        // ==========================================================
        // BED NOT FOUND
        // ==========================================================

        if (currentBedResult.rows.length === 0) {

            return res.status(404).json({
                error: "Bed not found"
            });

        }


        const currentBed = currentBedResult.rows[0];


        // ==========================================================
        // DETERMINE REQUESTED STATUS
        // ==========================================================

        const newStatus = status || currentBed.status;


        // ==========================================================
        // PREVENT MANUAL OCCUPIED STATUS
        // ==========================================================

        if (
            newStatus === "Occupied" &&
            currentBed.status !== "Occupied"
        ) {

            return res.status(400).json({

                error:
                    "A bed can only become Occupied by assigning a patient"

            });

        }


        // ==========================================================
        // PREVENT MANUAL RELEASE
        // ==========================================================

        if (
            currentBed.status === "Occupied" &&
            newStatus !== "Occupied"
        ) {

            return res.status(400).json({

                error:
                    "An occupied bed must be released using the Release Bed action"

            });

        }


        // ==========================================================
        // UPDATE BED
        // ==========================================================

        const result = await db.query(

            `
            UPDATE beds

            SET

                bed_number = $1,
                ward = $2,
                bed_type = $3,
                status = $4

            WHERE id = $5

            RETURNING *;
            `,

            [
                bedNumber,
                ward,
                bedType || null,
                newStatus,
                id
            ]

        );


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            message: "Bed updated successfully",

            bed: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Update Bed Error]:",
            error
        );


        // ==========================================================
        // DUPLICATE BED NUMBER
        // ==========================================================

        if (error.code === "23505") {

            return res.status(400).json({
                error: "Bed number already exists"
            });

        }


        return res.status(500).json({
            error: "Failed to update bed"
        });

    }

};



// ==========================================================
// DELETE BED
// Deletes a bed only when it is NOT occupied
// ==========================================================

const deleteBed = async (req, res) => {

    try {

        // ==========================================================
        // GET BED ID
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // CHECK BED STATUS BEFORE DELETE
        // ==========================================================

        const bedResult = await db.query(

            `
            SELECT

                id,
                bed_number,
                status,
                patient_id

            FROM beds

            WHERE id = $1;
            `,

            [id]

        );


        // ==========================================================
        // BED NOT FOUND
        // ==========================================================

        if (bedResult.rows.length === 0) {

            return res.status(404).json({
                error: "Bed not found"
            });

        }


        const bed = bedResult.rows[0];


        // ==========================================================
        // PREVENT DELETING OCCUPIED BED
        // ==========================================================

        if (bed.status === "Occupied") {

            return res.status(400).json({

                error:
                    "Occupied beds cannot be deleted. Release the bed first."

            });

        }


        // ==========================================================
        // DELETE BED
        // ==========================================================

        const result = await db.query(

            `
            DELETE FROM beds

            WHERE id = $1

            RETURNING *;
            `,

            [id]

        );


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            message: "Bed deleted successfully",

            bed: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Delete Bed Error]:",
            error
        );


        return res.status(500).json({
            error: "Failed to delete bed"
        });

    }

};



// ==========================================================
// ASSIGN BED TO PATIENT
//
// Changes bed status to Occupied
// Links bed to patient
// Links bed to patient's active admission
// ==========================================================

const assignBed = async (req, res) => {

    try {

        // ==========================================================
        // GET BED ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // GET PATIENT ID FROM REQUEST BODY
        // ==========================================================

        const { patientId } = req.body;


        // ==========================================================
        // VALIDATE PATIENT ID
        // ==========================================================

        if (!patientId) {

            return res.status(400).json({
                error: "Patient ID is required"
            });

        }


        // ==========================================================
        // CHECK IF PATIENT EXISTS
        // ==========================================================

        const patientResult = await db.query(

            `
            SELECT

                id,
                patient_name

            FROM patients

            WHERE id = $1;
            `,

            [patientId]

        );


        if (patientResult.rows.length === 0) {

            return res.status(404).json({
                error: "Patient not found"
            });

        }


        // ==========================================================
        // CHECK IF BED EXISTS
        // ==========================================================

        const bedResult = await db.query(

            `
            SELECT *

            FROM beds

            WHERE id = $1;
            `,

            [id]

        );


        if (bedResult.rows.length === 0) {

            return res.status(404).json({
                error: "Bed not found"
            });

        }


        const bed = bedResult.rows[0];


        // ==========================================================
        // CHECK BED STATUS
        // ==========================================================

        if (bed.status !== "Available") {

            return res.status(400).json({

                error:
                    "Bed is not available for assignment"

            });

        }


        // ==========================================================
        // CHECK IF PATIENT ALREADY HAS ANOTHER OCCUPIED BED
        // ==========================================================

        const existingBedResult = await db.query(

            `
            SELECT

                id,
                bed_number

            FROM beds

            WHERE patient_id = $1
            AND status = 'Occupied'

            LIMIT 1;
            `,

            [patientId]

        );


        if (existingBedResult.rows.length > 0) {

            return res.status(400).json({

                error:
                    "Patient already has another bed assigned"

            });

        }


        // ==========================================================
        // CHECK PATIENT'S ACTIVE ADMISSION
        // ==========================================================

        const admissionResult = await db.query(

            `
            SELECT

                id,
                bed_id,
                status

            FROM admissions

            WHERE patient_id = $1

            AND status = 'Admitted'

            ORDER BY created_at DESC

            LIMIT 1;
            `,

            [patientId]

        );


        // ==========================================================
        // ASSIGN BED TO PATIENT
        // ==========================================================

        const result = await db.query(

            `
            UPDATE beds

            SET

                patient_id = $1,
                status = 'Occupied'

            WHERE id = $2

            RETURNING *;
            `,

            [
                patientId,
                id
            ]

        );


        // ==========================================================
        // LINK BED TO ACTIVE ADMISSION
        // ==========================================================

        if (admissionResult.rows.length > 0) {

            const admission = admissionResult.rows[0];


            // ======================================================
            // CHECK IF ADMISSION ALREADY HAS ANOTHER BED
            // ======================================================

            if (
                admission.bed_id &&
                admission.bed_id !== Number(id)
            ) {

                // Undo assignment

                await db.query(

                    `
                    UPDATE beds

                    SET

                        patient_id = NULL,
                        status = 'Available'

                    WHERE id = $1;
                    `,

                    [id]

                );


                return res.status(400).json({

                    error:
                        "Patient's active admission already has another bed assigned"

                });

            }


            // ======================================================
            // UPDATE ADMISSION
            // ======================================================

            await db.query(

                `
                UPDATE admissions

                SET

                    bed_id = $1,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $2;
                `,

                [
                    id,
                    admission.id
                ]

            );

        }


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            message: "Bed assigned successfully",

            bed: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Assign Bed Error]:",
            error
        );


        return res.status(500).json({

            error:
                "Failed to assign bed"

        });

    }

};



// ==========================================================
// RELEASE BED
//
// Removes patient from bed
// Changes status back to Available
// Removes bed from patient's active admission
// ==========================================================

const releaseBed = async (req, res) => {

    try {

        // ==========================================================
        // GET BED ID
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // CHECK IF BED EXISTS
        // ==========================================================

        const bedResult = await db.query(

            `
            SELECT

                id,
                bed_number,
                patient_id,
                status

            FROM beds

            WHERE id = $1;
            `,

            [id]

        );


        if (bedResult.rows.length === 0) {

            return res.status(404).json({
                error: "Bed not found"
            });

        }


        const bed = bedResult.rows[0];


        // ==========================================================
        // CHECK IF BED IS OCCUPIED
        // ==========================================================

        if (bed.status !== "Occupied") {

            return res.status(400).json({

                error:
                    "Bed is not currently occupied"

            });

        }


        // ==========================================================
        // RELEASE BED
        // ==========================================================

        const result = await db.query(

            `
            UPDATE beds

            SET

                patient_id = NULL,
                status = 'Available'

            WHERE id = $1

            RETURNING *;
            `,

            [id]

        );


        // ==========================================================
        // REMOVE BED FROM ACTIVE ADMISSION
        // ==========================================================

        if (bed.patient_id) {

            await db.query(

                `
                UPDATE admissions

                SET

                    bed_id = NULL,
                    updated_at = CURRENT_TIMESTAMP

                WHERE patient_id = $1

                AND status = 'Admitted'

                AND bed_id = $2;
                `,

                [
                    bed.patient_id,
                    id
                ]

            );

        }


        // ==========================================================
        // SUCCESS RESPONSE
        // ==========================================================

        return res.status(200).json({

            message:
                "Bed released successfully",

            bed:
                result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Release Bed Error]:",
            error
        );


        return res.status(500).json({

            error:
                "Failed to release bed"

        });

    }

};



// ==========================================================
// EXPORT CONTROLLERS
// ==========================================================

module.exports = {

    addBed,

    getAllBeds,

    getBedById,

    updateBed,

    deleteBed,

    assignBed,

    releaseBed

};