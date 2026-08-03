const express = require("express");

const router = express.Router();


// ==========================================================
// IMPORT CONTROLLER
// ==========================================================

const {
    addAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,


} = require("../controllers/appointmentController");




// ==========================================================
// ADD APPOINTMENT
// POST /api/appointments
// ==========================================================

router.post("/", addAppointment);

// ==========================================================
// GET ALL APPOINTMENTS
// GET /api/appointments
// ==========================================================

router.get("/", getAllAppointments);

// ==========================================================
// GET APPOINTMENT BY ID
// GET /api/appointments/:id
// ==========================================================

router.get("/:id", getAppointmentById);

// ==========================================================
// UPDATE APPOINTMENT
// PUT /api/appointments/:id
// ==========================================================

router.put("/:id", updateAppointment);

// ==========================================================
// DELETE APPOINTMENT
// DELETE /api/appointments/:id
// ==========================================================

router.delete("/:id", deleteAppointment);


// ==========================================================
// EXPORT ROUTER
// ==========================================================

module.exports = router;