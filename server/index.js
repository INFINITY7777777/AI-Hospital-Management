/***********************************************************************
 * File Name : index.js
 * Purpose   : Main Entry Point of the Backend Server
 * Project   : AI-Powered Hospital Management System
 ***********************************************************************/

// ========================= IMPORTS =========================

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Database Connection
require("./config/db");

// API Routes Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bedRoutes = require("./routes/bedRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const clinicalNoteRoutes = require("./routes/clinicalNoteRoutes");
const patientHistoryRoutes = require("./routes/patientHistoryRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// JWT Authentication Middleware
const { verifyToken } = require("./middleware/authMiddleware");

// ========================= INITIALIZE EXPRESS =========================

const app = express();
const PORT = process.env.PORT || 5000;

// ========================= GLOBAL MIDDLEWARE =========================

app.use(cors());
app.use(express.json());

// ========================= ROUTES =========================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/clinical-notes", clinicalNoteRoutes);
app.use("/api/patient-history", patientHistoryRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);

// ========================= TEST & HEALTH ROUTES =========================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running successfully."
  });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Welcome! You have accessed a protected route.",
    loggedInUser: req.user
  });
});

// ========================= START SERVER =========================

app.listen(PORT, () => {
  console.log(`[Server]: Running successfully at http://localhost:${PORT}`);
});