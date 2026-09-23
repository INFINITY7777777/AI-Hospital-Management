// ==========================================================
// PATIENT ROUTES
// Configured with role authentication & route protections
// ==========================================================

const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

// Create Patient (Admin, Doctor, Staff)
router.post(
    "/",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    addPatient
);

// Get All Patients (Role-filtered inside controller)
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getAllPatients
);

// Get Patient By ID (Ownership enforced for doctors)
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    getPatientById
);

// Update Patient
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff"),
    updatePatient
);

// Delete Patient (Admin Only)
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deletePatient
);

module.exports = router;