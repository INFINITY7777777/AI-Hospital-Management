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
        ward,
        bed_number,
        diagnosis,
        admission_date,
        admissionDate
    } = req.body;

    const finalAdmissionDate = admission_date || admissionDate || new Date().toISOString().split("T")[0];

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

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Insert patient record
        const patientResult = await client.query(
            `INSERT INTO patients (
                patient_name, age, gender, blood_group, phone,
                address, emergency_contact, doctor, ward, bed_number, diagnosis, admission_date
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
                ward || null,
                bed_number || null,
                diagnosis || null,
                finalAdmissionDate
            ]
        );

        const newPatient = patientResult.rows[0];

        // If a bed is assigned upon patient creation, sync Bed, Admission, and Stay History
        if (bed_number && ward) {
            const bedRes = await client.query(
                `SELECT id FROM beds WHERE bed_number = $1 AND ward = $2 AND LOWER(status) = 'available' FOR UPDATE`,
                [String(bed_number).trim(), String(ward).trim()]
            );

            if (bedRes.rows.length > 0) {
                const targetBedId = bedRes.rows[0].id;

                // Mark bed occupied
                await client.query(
                    `UPDATE beds SET status = 'Occupied', patient_id = $1 WHERE id = $2`,
                    [newPatient.id, targetBedId]
                );

                // Create active admission
                const admRes = await client.query(
                    `INSERT INTO admissions (patient_id, bed_id, admission_date, diagnosis, status)
                     VALUES ($1, $2, $3, $4, 'Admitted') RETURNING id`,
                    [newPatient.id, targetBedId, finalAdmissionDate, diagnosis || ""]
                );

                // Create active stay history
                await client.query(
                    `INSERT INTO patient_stay_history (patient_id, admission_id, bed_id, ward, bed_number, start_date, status)
                     VALUES ($1, $2, $3, $4, $5, $6, 'Active')`,
                    [newPatient.id, admRes.rows[0].id, targetBedId, String(ward).trim(), String(bed_number).trim(), finalAdmissionDate]
                );
            }
        }

        await client.query("COMMIT");

        return res.status(201).json({
            success: true,
            message: "Patient added successfully.",
            patient: newPatient,
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        console.error("addPatient:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to add patient.",
        });
    } finally {
        client.release();
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
// UPDATE PATIENT (SYNCHRONIZED WITH BEDS & ADMISSIONS)
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
        ward,
        bed_number,
        bedNumber,
        diagnosis,
        admission_date,
        admissionDate
    } = req.body;

    const finalName = patient_name || patientName;
    const finalBloodGroup = blood_group || bloodGroup;
    const finalEmergencyContact = emergency_contact || emergencyContact;
    const finalAdmissionDate = admission_date || admissionDate;
    const finalWard = ward !== undefined ? ward : undefined;
    const finalBedNumber = bed_number || bedNumber;

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

        const updatedDoctor = role === "doctor" ? current.doctor : (doctor ?? current.doctor);
        const newAdmissionDate = finalAdmissionDate === undefined ? current.admission_date : (finalAdmissionDate || null);
        const newWard = finalWard === undefined ? current.ward : (finalWard || null);
        const newBedNumber = finalBedNumber === undefined ? current.bed_number : (finalBedNumber || null);

        // Update main patients table
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
                 ward = $9,
                 bed_number = $10,
                 diagnosis = $11,
                 admission_date = $12
             WHERE id = $13
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
                newWard,
                newBedNumber,
                diagnosis === undefined ? current.diagnosis : diagnosis,
                newAdmissionDate,
                Number(id),
            ]
        );

        // SYNCHRONIZATION WITH BEDS, ADMISSIONS, & STAY HISTORY
        const bedHasChanged = current.ward !== newWard || current.bed_number !== newBedNumber;

        if (bedHasChanged) {
            // 1. Release previous bed if assigned
            if (current.patient_id || current.bed_number) {
                await client.query(
                    `UPDATE beds
                     SET status = 'Available', patient_id = NULL
                     WHERE patient_id = $1`,
                    [Number(id)]
                );
            }

            // 2. If new bed selected, mark as Occupied and assign patient
            if (newWard && newBedNumber) {
                const targetBed = await client.query(
                    `SELECT id FROM beds WHERE ward = $1 AND bed_number = $2 FOR UPDATE`,
                    [newWard, newBedNumber]
                );

                if (targetBed.rows.length > 0) {
                    const bedId = targetBed.rows[0].id;

                    await client.query(
                        `UPDATE beds SET status = 'Occupied', patient_id = $1 WHERE id = $2`,
                        [Number(id), bedId]
                    );

                    // Update or create active admission
                    const activeAdm = await client.query(
                        `SELECT id FROM admissions WHERE patient_id = $1 AND LOWER(status) = 'admitted' LIMIT 1`,
                        [Number(id)]
                    );

                    let admissionId;
                    if (activeAdm.rows.length > 0) {
                        admissionId = activeAdm.rows[0].id;
                        await client.query(
                            `UPDATE admissions SET bed_id = $1, admission_date = $2, diagnosis = $3 WHERE id = $4`,
                            [bedId, newAdmissionDate, diagnosis ?? current.diagnosis, admissionId]
                        );
                    } else {
                        const newAdm = await client.query(
                            `INSERT INTO admissions (patient_id, bed_id, admission_date, diagnosis, status)
                             VALUES ($1, $2, $3, $4, 'Admitted') RETURNING id`,
                            [Number(id), bedId, newAdmissionDate || new Date().toISOString().split("T")[0], diagnosis ?? current.diagnosis]
                        );
                        admissionId = newAdm.rows[0].id;
                    }

                    // Complete prior active stays and create new active stay history
                    await client.query(
                        `UPDATE patient_stay_history SET status = 'Completed', end_date = CURRENT_DATE WHERE patient_id = $1 AND status = 'Active'`,
                        [Number(id)]
                    );

                    await client.query(
                        `INSERT INTO patient_stay_history (patient_id, admission_id, bed_id, ward, bed_number, start_date, status)
                         VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), 'Active')`,
                        [Number(id), admissionId, bedId, newWard, newBedNumber, newAdmissionDate]
                    );
                }
            } else {
                // If ward/bed cleared, complete active stay and clear admission bed_id
                await client.query(
                    `UPDATE patient_stay_history SET status = 'Completed', end_date = CURRENT_DATE WHERE patient_id = $1 AND status = 'Active'`,
                    [Number(id)]
                );
                await client.query(
                    `UPDATE admissions SET bed_id = NULL WHERE patient_id = $1 AND LOWER(status) = 'admitted'`,
                    [Number(id)]
                );
            }
        } else if (newAdmissionDate) {
            // Update dates across tables if only admission date changed
            await client.query(
                `UPDATE admissions SET admission_date = $1 WHERE patient_id = $2 AND LOWER(status) = 'admitted'`,
                [newAdmissionDate, Number(id)]
            );
            await client.query(
                `UPDATE patient_stay_history SET start_date = $1 WHERE patient_id = $2 AND LOWER(status) = 'active'`,
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