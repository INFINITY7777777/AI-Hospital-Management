const db = require("../config/db");

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

// Update user role
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Validate numeric ID parameter
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

  // Validate numeric ID parameter
  if (!userId || isNaN(Number(userId))) {
    return res.status(400).json({ error: "Invalid user ID provided." });
  }

  // Prevent admin from deactivating their own account
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
  updateUserRole,
  deleteUser
};