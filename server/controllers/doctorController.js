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

        // ==========================================================
        // GET DATA FROM REQUEST BODY
        // ==========================================================

        const {

            doctorName,
            specialization,
            phone,
            email,
            department,
            experience

        } = req.body;


        // ==========================================================
        // DISPLAY RECEIVED DATA
        // ==========================================================

        console.log(req.body);


        // ==========================================================
        // INSERT DOCTOR INTO DATABASE
        // ==========================================================

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
                $1, $2, $3, $4, $5, $6
            )
            RETURNING *;
            `,
            [
                doctorName,
                specialization,
                phone,
                email,
                department,
                experience
            ]
        );


        // ==========================================================
        // SEND SUCCESS RESPONSE
        // ==========================================================

        res.status(201).json({

            message: "Doctor added successfully",

            doctor: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Doctor Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to add doctor"

        });

    }

};

// ==========================================================
// GET ALL DOCTORS
// Fetches all doctors from the database
// ==========================================================

const getAllDoctors = async (req, res) => {

    try {

        // ==========================================================
        // FETCH ALL DOCTORS
        // ==========================================================

        const result = await db.query(
            `
            SELECT *
            FROM doctors
            ORDER BY created_at DESC
            `
        );


        // ==========================================================
        // SEND DOCTORS TO FRONTEND
        // ==========================================================

        res.status(200).json({

            doctors: result.rows

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

        console.error(
            "[Doctor Error]:",
            error
        );

        res.status(500).json({

            error: "Failed to fetch doctors"

        });

    }

};

// ==========================================================
// GET DOCTOR BY ID
// Fetches one specific doctor from the database
// ==========================================================

const getDoctorById = async (req, res) => {

    try {

        // ==========================================================
        // GET DOCTOR ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // FIND DOCTOR IN DATABASE
        // ==========================================================

        const result = await db.query(
            `
            SELECT *
            FROM doctors
            WHERE id = $1
            `,
            [id]
        );


        // ==========================================================
        // CHECK IF DOCTOR EXISTS
        // ==========================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Doctor not found"

            });

        }


        // ==========================================================
        // SEND DOCTOR DATA
        // ==========================================================

        res.status(200).json({

            doctor: result.rows[0]

        });

    }


        // ==========================================================
        // ERROR HANDLING
        // ==========================================================

        catch (error) {

            console.error(
                "[Doctor Error]:",
                error
            );

            res.status(500).json({

                error: "Failed to fetch doctor"

            });

        }

    };

    // ==========================================================
    // UPDATE DOCTOR
    // Updates an existing doctor's information
    // ==========================================================

    const updateDoctor = async (req, res) => {

        try {

            // ==========================================================
            // GET DOCTOR ID FROM URL
            // ==========================================================

            const { id } = req.params;


            // ==========================================================
            // GET UPDATED DATA FROM REQUEST BODY
            // ==========================================================

            const {

                doctorName,
                specialization,
                phone,
                email,
                department,
                experience

            } = req.body;


            // ==========================================================
            // UPDATE DOCTOR IN DATABASE
            // ==========================================================

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
                    phone,
                    email,
                    department,
                    experience,
                    id
                ]
            );


            // ==========================================================
            // CHECK IF DOCTOR EXISTS
            // ==========================================================

            if (result.rows.length === 0) {

                return res.status(404).json({

                    error: "Doctor not found"

                });

            }


            // ==========================================================
            // SEND UPDATED DOCTOR
            // ==========================================================

            res.status(200).json({

                message: "Doctor updated successfully",

                doctor: result.rows[0]

            });

        }


        // ==========================================================
        // ERROR HANDLING
        // ==========================================================

        catch (error) {

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
// Deletes an existing doctor from the database
// ==========================================================

const deleteDoctor = async (req, res) => {

    try {

        // ==========================================================
        // GET DOCTOR ID FROM URL
        // ==========================================================

        const { id } = req.params;


        // ==========================================================
        // DELETE DOCTOR FROM DATABASE
        // ==========================================================

        const result = await db.query(
            `
            DELETE FROM doctors
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );


        // ==========================================================
        // CHECK IF DOCTOR EXISTS
        // ==========================================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                error: "Doctor not found"

            });

        }


        // ==========================================================
        // SEND SUCCESS RESPONSE
        // ==========================================================

        res.status(200).json({

            message: "Doctor deleted successfully",

            doctor: result.rows[0]

        });

    }


    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    catch (error) {

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
// EXPORT CONTROLLER
// ==========================================================

module.exports = {

    addDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    
    



};