// ==========================================================
// PATIENT HISTORY ROUTES
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

    getPatientMedicalHistory

} = require("../controllers/patientHistoryController");


// ==========================================================
// GET PATIENT MEDICAL HISTORY
// ==========================================================

router.get(

    "/patient/:patientId",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    getPatientMedicalHistory

);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;