// ==========================================================
// APPOINTMENT ROUTES
// ==========================================================

const express = require("express");

const router = express.Router();


// ==========================================================
// AUTH
// ==========================================================

const {

    verifyToken,

    authorizeRoles

} = require("../middleware/authMiddleware");


// ==========================================================
// CONTROLLER
// ==========================================================

const {

    addAppointment,

    getAllAppointments,

    getAppointmentById,

    updateAppointment,

    deleteAppointment

} = require("../controllers/appointmentController");


// ==========================================================
// CREATE
// ==========================================================

router.post(

    "/",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    addAppointment

);


// ==========================================================
// GET ALL
// ==========================================================

router.get(

    "/",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    getAllAppointments

);


// ==========================================================
// GET BY ID
// ==========================================================

router.get(

    "/:id",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    getAppointmentById

);


// ==========================================================
// UPDATE
// ==========================================================

router.put(

    "/:id",

    verifyToken,

    authorizeRoles(

        "admin",

        "doctor",

        "staff"

    ),

    updateAppointment

);


// ==========================================================
// DELETE
// ==========================================================

router.delete(

    "/:id",

    verifyToken,

    authorizeRoles("admin"),

    deleteAppointment

);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;