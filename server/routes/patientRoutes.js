// ==========================================================
// PATIENT ROUTES
// Handles all patient-related API endpoints
// ==========================================================

const express = require("express");

const router = express.Router();

// Import Patient Controller
const {
    addPatient
} = require("../controllers/patientController");

// ==========================================================
// ADD NEW PATIENT
// POST /api/patients
// ==========================================================

router.post("/", addPatient);

module.exports = router;