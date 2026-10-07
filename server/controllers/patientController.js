const pool = require("../config/db");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const isValidId = (id) =>
    id !== undefined && id !== null && /^\d+$/.test(String(id)) &&
    Number(id) > 0;

const getRole = (req) =>
    String(req.user?.role || "").toLowerCase();

const getUserId = (req) =>
    req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

const doctorPatientCondition = (patientAlias = "p", userAlias = "u") => `
    (
        LOWER(TRIM(COALESCE(${patientAlias}.doctor, ''))) = LOWER(TRIM(COALESCE(${userAlias}.full_name, '')))
        OR LOWER(TRIM(COALESCE(${patientAlias}.doctor, ''))) LIKE CONCAT('%', LOWER(TRIM(SPLIT_PART(${userAlias}.full_name, ' ', 1))), '%')
        OR LOWER(TRIM(COALESCE(${patientAlias}.doctor, ''))) = LOWER(TRIM(COALESCE(${userAlias}.email, '')))
    )
`;

const getPatientSelect = () => `
    SELECT
        p.*,
        COALESCE(current_bed.admission_date, p.admission_date) AS admission_date,
        current_bed.bed_number AS current_bed_number,
        current_bed.ward AS current_ward,
        current_bed.bed_number AS bed_number,
        current_bed.ward AS ward
    FROM patients p
    LEFT JOIN LATERAL (
        SELECT b.bed_number, b.ward, a.admission_date
        FROM admissions a
        JOIN beds b ON b.id = a.bed_id
        WHERE a.patient_id = p.id
          AND LOWER(COALESCE(a.status, '')) = 'admitted'
          AND LOWER(COALESCE(b.status, '')) = 'occupied'
          AND b.patient_id = p.id
        ORDER BY a.admission_date DESC NULLS LAST, a.id DESC
        LIMIT 1
    ) current_bed ON TRUE
`;

// --------------------------------------------------
// ADD PATIENT
// --------------------------------------------------

const addPatient = async (req, res) => {
    const {
        patient_name,
        age,
        gender,
        blood_group,
        phone,
        address,
        emergency_contact,
        doctor,
        diagnosis,
        admission_date,
        admissionDate
    } = req.body;

    const finalAdmissionDate = admission_date || admissionDate || null;

    if (!patient_name || !String(patient_name).trim()) {
        return res.status(400).json({
            success: false,
            message: "Patient name is required.",
        });
    }

    const parsedAge = Number(age);

    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 150) {
        return res.status(400).json({
            success: false,
            message: "Age must be between 1 and 150.",
        });
    }

    if (!gender || !String(gender).trim()) {
        return res.status(400).json({
            success: false,
            message: "Gender is required.",
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO patients (
                patient_name, age, gender, blood_group, phone,
                address, emergency_contact, doctor, diagnosis, admission_date
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
            [
                String(patient_name).trim(),
                parsedAge,
                String(gender).trim(),
                blood_group || null,
                phone || null,
                address || null,
                emergency_contact || null,
                doctor || null,
                diagnosis || null,
                finalAdmissionDate
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Patient added successfully.",
            patient: result.rows[0],
        });
    } catch (error) {
        console.error("addPatient:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add patient.",
        });
    }
};

// --------------------------------------------------
// GET ALL PATIENTS
// --------------------------------------------------

const getAllPatients = async (req, res) => {
    const role = getRole(req);
    const userId = getUserId(req);

    try {
        let query = `${getPatientSelect()} ORDER BY p.id DESC`;
        let params = [];

        if (role === "doctor") {
            if (!isValidId(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Doctor account could not be verified.",
                });
            }

            query = `
                ${getPatientSelect()}
                JOIN users u ON u.id = $1
                WHERE ${doctorPatientCondition("p", "u")}
                ORDER BY p.id DESC
            `;
            params = [Number(userId)];
        }

        const result = await pool.query(query, params);

        return res.status(200).json({
            success: true,
            patients: result.rows,
        });
    } catch (error) {
        console.error("getAllPatients:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve patients.",
        });
    }
};

// --------------------------------------------------
// GET PATIENT BY ID
// --------------------------------------------------

const getPatientById = async (req, res) => {
    const { id } = req.params;
    const role = getRole(req);
    const userId = getUserId(req);

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid patient ID.",
        });
    }

    try {
        let query = `${getPatientSelect()} WHERE p.id = $1`;
        let params = [Number(id)];

        if (role === "doctor") {
            if (!isValidId(userId)) {
                return res.status(403).json({
                    success: false,
                    message: "Doctor account could not be verified.",
                });
            }

            query = `
                ${getPatientSelect()}
                JOIN users u ON u.id = $2
                WHERE p.id = $1
                  AND ${doctorPatientCondition("p", "u")}
            `;
            params = [Number(id), Number(userId)];
        }

        const result = await pool.query(query, params);

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied.",
            });
        }

        return res.status(200).json({
            success: true,
            patient: result.rows[0],
        });
    } catch (error) {
        console.error("getPatientById:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve patient.",
        });
    }
};

// --------------------------------------------------
// UPDATE PATIENT
// --------------------------------------------------

const updatePatient = async (req, res) => {
    const { id } = req.params;
    const role = getRole(req);
    const userId = getUserId(req);

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid patient ID.",
        });
    }

    const {
        patient_name,
        patientName,
        age,
        gender,
        blood_group,
        bloodGroup,
        phone,
        address,
        emergency_contact,
        emergencyContact,
        doctor,
        diagnosis,
        admission_date,
        admissionDate
    } = req.body;

    const finalName = patient_name || patientName;
    const finalBloodGroup = blood_group || bloodGroup;
    const finalEmergencyContact = emergency_contact || emergencyContact;
    const finalAdmissionDate = admission_date || admissionDate;

    if (
        age !== undefined &&
        (!Number.isInteger(Number(age)) ||
            Number(age) < 1 ||
            Number(age) > 150)
    ) {
        return res.status(400).json({
            success: false,
            message: "Age must be between 1 and 150.",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        let lockQuery = `
            SELECT p.*
            FROM patients p
            WHERE p.id = $1
            FOR UPDATE
        `;
        let lockParams = [Number(id)];

        if (role === "doctor") {
            if (!isValidId(userId)) {
                await client.query("ROLLBACK");
                return res.status(403).json({
                    success: false,
                    message: "Doctor account could not be verified.",
                });
            }

            lockQuery = `
                SELECT p.*
                FROM patients p
                JOIN users u ON u.id = $2
                WHERE p.id = $1
                  AND ${doctorPatientCondition("p", "u")}
                FOR UPDATE OF p
            `;
            lockParams = [Number(id), Number(userId)];
        }

        const existing = await client.query(lockQuery, lockParams);

        if (!existing.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Patient not found or access denied.",
            });
        }

        const current = existing.rows[0];

        const updatedDoctor =
            role === "doctor" ? current.doctor : (doctor ?? current.doctor);

        const newAdmissionDate = finalAdmissionDate === undefined 
            ? current.admission_date 
            : (finalAdmissionDate || null);

        // Update Patients table
        const result = await client.query(
            `UPDATE patients
             SET patient_name = $1,
                 age = $2,
                 gender = $3,
                 blood_group = $4,
                 phone = $5,
                 address = $6,
                 emergency_contact = $7,
                 doctor = $8,
                 diagnosis = $9,
                 admission_date = $10
             WHERE id = $11
             RETURNING *`,
            [
                finalName === undefined ? current.patient_name : String(finalName).trim(),
                age === undefined ? current.age : Number(age),
                gender === undefined ? current.gender : gender,
                finalBloodGroup === undefined ? current.blood_group : finalBloodGroup,
                phone === undefined ? current.phone : phone,
                address === undefined ? current.address : address,
                finalEmergencyContact === undefined ? current.emergency_contact : finalEmergencyContact,
                updatedDoctor,
                diagnosis === undefined ? current.diagnosis : diagnosis,
                newAdmissionDate,
                Number(id),
            ]
        );

        // Synchronize Active Admissions record if it exists
        if (newAdmissionDate) {
            await client.query(
                `UPDATE admissions
                 SET admission_date = $1
                 WHERE patient_id = $2 AND status = 'Admitted'`,
                [newAdmissionDate, Number(id)]
            );

            await client.query(
                `UPDATE patient_stay_history
                 SET start_date = $1
                 WHERE patient_id = $2 AND status = 'Active'`,
                [newAdmissionDate, Number(id)]
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Patient updated successfully.",
            patient: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("updatePatient:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update patient.",
        });
    } finally {
        client.release();
    }
};

// --------------------------------------------------
// DELETE PATIENT
// --------------------------------------------------

const deletePatient = async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid patient ID.",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const patientResult = await client.query(
            "SELECT id FROM patients WHERE id = $1 FOR UPDATE",
            [Number(id)]
        );

        if (!patientResult.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Patient not found.",
            });
        }

        const admissions = await client.query(
            "SELECT id FROM admissions WHERE patient_id = $1 LIMIT 1",
            [Number(id)]
        );

        const stays = await client.query(
            "SELECT id FROM patient_stay_history WHERE patient_id = $1 LIMIT 1",
            [Number(id)]
        );

        const beds = await client.query(
            `SELECT id
             FROM beds
             WHERE patient_id = $1
               AND LOWER(COALESCE(status, '')) = 'occupied'
             LIMIT 1`,
            [Number(id)]
        );

        if (
            admissions.rows.length ||
            stays.rows.length ||
            beds.rows.length
        ) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message:
                    "Patient cannot be deleted because admission, stay-history, or occupied-bed records exist. Preserve the records and discharge/reconcile them through the appropriate workflow.",
            });
        }

        await client.query("DELETE FROM patients WHERE id = $1", [
            Number(id),
        ]);

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Patient deleted successfully.",
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("deletePatient:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete patient.",
        });
    } finally {
        client.release();
    }
};

module.exports = {
    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
};