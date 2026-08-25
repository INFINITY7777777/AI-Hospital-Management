const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { verifyMpin } = require("../middleware/mpinMiddleware");
const {
  getSettings,
  updateProfile,
  changePassword,
  setupMpin,
  updateSystemPreferences,
  getAllUsers,
  updateUserRole,
} = require("../controllers/settingsController");

// User Base Settings
router.get("/", verifyToken, getSettings);
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, changePassword);
router.put("/mpin", verifyToken, setupMpin);
router.put("/preferences", verifyToken, updateSystemPreferences);

// Admin Community Management Routes (Protected by Role & Security MPIN)
router.get("/users", verifyToken, authorizeRoles("admin"), getAllUsers);
router.put("/user-role", verifyToken, authorizeRoles("admin"), verifyMpin, updateUserRole);

module.exports = router;