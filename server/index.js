/***********************************************************************
 * File Name : index.js
 * Purpose   : Main Entry Point of the Backend Server
 * Project   : AI-Powered Hospital Management System
 *
 * Description:
 * This file starts the Express server, loads middleware,
 * connects all API routes, and creates test/protected endpoints.
 ***********************************************************************/

// ========================= IMPORTS =========================

// Express Framework
const express = require("express");

// Enable communication between React and Backend
const cors = require("cors");

// Load environment variables (.env)
require("dotenv").config();

// Database Connection
require("./config/db");

// Authentication Routes
const authRoutes = require("./routes/authRoutes");

// Patient Routes
const patientRoutes = require("./routes/patientRoutes");

// Doctor Routes
const doctorRoutes = require("./routes/doctorRoutes");

// Appointment Routes
const appointmentRoutes = require("./routes/appointmentRoutes");

// Dashboard Routes
const dashboardRoutes = require("./routes/dashboardRoutes");


// Bed Routes
const bedRoutes = require("./routes/bedRoutes");

// Admission Routes
const admissionRoutes = require("./routes/admissionRoutes");

// JWT Authentication Middleware
const verifyToken = require("./middleware/authMiddleware");





// ========================= INITIALIZE EXPRESS =========================

const app = express();

// Backend Port
const PORT = 5000;


// ========================= GLOBAL MIDDLEWARE =========================

// Allow frontend requests
app.use(cors());

// Read JSON data from requests
app.use(express.json());


// ========================= ROUTES =========================

// Authentication APIs
app.use("/api/auth", authRoutes);

// Patient APIs
app.use("/api/patients", patientRoutes);

// Doctor APIs
app.use("/api/doctors", doctorRoutes);

// Appointment APIs
app.use("/api/appointments", appointmentRoutes);

// Dashboard APIs
app.use("/api/dashboard", dashboardRoutes);

// Bed APIs
app.use("/api/beds", bedRoutes);

// Admission APIs
app.use("/api/admissions", admissionRoutes);


// ========================= TEST ROUTE =========================

// Used to check whether backend is running
app.get("/api/test", (req, res) => {

    res.json({

        success: true,

        message: "Backend is running successfully."

    });

});


// ========================= PROTECTED ROUTE =========================

// This route can only be accessed after login.

app.get("/api/protected", verifyToken, (req, res) => {

    res.json({

        success: true,

        message: "Welcome! You have accessed a protected route.",

        loggedInUser: req.user

    });

});


// ========================= START SERVER =========================

app.listen(PORT, () => {

    console.log(
        `[Server]: Running successfully at http://localhost:${PORT}`
    );

});