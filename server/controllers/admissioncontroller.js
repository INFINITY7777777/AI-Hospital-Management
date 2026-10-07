
const pool = require("../config/db");

// ==========================================================
// HELPERS
// ==========================================================

const isPositiveInteger = (value) =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== "" &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) > 0;

const isValidDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

// Normalize PostgreSQL DATE values without local-time conversion.
const normalizeDatabaseDate = (value) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const datePart = value.slice(0, 10);
    return isValidDate(datePart) ? datePart : null;
  }

  return null;
};

// Uses the server's local calendar date.
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const rollback = async (client, transactionStarted) => {
  if (client && transactionStarted) {
    await client.query("ROLLBACK").catch((error) => {
      console.error("[Transaction Rollback Error]:", error);
    });
  }
};

// ==========================================================
// CREATE ADMISSION
// POST /api/admissions
// ==========================================================

const addAdmission = async (req, res) => {
  let client;
  let transactionStarted = false;

  try {
    const {
      patientId,
      bedId,
      admissionDate,
      admissionReason,
      diagnosis,
    } = req.body;

    if (!isPositiveInteger(patientId)) {
      return res.status(400).json({
        error: "A valid patient ID is required",
      });
    }

    // Default to current local date if admission date is omitted
    const effectiveAdmissionDate =
      admissionDate && String(admissionDate).trim() !== ""
        ? admissionDate
        : getLocalDate();

    if (!isValidDate(effectiveAdmissionDate)) {
      return res.status(400).json({
        error: "A valid admission date in YYYY-MM-DD format is required",
      });
    }

    const normalizedPatientId = Number(patientId);
    let normalizedBedId = null;

    if (bedId !== undefined && bedId !== null && bedId !== "") {
      if (!isPositiveInteger(bedId)) {
        return res.status(400).json({
          error: "A valid bed ID is required",
        });
      }

      normalizedBedId = Number(bedId);
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    const patientResult = await client.query(
      `SELECT id
       FROM patients
       WHERE id = $1
       FOR UPDATE`,
      [normalizedPatientId]
    );

    if (patientResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        error: "Patient not found",
      });
    }

    const activeAdmissionResult = await client.query(
      `SELECT id
       FROM admissions
       WHERE patient_id = $1
         AND status = 'Admitted'
       LIMIT 1`,
      [normalizedPatientId]
    );

    if (activeAdmissionResult.rows.length > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        error: "Patient already has an active admission",
      });
    }

    let selectedBed = null;

    if (normalizedBedId !== null) {
      const bedResult = await client.query(
        `SELECT id, bed_number, ward, status, patient_id
         FROM beds
         WHERE id = $1
         FOR UPDATE`,
        [normalizedBedId]
      );

      if (bedResult.rows.length === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          error: "Bed not found",
        });
      }

      selectedBed = bedResult.rows[0];

      if (
        selectedBed.status !== "Available" ||
        selectedBed.patient_id !== null
      ) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          error: "Selected bed is not available",
        });
      }
    }

    const admissionResult = await client.query(
      `INSERT INTO admissions (
         patient_id,
         bed_id,
         admission_date,
         admission_reason,
         diagnosis,
         status
       )
       VALUES ($1, $2, $3, $4, $5, 'Admitted')
       RETURNING *`,
      [
        normalizedPatientId,
        normalizedBedId,
        effectiveAdmissionDate,
        admissionReason ?? "",
        diagnosis ?? "",
      ]
    );

    const admission = admissionResult.rows[0];

    if (selectedBed) {
      const bedUpdate = await client.query(
        `UPDATE beds
         SET status = 'Occupied',
             patient_id = $1
         WHERE id = $2
           AND status = 'Available'
           AND patient_id IS NULL
         RETURNING id`,
        [normalizedPatientId, normalizedBedId]
      );

      if (bedUpdate.rows.length !== 1) {
        const error = new Error(
          "Bed availability changed during admission creation"
        );
        error.statusCode = 409;
        throw error;
      }

      await client.query(
        `INSERT INTO patient_stay_history (
           patient_id,
           admission_id,
           bed_id,
           ward,
           bed_number,
           start_date,
           status
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'Active')`,
        [
          normalizedPatientId,
          admission.id,
          selectedBed.id,
          selectedBed.ward,
          selectedBed.bed_number,
          effectiveAdmissionDate,
        ]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      message: "Patient admitted successfully",
      admission,
    });
  } catch (error) {
    await rollback(client, transactionStarted);
    console.error("[Admission Error]:", error);

    return res.status(error.statusCode || 500).json({
      error: error.statusCode
        ? error.message
        : "Failed to create admission",
    });
  } finally {
    if (client) client.release();
  }
};

// ==========================================================
// GET ALL ADMISSIONS
// GET /api/admissions
// ==========================================================

const getAdmissions = async (req, res) => {
    const role = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.id;

    try {
        let query = `
            SELECT
                a.id,
                a.patient_id,
                p.patient_name,
                p.doctor AS patient_doctor,
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
            INNER JOIN patients p ON p.id = a.patient_id
            LEFT JOIN beds b ON b.id = a.bed_id
        `;

        const params = [];

        if (role === "doctor") {
            if (!userId || !Number.isSafeInteger(Number(userId))) {
                return res.status(403).json({
                    error: "Doctor account could not be verified."
                });
            }

            query += `
                INNER JOIN users u ON u.id = $1
                WHERE LOWER(TRIM(COALESCE(p.doctor, ''))) =
                      LOWER(TRIM(COALESCE(u.full_name, '')))
            `;

            params.push(Number(userId));
        }

        query += ` ORDER BY a.created_at DESC, a.id DESC`;

        const result = await pool.query(query, params);

        return res.status(200).json({
            admissions: result.rows
        });
    } catch (error) {
        console.error("[Get Admissions Error]:", error);

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
    const { id } = req.params;
    const role = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.id;

    if (!isPositiveInteger(id)) {
        return res.status(400).json({
            error: "A valid admission ID is required"
        });
    }

    try {
        let query = `
            SELECT
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
            INNER JOIN patients p ON p.id = a.patient_id
            LEFT JOIN beds b ON b.id = a.bed_id
            WHERE a.id = $1
        `;

        const params = [Number(id)];

        if (role === "doctor") {
            if (!userId || !Number.isSafeInteger(Number(userId))) {
                return res.status(403).json({
                    error: "Doctor account could not be verified."
                });
            }

            query += `
                AND EXISTS (
                    SELECT 1
                    FROM users u
                    WHERE u.id = $2
                      AND LOWER(TRIM(COALESCE(p.doctor, ''))) =
                          LOWER(TRIM(COALESCE(u.full_name, '')))
                )
            `;

            params.push(Number(userId));
        }

        const result = await pool.query(query, params);

        if (!result.rows.length) {
            return res.status(404).json({
                error: "Admission not found or access denied."
            });
        }

        return res.status(200).json({
            admission: result.rows[0]
        });
    } catch (error) {
        console.error("[Admission Details Error]:", error);

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
  let client;
  let transactionStarted = false;

  try {
    const { id } = req.params;
    const {
      admissionDate,
      admissionReason,
      diagnosis,
    } = req.body;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        error: "A valid admission ID is required",
      });
    }

    if (
      admissionDate !== undefined &&
      admissionDate !== null &&
      admissionDate !== "" &&
      !isValidDate(admissionDate)
    ) {
      return res.status(400).json({
        error: "A valid admission date in YYYY-MM-DD format is required",
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // Check admission existence
    const existing = await client.query(
      `SELECT id, patient_id, admission_date
       FROM admissions
       WHERE id = $1
       FOR UPDATE`,
      [Number(id)]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(404).json({
        error: "Admission not found",
      });
    }

    const currentRecord = existing.rows[0];

    // Update admissions table
    const result = await client.query(
      `UPDATE admissions
       SET admission_date = COALESCE($1, admission_date),
           admission_reason = COALESCE($2, admission_reason),
           diagnosis = COALESCE($3, diagnosis),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        admissionDate || null,
        admissionReason ?? null,
        diagnosis ?? null,
        Number(id),
      ]
    );

    // If date changed, synchronize active stay history and patient record
    if (admissionDate) {
      await client.query(
        `UPDATE patient_stay_history
         SET start_date = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE admission_id = $2 AND status = 'Active'`,
        [admissionDate, Number(id)]
      );

      await client.query(
        `UPDATE patients
         SET admission_date = $1
         WHERE id = $2`,
        [admissionDate, currentRecord.patient_id]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      message: "Admission updated successfully",
      admission: result.rows[0],
    });
  } catch (error) {
    await rollback(client, transactionStarted);
    console.error("[Update Admission Error]:", error);

    return res.status(500).json({
      error: "Failed to update admission",
    });
  } finally {
    if (client) client.release();
  }
};

// ==========================================================
// DISCHARGE PATIENT
// PUT /api/admissions/:id/discharge
// ==========================================================

const dischargePatient = async (req, res) => {
  let client;
  let transactionStarted = false;

  try {
    const { id } = req.params;
    const { dischargeDate, dischargeReason } = req.body;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        error: "A valid admission ID is required",
      });
    }

    if (
      dischargeDate !== undefined &&
      dischargeDate !== null &&
      dischargeDate !== "" &&
      !isValidDate(dischargeDate)
    ) {
      return res.status(400).json({
        error: "A valid discharge date in YYYY-MM-DD format is required",
      });
    }

    const effectiveDischargeDate = dischargeDate || getLocalDate();

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // Lock order: admission, then bed.
    const admissionResult = await client.query(
      `SELECT id, patient_id, bed_id, admission_date, status
       FROM admissions
       WHERE id = $1
       FOR UPDATE`,
      [Number(id)]
    );

    if (admissionResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        error: "Admission not found",
      });
    }

    const admission = admissionResult.rows[0];

    if (admission.status !== "Admitted") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        error: "Only active admissions can be discharged",
      });
    }

    const admissionDate = normalizeDatabaseDate(
      admission.admission_date
    );

    if (!admissionDate) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(500).json({
        error: "The admission date stored in the database is invalid.",
      });
    }

    // Both values are validated YYYY-MM-DD strings.
    // Lexicographical comparison is safe for this format.
    if (effectiveDischargeDate < admissionDate) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        error: "Discharge date cannot be before the admission date",
      });
    }

    let lockedBed = null;
    let activeStay = null;

    if (admission.bed_id !== null) {
      const bedResult = await client.query(
        `SELECT id, patient_id, status
         FROM beds
         WHERE id = $1
         FOR UPDATE`,
        [admission.bed_id]
      );

      if (bedResult.rows.length !== 1) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          error:
            "Assigned bed was not found. Resolve the inconsistency before discharge.",
        });
      }

      lockedBed = bedResult.rows[0];

      if (
        lockedBed.status !== "Occupied" ||
        Number(lockedBed.patient_id) !== Number(admission.patient_id)
      ) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          error:
            "Bed assignment is inconsistent. Resolve it before discharge.",
        });
      }

      const stayResult = await client.query(
        `SELECT id, start_date
         FROM patient_stay_history
         WHERE admission_id = $1
           AND patient_id = $2
           AND bed_id = $3
           AND status = 'Active'
         FOR UPDATE`,
        [
          admission.id,
          admission.patient_id,
          admission.bed_id,
        ]
      );

      if (stayResult.rows.length !== 1) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          error:
            "Exactly one matching active stay-history record is required before discharge.",
        });
      }

      activeStay = stayResult.rows[0];

      const stayStartDate = normalizeDatabaseDate(
        activeStay.start_date
      );

      if (!stayStartDate) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(500).json({
          error: "The stay start date stored in the database is invalid.",
        });
      }

      if (effectiveDischargeDate < stayStartDate) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(400).json({
          error:
            "Discharge date cannot be before the current stay start date",
        });
      }
    }

    // Complete the admission only after validating the related records.
    const admissionUpdate = await client.query(
      `UPDATE admissions
       SET status = 'Discharged',
           discharge_date = $1,
           discharge_reason = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
         AND status = 'Admitted'
       RETURNING *`,
      [
        effectiveDischargeDate,
        dischargeReason ?? "",
        admission.id,
      ]
    );

    if (admissionUpdate.rows.length !== 1) {
      const error = new Error("Admission could not be discharged");
      error.statusCode = 409;
      throw error;
    }

    if (lockedBed && activeStay) {
      const stayUpdate = await client.query(
        `UPDATE patient_stay_history
         SET status = 'Completed',
             end_date = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
           AND status = 'Active'
         RETURNING id`,
        [effectiveDischargeDate, activeStay.id]
      );

      if (stayUpdate.rows.length !== 1) {
        const error = new Error(
          "Stay history could not be completed"
        );
        error.statusCode = 409;
        throw error;
      }

      const bedUpdate = await client.query(
        `UPDATE beds
         SET status = 'Available',
             patient_id = NULL
         WHERE id = $1
           AND patient_id = $2
           AND status = 'Occupied'
         RETURNING id`,
        [lockedBed.id, admission.patient_id]
      );

      if (bedUpdate.rows.length !== 1) {
        const error = new Error(
          "Bed could not be released during discharge"
        );
        error.statusCode = 409;
        throw error;
      }
    } else {
      // A bedless admission must not have an active stay record.
      const unexpectedStay = await client.query(
        `SELECT id
         FROM patient_stay_history
         WHERE admission_id = $1
           AND status = 'Active'
         LIMIT 1`,
        [admission.id]
      );

      if (unexpectedStay.rows.length > 0) {
        const error = new Error(
          "An active stay-history record exists without a bed assignment. Resolve the inconsistency before discharge."
        );
        error.statusCode = 409;
        throw error;
      }
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      message: "Patient discharged successfully",
      admission: admissionUpdate.rows[0],
    });
  } catch (error) {
    await rollback(client, transactionStarted);
    console.error("[Discharge Error]:", error);

    return res.status(error.statusCode || 500).json({
      error: error.statusCode
        ? error.message
        : "Failed to discharge patient",
    });
  } finally {
    if (client) client.release();
  }
};

// ==========================================================
// DELETE ADMISSION
// DELETE /api/admissions/:id
// ==========================================================

const deleteAdmission = async (req, res) => {
  let client;
  let transactionStarted = false;

  try {
    const { id } = req.params;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({
        error: "A valid admission ID is required",
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // 1. Lock and inspect admission
    const admissionResult = await client.query(
      `SELECT id, status
       FROM admissions
       WHERE id = $1
       FOR UPDATE`,
      [Number(id)]
    );

    if (admissionResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        error: "Admission not found",
      });
    }

    // 2. Ensure only discharged admissions can be deleted
    if (admissionResult.rows[0].status !== "Discharged") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        error:
          "Active admissions cannot be deleted. Discharge the patient first.",
      });
    }

    // 3. Delete dependent child records from patient_stay_history first
    await client.query(
      `DELETE FROM patient_stay_history
       WHERE admission_id = $1`,
      [Number(id)]
    );

    // 4. Delete admission record
    const result = await client.query(
      `DELETE FROM admissions
       WHERE id = $1
         AND status = 'Discharged'
       RETURNING *`,
      [Number(id)]
    );

    if (result.rows.length !== 1) {
      const error = new Error("Admission could not be deleted");
      error.statusCode = 409;
      throw error;
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      message: "Admission record and stay history deleted successfully",
      admission: result.rows[0],
    });
  } catch (error) {
    await rollback(client, transactionStarted);
    console.error("[Delete Admission Error]:", error);

    return res.status(error.statusCode || 500).json({
      error: error.statusCode
        ? error.message
        : "Failed to delete admission",
    });
  } finally {
    if (client) client.release();
  }
};
// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
  addAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  dischargePatient,
  deleteAdmission,
};