// server/index.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./config/db");

const routeModules = {
    authRoutes: require("./routes/authRoutes"),
    adminRoutes: require("./routes/adminRoutes"),
    patientRoutes: require("./routes/patientRoutes"),
    doctorRoutes: require("./routes/doctorRoutes"),
    appointmentRoutes: require("./routes/appointmentRoutes"),
    dashboardRoutes: require("./routes/dashboardRoutes"),
    bedRoutes: require("./routes/bedRoutes"),
    admissionRoutes: require("./routes/admissionRoutes"),
    clinicalNoteRoutes: require("./routes/clinicalNoteRoutes"),
    patientHistoryRoutes: require("./routes/patientHistoryRoutes"),
    pharmacyRoutes: require("./routes/pharmacyRoutes"),
    settingsRoutes: require("./routes/settingsRoutes"),
    notificationRoutes: require("./routes/notificationRoutes"),
    aiRoutes: require("./routes/aiRoutes"),
    promptRoutes: require("./routes/promptRoutes"),
    searchRoutes: require("./routes/searchRoutes"),
};

const expressRoutes = [
    ["/api/auth", routeModules.authRoutes],
    ["/api/admin", routeModules.adminRoutes],
    ["/api/patients", routeModules.patientRoutes],
    ["/api/doctors", routeModules.doctorRoutes],
    ["/api/appointments", routeModules.appointmentRoutes],
    ["/api/dashboard", routeModules.dashboardRoutes],
    ["/api/beds", routeModules.bedRoutes],
    ["/api/admissions", routeModules.admissionRoutes],
    ["/api/clinical-notes", routeModules.clinicalNoteRoutes],
    ["/api/patient-history", routeModules.patientHistoryRoutes],
    ["/api/pharmacy", routeModules.pharmacyRoutes],
    ["/api/settings", routeModules.settingsRoutes],
    ["/api/notifications", routeModules.notificationRoutes],
    ["/api/ai", routeModules.aiRoutes],
    ["/api/prompts", routeModules.promptRoutes],
    ["/api/search", routeModules.searchRoutes],
];

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Validate and mount routers with error messaging.
for (const [path, router] of expressRoutes) {
    if (typeof router !== "function") {
        throw new TypeError(
            `Invalid Express router for ${path}. ` +
            `Check the corresponding routes file and its module.exports.`
        );
    }

    app.use(path, router);
}

const { verifyToken } = require("./middleware/authMiddleware");

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running successfully.",
    });
});

app.get("/api/protected", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Welcome! You have accessed a protected route.",
        loggedInUser: req.user,
    });
});

app.listen(PORT, () => {
    console.log(`[Server]: Running successfully at http://localhost:${PORT}`);
});