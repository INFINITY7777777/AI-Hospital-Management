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

    getPatientMedicalHistory,
    getPatientStayHistory,


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
// GET PATIENT STAY HISTORY
// ==========================================================

router.get(

    "/patient/:patientId/stays",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    getPatientStayHistory

);

// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;