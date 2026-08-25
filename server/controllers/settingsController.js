const bcrypt = require("bcryptjs");
const db = require("../config/db");

// 1. Get Combined Profile & System Preferences
const getSettings = async (req, res) => {
  const userId = req.user.id;
  try {
    
    const userResult = await db.query(
      `SELECT id, full_name AS name, email, role, phone, department, avatar_url, is_mpin_enabled 
       FROM users WHERE id = $1`,
      [userId]
    );

    let settingsResult = await db.query("SELECT * FROM user_settings WHERE user_id = $1;", [userId]);
    if (settingsResult.rows.length === 0) {
      settingsResult = await db.query("INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *;", [userId]);
    }

    res.status(200).json({
      profile: userResult.rows[0],
      settings: settingsResult.rows[0],
    });
  } catch (error) {
    console.error("[Settings Fetch Error]:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// 2. Profile Details Update
const updateProfile = async (req, res) => {
  const userId = req.user.id; // Extracted from JWT token via middleware
  const { full_name, name, phone, department, specialization } = req.body;

  // Accept full_name or fall back to name from body
  const userName = full_name || name;

  try {
    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           department = COALESCE($3, department),
           specialization = COALESCE($4, specialization),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, full_name, email, role, phone, department, specialization;`,
      [userName, phone, department, specialization, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("[Profile Update Error]:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// 3. Password Security Update
const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Query 'password' column matching public.users schema
    const userRes = await db.query(
      "SELECT password FROM users WHERE id = $1;",
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentHash = userRes.rows[0].password;
    
    // 2. Verify old password against stored hash
    const isMatch = await bcrypt.compare(currentPassword, currentHash);

    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // 3. Hash new password and update 'password' column
    const hashedNew = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;",
      [hashedNew, userId]
    );

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("[Password Change Error]:", error);
    return res.status(500).json({ error: "Failed to update password" });
  }
};

// 4. Set / Reset MPIN Workflow
const setupMpin = async (req, res) => {
  const userId = req.user.id;
  const { mpin } = req.body;

  if (!mpin || !/^\d{4,6}$/.test(mpin)) {
    return res.status(400).json({ error: "MPIN must be a 4 to 6 digit numeric code" });
  }

  try {
    const hashedMpin = await bcrypt.hash(mpin, 10);
    await db.query(
      "UPDATE users SET mpin_hash = $1, is_mpin_enabled = TRUE, failed_mpin_attempts = 0 WHERE id = $2;",
      [hashedMpin, userId]
    );
    res.status(200).json({ message: "Security MPIN set successfully" });
  } catch (error) {
    console.error("[MPIN Setup Error]:", error);
    res.status(500).json({ error: "Failed to configure MPIN" });
  }
};

// 5. System Branding & Working Shift Timeout Settings
const updateSystemPreferences = async (req, res) => {
  const userId = req.user.id;
  const { hospital_name, hospital_phone, hospital_address, timezone, auto_logout_hours, inapp_notifications, email_notifications } = req.body;

  try {
    const result = await db.query(
      `UPDATE user_settings 
       SET hospital_name = $1, hospital_phone = $2, hospital_address = $3, 
           timezone = $4, auto_logout_hours = $5, inapp_notifications = $6, 
           email_notifications = $7, updated_at = NOW()
       WHERE user_id = $8 RETURNING *;`,
      [hospital_name, hospital_phone, hospital_address, timezone, auto_logout_hours, inapp_notifications, email_notifications, userId]
    );
    res.status(200).json({ settings: result.rows[0] });
  } catch (error) {
    console.error("[Preferences Update Error]:", error);
    res.status(500).json({ error: "Failed to save system preferences" });
  }
};

// 6. Admin User Community & Role Management
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, role, department, phone, is_mpin_enabled FROM users ORDER BY id ASC;");
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("[Users Fetch Error]:", error);
    res.status(500).json({ error: "Failed to list community users" });
  }
};

const updateUserRole = async (req, res) => {
  const { targetUserId, newRole } = req.body;
  const allowedRoles = ["admin", "doctor", "staff"];

  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ error: "Invalid role target" });
  }

  try {
    const result = await db.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role;", [newRole, targetUserId]);
    res.status(200).json({ user: result.rows[0], message: "Role modified successfully" });
  } catch (error) {
    console.error("[Role Update Error]:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

module.exports = {
  getSettings,
  updateProfile,
  changePassword,
  setupMpin,
  updateSystemPreferences,
  getAllUsers,
  updateUserRole,
};