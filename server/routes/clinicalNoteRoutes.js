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