const express = require("express");
const { patientChat, generatePatientReport } = require("../controllers/aiController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Matches POST /api/ai/patient-chat
router.post("/patient-chat", verifyToken, patientChat);

// Matches POST /api/ai/reports
router.post("/reports", verifyToken, generatePatientReport);

module.exports = router;