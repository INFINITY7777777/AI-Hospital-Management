// ==========================================================
// PATIENT ROUTES
// Handles all patient-related API endpoints
// ==========================================================

const express = require("express");

const router = express.Router();

// Import Patient Controller
const {
    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    

} = require("../controllers/patientController");

// ==========================================================
// ADD NEW PATIENT
// POST /api/patients
// ==========================================================

router.post("/", addPatient);

router.get("/", getAllPatients);

router.get("/:id", getPatientById);

router.put("/:id", updatePatient);

router.delete("/:id", deletePatient);


module.exports = router;