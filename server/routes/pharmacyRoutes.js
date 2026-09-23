const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  deductStock,
} = require("../controllers/pharmacyController");

const allowedRoles = ["admin", "doctor", "staff"];

router.get("/", verifyToken, authorizeRoles(...allowedRoles), getMedicines);
router.post("/", verifyToken, authorizeRoles(...allowedRoles), addMedicine);
router.put("/:id", verifyToken, authorizeRoles(...allowedRoles), updateMedicine);

// Fixed: Allow doctor and staff to remove items if needed (or keep admin only)
router.delete("/:id", verifyToken, authorizeRoles(...allowedRoles), deleteMedicine);

// Endpoint for Clinical Notes prescription deduction
router.post("/deduct", verifyToken, authorizeRoles(...allowedRoles), deductStock);

module.exports = router;