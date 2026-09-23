const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    addAdmission,
    getAdmissions,
    getAdmissionById,
    updateAdmission,
    dischargePatient,
    deleteAdmission
} = require("../controllers/admissionController");

// ==========================================================
// ADMISSION ROUTES
// ==========================================================

// Create new admission (Admin & Staff)
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin", "staff"),
    addAdmission
);

// Get all admissions (Admin, Doctor, Staff)
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getAdmissions
);

// Get single admission by ID (Admin, Doctor, Staff)
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getAdmissionById
);

// Update admission details (Admin & Staff)
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "staff"),
    updateAdmission
);

// Discharge patient (Admin & Staff)
router.put(
    "/:id/discharge",
    verifyToken,
    authorizeRoles("admin", "staff"),
    dischargePatient
);

// Delete admission (Admin only)
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteAdmission
);

module.exports = router;