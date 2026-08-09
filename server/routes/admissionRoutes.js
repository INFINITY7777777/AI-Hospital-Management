// ==========================================================
// ADMISSION ROUTES
// ==========================================================

const express = require("express");

const router = express.Router();


// ==========================================================
// CONTROLLER IMPORT
// ==========================================================

const {

    addAdmission,

    getAdmissions,

    getAdmissionById,

    updateAdmission,

    dischargePatient,

    deleteAdmission

} = require("../controllers/admissionController");


// ==========================================================
// CREATE ADMISSION
// POST /api/admissions
// ==========================================================

router.post(

    "/",

    addAdmission

);


// ==========================================================
// GET ALL ADMISSIONS
// GET /api/admissions
// ==========================================================

router.get(

    "/",

    getAdmissions

);


// ==========================================================
// GET ADMISSION BY ID
// GET /api/admissions/:id
// ==========================================================

router.get(

    "/:id",

    getAdmissionById

);


// ==========================================================
// UPDATE ADMISSION
// PUT /api/admissions/:id
// ==========================================================

router.put(

    "/:id",

    updateAdmission

);


// ==========================================================
// DISCHARGE PATIENT
// PUT /api/admissions/:id/discharge
// ==========================================================

router.put(

    "/:id/discharge",

    dischargePatient

);


// ==========================================================
// DELETE ADMISSION
// DELETE /api/admissions/:id
// ==========================================================

router.delete(

    "/:id",

    deleteAdmission

);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;