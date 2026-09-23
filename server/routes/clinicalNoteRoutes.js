// ==========================================================
// CLINICAL NOTE ROUTES
// ==========================================================

const express = require("express");
const router = express.Router();

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    addClinicalNote,
    getPatientClinicalNotes,
    getClinicalNoteById,
    updateClinicalNote,
    deleteClinicalNote
} = require("../controllers/clinicalNoteController");

// ALL ROLES ACCESS READ/WRITE WITH CONTROLLER-LEVEL RBAC
router.post(
    "/patient/:patientId",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff", "nurse"),
    addClinicalNote
);

router.get(
    "/patient/:patientId",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff", "nurse"),
    getPatientClinicalNotes
);

router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff", "nurse"),
    getClinicalNoteById
);

router.put(
    "/:id",
    verifyToken,
    authorizeRoles("admin", "doctor", "staff", "nurse"),
    updateClinicalNote
);

// ONLY ADMINS CAN PERMANENTLY DELETE CLINICAL NOTES
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteClinicalNote
);

module.exports = router;