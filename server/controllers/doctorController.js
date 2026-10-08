const db = require("../config/db");

// Helper function to format doctor names consistently
const formatDoctorName = (name) => {
  if (!name) return "";
  const trimmed = name.trim();
  return /^dr\./i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
};

const addDoctor = async (req, res) => {
  try {
    const {
      doctorName,
      specialization,
      phone,
      email,
      department,
      experience
    } = req.body;

    if (!doctorName || !specialization) {
      return res.status(400).json({
        error: "Doctor name and specialization are required."
      });
    }

    const formattedName = formatDoctorName(doctorName);

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
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        formattedName,
        specialization,
        phone || null,
        email || null,
        department || null,
        experience || null
      ]
    );

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: result.rows[0]
    });
  } catch (error) {
    console.error("[Doctor Add Error]:", error);
    res.status(500).json({ error: "Failed to add doctor" });
  }
};

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
          CASE 
            WHEN u.full_name ILIKE 'dr.%' THEN u.full_name 
            ELSE 'Dr. ' || u.full_name 
          END AS doctor_name,
          COALESCE(u.specialization, 'General Physician') AS specialization,
          u.email,
          u.phone,
          COALESCE(u.department, 'General') AS department,
          NULL AS experience
      FROM users u
      WHERE LOWER(TRIM(u.role)) = 'doctor'
        AND NOT EXISTS (
            SELECT 1 FROM doctors d2 
            WHERE (LOWER(TRIM(d2.email)) = LOWER(TRIM(u.email)) AND u.email IS NOT NULL AND d2.email IS NOT NULL)
               OR REGEXP_REPLACE(LOWER(TRIM(d2.doctor_name)), '^dr\.\s*', '') = REGEXP_REPLACE(LOWER(TRIM(u.full_name)), '^dr\.\s*', '')
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
          CASE 
            WHEN u.full_name ILIKE 'dr.%' THEN u.full_name 
            ELSE 'Dr. ' || u.full_name 
          END AS doctor_name,
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
            WHERE (LOWER(TRIM(d2.email)) = LOWER(TRIM(u.email)) AND u.email IS NOT NULL AND d2.email IS NOT NULL)
               OR REGEXP_REPLACE(LOWER(TRIM(d2.doctor_name)), '^dr\.\s*', '') = REGEXP_REPLACE(LOWER(TRIM(u.full_name)), '^dr\.\s*', '')
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

    const rawName = doctorName || doctor_name;

    if (!rawName || !specialization) {
      return res.status(400).json({
        error: "Doctor name and specialization are required."
      });
    }

    const nameToSave = formatDoctorName(rawName);
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

      const inDoctors = await db.query(
        `SELECT id FROM doctors 
         WHERE LOWER(email) = LOWER($1) 
            OR REGEXP_REPLACE(LOWER(TRIM(doctor_name)), '^dr\.\s*', '') = REGEXP_REPLACE(LOWER(TRIM($2)), '^dr\.\s*', '')`,
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

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM doctors
      WHERE id = $1
      RETURNING *;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Doctor not found"
      });
    }

    res.status(200).json({
      message: "Doctor deleted successfully",
      doctor: result.rows[0]
    });
  } catch (error) {
    console.error("[Doctor Delete Error]:", error);
    res.status(500).json({
      error: "Failed to delete doctor"
    });
  }
};

module.exports = {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};