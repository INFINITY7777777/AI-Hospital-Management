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
// GET ALL DOCTORS (Combines 'doctors' table and 'users' with role='doctor')
// ==========================================================
const getAllDoctors = async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT 
                d.id,
                d.doctor_name,
                d.specialization,
                d.email,
                d.phone,
                d.department,
                d.experience
            FROM doctors d

            UNION ALL

            SELECT 
                (u.id + 100000) AS id,
                u.full_name AS doctor_name,
                COALESCE(u.specialization, 'General Physician') AS specialization,
                u.email,
                u.phone,
                COALESCE(u.department, 'General') AS department,
                NULL AS experience -- Safe NULL fallback since users table has no experience column
            FROM users u
            WHERE LOWER(TRIM(u.role)) = 'doctor'
              AND NOT EXISTS (
                  SELECT 1 FROM doctors d2 
                  WHERE LOWER(TRIM(d2.email)) = LOWER(TRIM(u.email))
                     OR LOWER(TRIM(d2.doctor_name)) = LOWER(TRIM(u.full_name))
              )
            ORDER BY doctor_name ASC;
            `
        );

        res.status(200).json({
            doctors: result.rows
        });
    } catch (error) {
        console.error("[Doctor Fetch Error]:", error);
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
        const { id } = req.params;

        const result = await db.query(
            `
            SELECT 
                d.id,
                d.doctor_name,
                d.specialization,
                d.email,
                d.phone,
                d.department,
                d.experience
            FROM doctors d
            WHERE d.id = $1

            UNION ALL

            SELECT 
                (u.id + 100000) AS id,
                u.full_name AS doctor_name,
                COALESCE(u.specialization, 'General Physician') AS specialization,
                u.email,
                u.phone,
                COALESCE(u.department, 'General') AS department,
                NULL AS experience
            FROM users u
            WHERE LOWER(TRIM(u.role)) = 'doctor'
              AND (u.id + 100000) = $1
              AND NOT EXISTS (
                  SELECT 1 FROM doctors d2 
                  WHERE LOWER(TRIM(d2.email)) = LOWER(TRIM(u.email))
                     OR LOWER(TRIM(d2.doctor_name)) = LOWER(TRIM(u.full_name))
              )
            LIMIT 1;
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Doctor profile not found"
            });
        }

        res.status(200).json({
            doctor: result.rows[0]
        });

    } catch (error) {
        console.error("[Doctor Fetch Error]:", error);
        res.status(500).json({
            error: "Failed to fetch doctor details"
        });
    }
};

// ==========================================================
// UPDATE DOCTOR (Admin can edit any; Doctor can edit self only)
// ==========================================================
// ==========================================================
// UPDATE DOCTOR
// ==========================================================
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = String(req.user?.role || "").toLowerCase();
        const userId = req.user?.id;

        const {
            doctorName,
            doctor_name,
            specialization,
            phone,
            email,
            department,
            experience
        } = req.body;

        const nameToSave = doctorName || doctor_name;

        if (!nameToSave || !specialization) {
            return res.status(400).json({
                error: "Doctor name and specialization are required."
            });
        }

        const numericId = Number(id);

        let existingDoctor = await db.query(
            "SELECT id, email, doctor_name FROM doctors WHERE id = $1",
            [numericId]
        );

        let isUserTableDoctor = false;
        let actualUserId = null;

        if (existingDoctor.rows.length === 0) {
            actualUserId = numericId > 100000 ? numericId - 100000 : numericId;
            const userDoc = await db.query(
                "SELECT id, email, full_name AS doctor_name FROM users WHERE id = $1 AND LOWER(TRIM(role)) = 'doctor'",
                [actualUserId]
            );

            if (userDoc.rows.length > 0) {
                existingDoctor = userDoc;
                isUserTableDoctor = true;
            }
        }

        if (!existingDoctor || existingDoctor.rows.length === 0) {
            return res.status(404).json({ error: "Doctor profile not found." });
        }

        const targetDoctor = existingDoctor.rows[0];

        if (userRole === "doctor") {
            const userAccount = await db.query(
                "SELECT id, email, full_name FROM users WHERE id = $1",
                [userId]
            );

            const currentUser = userAccount.rows[0];

            const isSelf =
                currentUser &&
                (currentUser.email?.toLowerCase().trim() === targetDoctor.email?.toLowerCase().trim() ||
                 currentUser.full_name?.toLowerCase().trim() === targetDoctor.doctor_name?.toLowerCase().trim() ||
                 Number(userId) === Number(actualUserId));

            if (!isSelf) {
                return res.status(403).json({
                    error: "You do not have permission to edit another doctor's profile."
                });
            }
        }

        let updatedResult;

        if (isUserTableDoctor) {
            // Update user record first
            await db.query(
                `
                UPDATE users
                SET full_name = $1,
                    specialization = $2,
                    phone = $3,
                    email = $4,
                    department = $5
                WHERE id = $6;
                `,
                [
                    nameToSave,
                    specialization,
                    phone || null,
                    email || null,
                    department || null,
                    actualUserId
                ]
            );

            // Check if already present in doctors table
            const inDoctors = await db.query(
                "SELECT id FROM doctors WHERE LOWER(email) = LOWER($1) OR LOWER(doctor_name) = LOWER($2)",
                [email || "", nameToSave]
            );

            if (inDoctors.rows.length > 0) {
                updatedResult = await db.query(
                    `
                    UPDATE doctors
                    SET doctor_name = $1, specialization = $2, phone = $3, email = $4, department = $5, experience = $6
                    WHERE id = $7
                    RETURNING *;
                    `,
                    [
                        nameToSave,
                        specialization,
                        phone || null,
                        email || null,
                        department || null,
                        experience !== undefined && experience !== null ? Number(experience) : 0,
                        inDoctors.rows[0].id
                    ]
                );
            } else {
                updatedResult = await db.query(
                    `
                    INSERT INTO doctors (doctor_name, specialization, phone, email, department, experience)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *;
                    `,
                    [
                        nameToSave,
                        specialization,
                        phone || null,
                        email || null,
                        department || null,
                        experience !== undefined && experience !== null ? Number(experience) : 0
                    ]
                );
            }
        } else {
            updatedResult = await db.query(
                `
                UPDATE doctors
                SET doctor_name = $1,
                    specialization = $2,
                    phone = $3,
                    email = $4,
                    department = $5,
                    experience = $6
                WHERE id = $7
                RETURNING *;
                `,
                [
                    nameToSave,
                    specialization,
                    phone || null,
                    email || null,
                    department || null,
                    experience !== undefined && experience !== null ? Number(experience) : 0,
                    numericId
                ]
            );
        }

        return res.status(200).json({
            message: "Doctor updated successfully",
            doctor: updatedResult.rows[0] || targetDoctor
        });

    } catch (error) {
        console.error("[Doctor Update Error]:", error);
        return res.status(500).json({ error: "Failed to update doctor." });
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