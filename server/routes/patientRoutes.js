// ==========================================================
// PATIENT ROUTES
// Handles all patient-related API endpoints
// ==========================================================

const express = require("express");

const router = express.Router();

// Import Patient Controller
const {
    addPatient,
    getAllPatients
} = require("../controllers/patientController");

// ==========================================================
// ADD NEW PATIENT
// POST /api/patients
// ==========================================================

router.post("/", addPatient);

router.get("/", getAllPatients);

module.exports = router;