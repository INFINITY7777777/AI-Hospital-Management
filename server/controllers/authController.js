const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      mpin,
      role,
      phone,
      specialization,
      registration_number,
      department,
      experience
    } = req.body;

    if (!full_name || !email || !password || !mpin || !role) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const mpinHash = await bcrypt.hash(mpin, 10);

    const result = await db.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password,
        mpin_hash,
        role,
        phone,
        specialization,
        registration_number,
        department
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, full_name, email, role, department, phone;
      `,
      [
        full_name,
        email,
        passwordHash,
        mpinHash,
        role,
        phone || null,
        specialization || null,
        registration_number || null,
        department || null
      ]
    );

    const newUser = result.rows[0];

    if (String(role).toLowerCase().trim() === "doctor") {
      try {
        await db.query(
          `
          INSERT INTO doctors (
            doctor_name,
            specialization,
            phone,
            email,
            department,
            experience
          )
          VALUES ($1, $2, $3, $4, $5, $6);
          `,
          [
            full_name,
            specialization || "General Physician",
            phone || null,
            email || null,
            department || "General",
            experience ? Number(experience) : 0
          ]
        );
      } catch (docSyncError) {
        console.error("[Doctor Sync Error]:", docSyncError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: newUser
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const adminCreateUser = async (req, res) => {
  try {
    const { full_name, email, password, role, department, phone, specialization } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "Full name, email, password, and role are required." });
    }

    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultMpinHash = await bcrypt.hash("1234", 10);

    const result = await db.query(
      `
      INSERT INTO users (full_name, email, password, mpin_hash, role, department, phone, specialization)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, full_name, email, role, department, phone;
      `,
      [
        full_name,
        email,
        passwordHash,
        defaultMpinHash,
        role,
        department || "General",
        phone || null,
        specialization || null
      ]
    );

    const newUser = result.rows[0];

    if (String(role).toLowerCase().trim() === "doctor") {
      try {
        await db.query(
          `INSERT INTO doctors (doctor_name, specialization, phone, email, department)
           VALUES ($1, $2, $3, $4, $5);`,
          [full_name, specialization || "General Physician", phone || null, email, department || "General"]
        );
      } catch (err) {
        console.error("[Doctor Sync Error]:", err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Staff user created successfully.",
      user: newUser
    });
  } catch (error) {
    console.error("Admin Create User Error:", error);
    return res.status(500).json({ error: "Failed to create user account." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, mpin } = req.body;

    if (!email || (!password && !mpin)) {
      return res.status(400).json({
        message: "Email and either MPIN or Password are required."
      });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: "Your account has been deactivated." });
    }

    let isAuthorized = false;

    if (mpin) {
      if (!user.mpin_hash) {
        return res.status(400).json({
          message: "MPIN not configured. Please use your password."
        });
      }
      isAuthorized = await bcrypt.compare(mpin, user.mpin_hash);
    } else if (password) {
      isAuthorized = await bcrypt.compare(password, user.password);
    }

    if (!isAuthorized) {
      return res.status(401).json({
        message: mpin ? "Invalid MPIN." : "Invalid password."
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const userRes = await db.query("SELECT password FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      newPasswordHash,
      userId,
    ]);

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("[Update Password Error]:", error);
    res.status(500).json({ error: "Failed to update password." });
  }
};

const updateMpin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentMpin, newMpin } = req.body;

    if (!newMpin || !/^\d{4,6}$/.test(newMpin)) {
      return res.status(400).json({ error: "New MPIN must be a 4 to 6 digit number." });
    }

    const userRes = await db.query(
      "SELECT mpin_hash, is_mpin_enabled FROM users WHERE id = $1",
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = userRes.rows[0];

    if (user.is_mpin_enabled && user.mpin_hash) {
      if (!currentMpin) {
        return res.status(400).json({ error: "Current MPIN is required to set a new one." });
      }

      const isMpinMatch = await bcrypt.compare(currentMpin, user.mpin_hash);
      if (!isMpinMatch) {
        return res.status(401).json({ error: "Incorrect current MPIN." });
      }
    }

    const newMpinHash = await bcrypt.hash(newMpin, 10);

    await db.query(
      `UPDATE users 
       SET mpin_hash = $1, 
           is_mpin_enabled = true, 
           failed_mpin_attempts = 0, 
           mpin_locked_until = NULL, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newMpinHash, userId]
    );

    res.status(200).json({ success: true, message: "MPIN updated successfully." });
  } catch (error) {
    console.error("[Update MPIN Error]:", error);
    res.status(500).json({ error: "Failed to update MPIN." });
  }
};

const adminResetUserPassword = async (req, res) => {
  try {
    const { targetUserId, tempPassword } = req.body;

    if (!targetUserId || !tempPassword) {
      return res.status(400).json({ error: "Target User ID and temporary password are required." });
    }

    if (tempPassword.length < 6) {
      return res.status(400).json({ error: "Temporary password must be at least 6 characters." });
    }

    const tempHash = await bcrypt.hash(tempPassword, 10);

    const result = await db.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, email",
      [tempHash, targetUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Target user account not found." });
    }

    res.status(200).json({
      success: true,
      message: `Password for ${result.rows[0].full_name} has been reset successfully.`,
    });
  } catch (error) {
    console.error("[Admin Password Reset Error]:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

module.exports = {
  registerUser,
  adminCreateUser,
  loginUser,
  updatePassword,
  updateMpin,
  adminResetUserPassword,
};