const express = require("express");

const router = express.Router();


// ==========================================================
// IMPORT CONTROLLER
// ==========================================================

const {
    getDashboardStats,
    getTodayAppointments,
    getUpcomingAppointments,



} = require("../controllers/dashboardController");


// ==========================================================
// GET DASHBOARD STATISTICS
// GET /api/dashboard/stats
// ==========================================================

router.get("/stats", getDashboardStats);

// ==========================================================
// GET TODAY'S APPOINTMENTS
// GET /api/dashboard/today-appointments
// ==========================================================

router.get("/today-appointments", getTodayAppointments);

// ==========================================================
// GET UPCOMING APPOINTMENTS
// GET /api/dashboard/upcoming-appointments
// ==========================================================

router.get("/upcoming-appointments", getUpcomingAppointments);

// ==========================================================
// EXPORT ROUTER
// ==========================================================

module.exports = router;