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

        res.status(201).json({

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
        // PostgreSQL unique constraint error
        // ==========================================================

        if (error.code === "23505") {

            return res.status(400).json({

                error: "Bed number already exists"

            });

        }


        res.status(500).json({

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


        res.status(200).json({

            beds: result.rows

        });

    }


    catch (error) {

        console.error(

            "[Get Beds Error]:",

            error

        );


        res.status(500).json({

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

        res.status(200).json({

            bed: result.rows[0]

        });

    }


    catch (error) {

        console.error(

            "[Get Bed Error]:",

            error

        );


        res.status(500).json({

            error: "Failed to fetch bed"

        });

    }

};



// ==========================================================
// UPDATE BED
// Updates bed information
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

                bedType,

                status,

                id

            ]

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

        res.status(200).json({

            message: "Bed updated successfully",

            bed: result.rows[0]

        });

    }


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


        res.status(500).json({

            error: "Failed to update bed"

        });

    }

};



// ==========================================================
// DELETE BED
// Deletes a bed
// ==========================================================

const deleteBed = async (req, res) => {

    try {

        // ==========================================================
        // GET BED ID
        // ==========================================================

        const { id } = req.params;


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

        res.status(200).json({

            message: "Bed deleted successfully",

            bed: result.rows[0]

        });

    }


    catch (error) {

        console.error(

            "[Delete Bed Error]:",

            error

        );


        res.status(500).json({

            error: "Failed to delete bed"

        });

    }

};

// ==========================================================
// ASSIGN BED TO PATIENT
// Changes bed status to Occupied
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
            SELECT id, patient_name

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


        // ==========================================================
        // CHECK BED STATUS
        // ==========================================================

        if (bedResult.rows[0].status !== "Available") {

            return res.status(400).json({

                error:
                    "Bed is not available for assignment"

            });

        }


        // ==========================================================
        // ASSIGN PATIENT TO BED
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
        // SUCCESS RESPONSE
        // ==========================================================

        res.status(200).json({

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


        res.status(500).json({

            error: "Failed to assign bed"

        });

    }

};

// ==========================================================
// RELEASE BED
// Removes patient from bed
// Changes status back to Available
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


        // ==========================================================
        // CHECK IF BED IS OCCUPIED
        // ==========================================================

        if (bedResult.rows[0].status !== "Occupied") {

            return res.status(400).json({

                error: "Bed is not currently occupied"

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
        // SUCCESS RESPONSE
        // ==========================================================

        res.status(200).json({

            message: "Bed released successfully",

            bed: result.rows[0]

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


        res.status(500).json({

            error: "Failed to release bed"

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

    releaseBed,
    

};