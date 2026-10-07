const express = require("express");
const router = express.Router();

// Import authentication & authorization middleware
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Import auth controller functions
const {
  registerUser,
  loginUser,
  updatePassword,
  updateMpin,
  adminResetUserPassword,
} = require("../controllers/authController");

// Public authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// User self-service security routes
router.put("/password", verifyToken, updatePassword);
router.put("/mpin", verifyToken, updateMpin);

// Admin recovery routes
router.put(
  "/admin/reset-password",
  verifyToken,
  authorizeRoles("admin"),
  adminResetUserPassword
);

module.exports = router;