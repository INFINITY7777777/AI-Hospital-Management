// ==========================================================
// EXPRESS
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
// DASHBOARD CONTROLLER
// ==========================================================

const {

    getDashboardStats,

    getTodayAppointments,

    getUpcomingAppointments,

    getBedOccupancySummary,

    getPatientTrends,
    

} = require("../controllers/dashboardController");


// ==========================================================
// ALLOWED DASHBOARD ROLES
// ==========================================================

const dashboardRoles = [

    "admin",

    "doctor",

    "staff"

];


// ==========================================================
// DASHBOARD STATISTICS
// ==========================================================

router.get(

    "/stats",

    verifyToken,

    authorizeRoles(...dashboardRoles),

    getDashboardStats

);


// ==========================================================
// TODAY'S APPOINTMENTS
// ==========================================================

router.get(

    "/today-appointments",

    verifyToken,

    authorizeRoles(...dashboardRoles),

    getTodayAppointments

);


// ==========================================================
// UPCOMING APPOINTMENTS
// ==========================================================

router.get(

    "/upcoming-appointments",

    verifyToken,

    authorizeRoles(...dashboardRoles),

    getUpcomingAppointments

);


// ==========================================================
// PATIENT TRAFFIC TRENDS
// ==========================================================
router.get(
  "/patient-trends",
  verifyToken,
  authorizeRoles(...dashboardRoles),
  getPatientTrends
);


// ==========================================================
// BED OCCUPANCY SUMMARY
// ==========================================================

router.get(

    "/bed-summary",

    verifyToken,

    authorizeRoles(...dashboardRoles),

    getBedOccupancySummary

);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;