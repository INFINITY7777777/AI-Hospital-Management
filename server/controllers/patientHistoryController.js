// ==========================================================
// PATIENT HISTORY CONTROLLER
// Handles complete medical history of a patient
// ==========================================================

// ==========================================================
// DATABASE CONNECTION
// ==========================================================

const db = require("../config/db");

// ==========================================================
// GET PATIENT MEDICAL HISTORY
// ==========================================================

const getPatientMedicalHistory = async (req, res) => {

    try {

        // ======================================================
        // GET PATIENT ID
        // ======================================================

        const { patientId } = req.params;


        // ======================================================
        // CHECK PATIENT EXISTS
        // ======================================================

        const patientResult = await db.query(

            `
            SELECT
                id,
                patient_name
            FROM patients
            WHERE id = $1
            `,

            [patientId]

        );


        // ======================================================
        // PATIENT NOT FOUND
        // ======================================================

        if (patientResult.rows.length === 0) {

            return res.status(404).json({

                error: "Patient not found"

            });

        }


        // ======================================================
        // GET ADMISSION HISTORY
        // ======================================================

        const admissionsResult = await db.query(

            `
            SELECT

                id,
                patient_id,
                bed_id,
                admission_date,
                admission_reason,
                diagnosis,
                status,
                discharge_date,
                discharge_reason,
                created_at,
                updated_at

            FROM admissions

            WHERE patient_id = $1

            ORDER BY admission_date DESC, id DESC
            `,

            [patientId]

        );


        // ======================================================
        // GET APPOINTMENT HISTORY
        // ======================================================

        const appointmentsResult = await db.query(

            `
            SELECT

                id,
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                reason,
                status,
                created_at

            FROM appointments

            WHERE patient_id = $1

            ORDER BY appointment_date DESC, appointment_time DESC, id DESC
            `,

            [patientId]

        );


        // ======================================================
        // GET CLINICAL NOTES
        // ======================================================

        const clinicalNotesResult = await db.query(

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

            ORDER BY cn.created_at DESC
            `,

            [patientId]

        );


        // ======================================================
        // SEND COMPLETE HISTORY
        // ======================================================

        return res.status(200).json({

            success: true,

            patient: patientResult.rows[0],

            admissions: admissionsResult.rows,

            appointments: appointmentsResult.rows,

            clinicalNotes: clinicalNotesResult.rows

        });

    }

    catch (error) {

        console.error(
            "[Patient Medical History Error]:",
            error
        );


        return res.status(500).json({

            error: "Failed to fetch patient medical history"

        });

    }

};

// ==========================================================
// GET PATIENT STAY HISTORY
// GET /api/patient-history/patient/:patientId/stays
// ==========================================================

const getPatientStayHistory = async (req, res) => {

    try {

        // ======================================================
        // GET PATIENT ID
        // ======================================================

        const { patientId } = req.params;


        // ======================================================
        // CHECK PATIENT EXISTS
        // ======================================================

        const patientResult = await db.query(

            `
            SELECT
                id,
                patient_name
            FROM patients
            WHERE id = $1
            `,

            [patientId]

        );


        // ======================================================
        // PATIENT NOT FOUND
        // ======================================================

        if (patientResult.rows.length === 0) {

            return res.status(404).json({

                error: "Patient not found"

            });

        }


        // ======================================================
        // GET STAY HISTORY
        // ======================================================

        const stayResult = await db.query(

            `
            SELECT

                psh.id,
                psh.patient_id,
                psh.admission_id,
                psh.bed_id,

                psh.ward,
                psh.bed_number,

                psh.start_date,
                psh.end_date,

                psh.status,

                psh.created_at,
                psh.updated_at

            FROM patient_stay_history psh

            WHERE psh.patient_id = $1

            ORDER BY
                psh.start_date DESC,
                psh.id DESC
            `,

            [patientId]

        );


        // ======================================================
        // SUCCESS
        // ======================================================

        return res.status(200).json({

            success: true,

            patient: patientResult.rows[0],

            stays: stayResult.rows

        });

    }

    catch (error) {

        console.error(

            "[Patient Stay History Error]:",

            error

        );


        return res.status(500).json({

            error: "Failed to fetch patient stay history"

        });

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getPatientMedicalHistory,
    getPatientStayHistory,
    

};