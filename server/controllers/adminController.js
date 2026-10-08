const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Get all active users in the system
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, role, phone, department, specialization, is_active, created_at 
       FROM users 
       WHERE is_active = true 
       ORDER BY id ASC;`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("[Get Users Error]:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Verify Admin Security MPIN
const verifyAdminMpin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { mpin } = req.body;

    if (!mpin) {
      return res.status(400).json({ error: "Admin MPIN is required." });
    }

    const adminQuery = await db.query(
      "SELECT mpin_hash, role FROM users WHERE id = $1",
      [adminId]
    );

    if (adminQuery.rows.length === 0) {
      return res.status(404).json({ error: "Admin user account not found." });
    }

    const adminUser = adminQuery.rows[0];

    if (!adminUser.mpin_hash) {
      return res.status(400).json({
        error: "Admin MPIN not configured. Please set an MPIN in Settings first."
      });
    }

    const isMatch = await bcrypt.compare(mpin, adminUser.mpin_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Admin MPIN." });
    }

    return res.status(200).json({
      success: true,
      message: "Admin MPIN verified successfully."
    });
  } catch (error) {
    console.error("[Verify Admin MPIN Error]:", error);
    return res.status(500).json({ error: "Failed to verify Admin MPIN." });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "Invalid user ID provided." });
  }

  const validRoles = ["admin", "doctor", "support staff", "nurse", "staff"];
  if (!role || !validRoles.includes(role.toLowerCase().trim())) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  try {
    const result = await db.query(
      "UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, role;",
      [role.toLowerCase().trim(), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ 
      message: "User role updated successfully.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("[Update Role Error]:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// Deactivate user (Revoke Access)
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const requestingAdminId = req.user.id;

  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "Invalid user ID provided." });
  }

  if (Number(userId) === Number(requestingAdminId)) {
    return res.status(400).json({ error: "You cannot deactivate your own admin account." });
  }

  try {
    const result = await db.query(
      "UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id;",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User account deactivated successfully." });
  } catch (error) {
    console.error("[Delete User Error]:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
};

module.exports = {
  getAllUsers,
  verifyAdminMpin,
  updateUserRole,
  deleteUser
};