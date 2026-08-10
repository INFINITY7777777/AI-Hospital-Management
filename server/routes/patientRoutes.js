// ==========================================================
// PATIENT ROUTES
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
// PATIENT CONTROLLER
// ==========================================================

const {

    addPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient

} = require("../controllers/patientController");


// ==========================================================
// CREATE PATIENT
// ==========================================================

router.post(

    "/",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    addPatient

);


// ==========================================================
// GET ALL PATIENTS
// ==========================================================

router.get(

    "/",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    getAllPatients

);


// ==========================================================
// GET PATIENT BY ID
// ==========================================================

router.get(

    "/:id",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    getPatientById

);


// ==========================================================
// UPDATE PATIENT
// ==========================================================

router.put(

    "/:id",

    verifyToken,

    authorizeRoles(
        "admin",
        "doctor",
        "staff"
    ),

    updatePatient

);


// ==========================================================
// DELETE PATIENT
// ONLY ADMIN
// ==========================================================

router.delete(

    "/:id",

    verifyToken,

    authorizeRoles("admin"),

    deletePatient

);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;