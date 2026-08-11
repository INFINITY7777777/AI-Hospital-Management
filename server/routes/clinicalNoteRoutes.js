// ==========================================================
// CLINICAL NOTE ROUTES
// ==========================================================

const express = require("express");

const router = express.Router();

// ==========================================================
// AUTH MIDDLEWARE
// ==========================================================

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// ==========================================================
// CONTROLLER
// ==========================================================

const {
    addClinicalNote,
    getPatientClinicalNotes,
    getClinicalNoteById,
    updateClinicalNote,
    deleteClinicalNote
} = require("../controllers/clinicalNoteController");

// ==========================================================
// ADD CLINICAL NOTE
// POST /api/clinical-notes/patient/:patientId
// ==========================================================

router.post(
    "/patient/:patientId",
    verifyToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    addClinicalNote
);

// ==========================================================
// GET ALL NOTES FOR PATIENT
// GET /api/clinical-notes/patient/:patientId
// ==========================================================

router.get(
    "/patient/:patientId",
    verifyToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    getPatientClinicalNotes
);

// ==========================================================
// GET SINGLE NOTE
// GET /api/clinical-notes/:id
// ==========================================================

router.get(
    "/:id",
    verifyToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    getClinicalNoteById
);

// ==========================================================
// UPDATE NOTE
// PUT /api/clinical-notes/:id
// ==========================================================

router.put(
    "/:id",
    verifyToken,
    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),
    updateClinicalNote
);

// ==========================================================
// DELETE NOTE
// Only admin can permanently delete a clinical note
// DELETE /api/clinical-notes/:id
// ==========================================================

router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    deleteClinicalNote
);

// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;