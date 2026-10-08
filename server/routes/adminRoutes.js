const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  verifyAdminMpin,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// All endpoints require a valid JWT and 'admin' role privileges
router.get("/users", verifyToken, authorizeRoles("admin"), getAllUsers);
router.post("/verify-mpin", verifyToken, authorizeRoles("admin"), verifyAdminMpin);
router.patch("/users/:userId/role", verifyToken, authorizeRoles("admin"), updateUserRole);
router.delete("/users/:userId", verifyToken, authorizeRoles("admin"), deleteUser);

module.exports = router;