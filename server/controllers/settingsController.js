const bcrypt = require("bcryptjs");
const db = require("../config/db");

// 1. Get Combined Profile & System Preferences
const getSettings = async (req, res) => {
  const userId = req.user.id;
  try {
    const userResult = await db.query(
      `SELECT id, full_name, email, role, phone, department, specialization, avatar_url, is_mpin_enabled 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const u = userResult.rows[0];

    let settingsResult = await db.query("SELECT * FROM user_settings WHERE user_id = $1;", [userId]);
    if (settingsResult.rows.length === 0) {
      settingsResult = await db.query("INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *;", [userId]);
    }

    res.status(200).json({
      profile: {
        id: u.id,
        name: u.full_name || "",
        full_name: u.full_name || "",
        email: u.email || "",
        role: u.role || "",
        phone: u.phone || "",
        department: u.department || "",
        specialization: u.specialization || "",
        avatar_url: u.avatar_url || "",
        is_mpin_enabled: u.is_mpin_enabled || false,
      },
      settings: settingsResult.rows[0],
    });
  } catch (error) {
    console.error("[Settings Fetch Error]:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// 2. Profile Details Update
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, name, phone, department, specialization } = req.body;
  const userName = full_name || name;

  try {
    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = $2,
           department = $3,
           specialization = $4,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, full_name, email, role, phone, department, specialization;`,
      [userName, phone || null, department || null, specialization || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = result.rows[0];

    res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        id: updated.id,
        name: updated.full_name,
        full_name: updated.full_name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone || "",
        department: updated.department || "",
        specialization: updated.specialization || "",
      }
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

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required." });
  }

  try {
    const userRes = await db.query("SELECT password FROM users WHERE id = $1;", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

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
  const { currentMpin, newMpin, mpin } = req.body;
  const mpinToSet = newMpin || mpin;

  if (!mpinToSet || !/^\d{4,6}$/.test(mpinToSet)) {
    return res.status(400).json({ error: "MPIN must be a 4 to 6 digit numeric code" });
  }

  try {
    const userRes = await db.query("SELECT mpin_hash, is_mpin_enabled FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const user = userRes.rows[0];
    if (user.is_mpin_enabled && user.mpin_hash && currentMpin) {
      const isMpinMatch = await bcrypt.compare(currentMpin, user.mpin_hash);
      if (!isMpinMatch) {
        return res.status(401).json({ error: "Incorrect current MPIN." });
      }
    }

    const hashedMpin = await bcrypt.hash(mpinToSet, 10);
    await db.query(
      "UPDATE users SET mpin_hash = $1, is_mpin_enabled = TRUE, failed_mpin_attempts = 0 WHERE id = $2;",
      [hashedMpin, userId]
    );
    res.status(200).json({ message: "Security MPIN configured successfully" });
  } catch (error) {
    console.error("[MPIN Setup Error]:", error);
    res.status(500).json({ error: "Failed to configure MPIN" });
  }
};

// 5. System Preferences (FIXED)
const updateSystemPreferences = async (req, res) => {
  const userId = req.user.id;
  const { 
    hospital_name, 
    hospital_phone, 
    hospital_address, 
    timezone, 
    auto_logout_hours, 
    inapp_notifications = true, 
    email_notifications = true 
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE user_settings 
       SET hospital_name = $1, 
           hospital_phone = $2, 
           hospital_address = $3, 
           timezone = $4, 
           auto_logout_hours = $5, 
           inapp_notifications = $6, 
           email_notifications = $7, 
           updated_at = NOW()
       WHERE user_id = $8 RETURNING *;`,
      [
        hospital_name || null, 
        hospital_phone || null, 
        hospital_address || null, 
        timezone || "UTC", 
        auto_logout_hours || 8, 
        inapp_notifications, 
        email_notifications, 
        userId
      ]
    );

    if (result.rows.length === 0) {
      // Create user_settings row if it doesn't exist yet
      const newSettings = await db.query(
        `INSERT INTO user_settings (user_id, hospital_name, hospital_phone, hospital_address, timezone, auto_logout_hours, inapp_notifications, email_notifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [userId, hospital_name || null, hospital_phone || null, hospital_address || null, timezone || "UTC", auto_logout_hours || 8, inapp_notifications, email_notifications]
      );
      return res.status(200).json({ settings: newSettings.rows[0], message: "Preferences saved successfully" });
    }

    res.status(200).json({ settings: result.rows[0], message: "Preferences saved successfully" });
  } catch (error) {
    console.error("[Preferences Update Error]:", error);
    res.status(500).json({ error: "Failed to save system preferences" });
  }
};

// 6. Admin User Community
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, full_name AS name, email, role, department, phone, is_mpin_enabled FROM users WHERE is_active = true ORDER BY id ASC;"
    );
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("[Users Fetch Error]:", error);
    res.status(500).json({ error: "Failed to list community users" });
  }
};

const updateUserRole = async (req, res) => {
  const { targetUserId, newRole } = req.body;
  const allowedRoles = ["admin", "doctor", "staff", "nurse", "support staff"];

  if (!allowedRoles.includes(newRole.toLowerCase().trim())) {
    return res.status(400).json({ error: "Invalid role target" });
  }

  try {
    const result = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name AS name, email, role;",
      [newRole.toLowerCase().trim(), targetUserId]
    );
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