
// server/controllers/patientHistoryController.js

const pool = require("../config/db");

const isValidId = (id) =>
    id !== undefined &&
    id !== null &&
    /^\d+$/.test(String(id)) &&
    Number(id) > 0;

const getRole = (req) =>
    String(req.user?.role || "").toLowerCase();

const getUserId = (req) =>
    req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

// Uses the same patient-to-doctor matching approach as the
// patient and bed controllers.
const doctorPatientCondition = `
    (
        LOWER(TRIM(COALESCE(p.doctor, ''))) =
            LOWER(TRIM(COALESCE(u.full_name, '')))
        OR LOWER(TRIM(COALESCE(p.doctor, ''))) =
            LOWER(TRIM(COALESCE(u.name, '')))
        OR p.doctor = u.id::text
        OR EXISTS (
            SELECT 1
            FROM doctors d
            JOIN users du ON du.id = d.user_id
            WHERE du.id = u.id
              AND (
                  LOWER(TRIM(COALESCE(p.doctor, ''))) =
                      LOWER(TRIM(COALESCE(d.doctor_name, '')))
                  OR p.doctor = d.id::text
              )
        )
    )
`;

async function getAuthorizedPatient(client, req, patientId) {
    const role = getRole(req);
    const userId = getUserId(req);

    if (role === "doctor") {
        if (!isValidId(userId)) {
            return { forbidden: true };
        }

        const result = await client.query(
            `SELECT p.id, p.patient_name
             FROM patients p
             JOIN users u ON u.id = $2
             WHERE p.id = $1
               AND ${doctorPatientCondition}`,
            [Number(patientId), Number(userId)]
        );

        return result.rows.length
            ? { patient: result.rows[0] }
            : { notFound: true };
    }

    const result = await client.query(
        `SELECT id, patient_name
         FROM patients
         WHERE id = $1`,
        [Number(patientId)]
    );

    return result.rows.length
        ? { patient: result.rows[0] }
        : { notFound: true };
}

// --------------------------------------------------
// GET PATIENT MEDICAL HISTORY
// --------------------------------------------------

const getPatientMedicalHistory = async (req, res) => {
    const { patientId } = req.params;

    if (!isValidId(patientId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid patient ID.",
        });
    }

    const client = await pool.connect();

    try {
        const access = await getAuthorizedPatient(
            client,
            req,
            patientId
        );

        if (access.forbidden) {
            return res.status(403).json({
                success: false,
                message: "Doctor account could not be verified.",
            });
        }

        if (access.notFound) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied.",
            });
        }

        const [admissions, appointments, clinicalNotes] =
            await Promise.all([
                client.query(
                    `SELECT a.*, b.bed_number, b.ward
                     FROM admissions a
                     LEFT JOIN beds b ON b.id = a.bed_id
                     WHERE a.patient_id = $1
                     ORDER BY a.admission_date DESC NULLS LAST, a.id DESC`,
                    [Number(patientId)]
                ),

                client.query(
                    `SELECT *
                     FROM appointments
                     WHERE patient_id = $1
                     ORDER BY appointment_date DESC NULLS LAST`,
                    [Number(patientId)]
                ),

                client.query(
                    `SELECT *
                     FROM clinical_notes
                     WHERE patient_id = $1
                     ORDER BY id DESC`,
                    [Number(patientId)]
                ),
            ]);

        const activeAdmissions = admissions.rows.filter(
            (item) => String(item.status || "").toLowerCase() === "admitted"
        );

        return res.status(200).json({
            success: true,
            patient: access.patient,
            currentAdmission: activeAdmissions[0] || null,
            admissions: admissions.rows,
            appointments: appointments.rows,
            clinicalNotes: clinicalNotes.rows,
        });
    } catch (error) {
        console.error("getPatientMedicalHistory:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve patient medical history.",
        });
    } finally {
        client.release();
    }
};

// --------------------------------------------------
// GET PATIENT STAY HISTORY
// Read-only: never modifies historical records.
// --------------------------------------------------

const getPatientStayHistory = async (req, res) => {
    const { patientId } = req.params;

    if (!isValidId(patientId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid patient ID.",
        });
    }

    const client = await pool.connect();

    try {
        const access = await getAuthorizedPatient(
            client,
            req,
            patientId
        );

        if (access.forbidden) {
            return res.status(403).json({
                success: false,
                message: "Doctor account could not be verified.",
            });
        }

        if (access.notFound) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied.",
            });
        }

        const result = await client.query(
            `SELECT
                h.*,
                a.status AS admission_status,
                a.admission_date
             FROM patient_stay_history h
             LEFT JOIN admissions a ON a.id = h.admission_id
             WHERE h.patient_id = $1
             ORDER BY h.start_date DESC NULLS LAST, h.id DESC`,
            [Number(patientId)]
        );

        return res.status(200).json({
            success: true,
            patient: access.patient,
            stays: result.rows,
        });
    } catch (error) {
        console.error("getPatientStayHistory:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve patient stay history.",
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getPatientMedicalHistory,
    getPatientStayHistory,
};
