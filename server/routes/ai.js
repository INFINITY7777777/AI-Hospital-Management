const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { executeChatCompletion } = require("../services/aiService");

// POST /api/ai/summary
router.post("/summary", async (req, res) => {
    try {
        const { patientId, type } = req.body;

        if (!patientId) {
            return res.status(400).json({ error: "patientId is required" });
        }

        // 1. Fetch Patient, Clinical Notes, and History
        const [patientRows] = await db.query("SELECT * FROM patients WHERE id = ?", [patientId]);
        if (patientRows.length === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        const patient = patientRows[0];

        const [notesRows] = await db.query(
            "SELECT * FROM clinical_notes WHERE patient_id = ? ORDER BY created_at DESC", 
            [patientId]
        );
        const [historyRows] = await db.query(
            "SELECT * FROM medical_history WHERE patient_id = ? ORDER BY date DESC", 
            [patientId]
        );

        // 2. Build Context Document
        const historyText = historyRows.length > 0 
            ? historyRows.map(h => `- [${h.date || 'N/A'}] ${h.condition || h.diagnosis || h.details || 'No details'}`).join("\n")
            : "No historical entries.";

        const notesText = notesRows.length > 0 
            ? notesRows.map(n => `- [${n.created_at || 'N/A'}] ${n.note || n.content || 'No text'}`).join("\n")
            : "No clinical notes available.";

        const contextData = `
PATIENT PROFILE:
- Name: ${patient.patient_name || patient.name || "N/A"}
- Age: ${patient.age || "N/A"}, Gender: ${patient.gender || "N/A"}
- Blood Group: ${patient.blood_group || "N/A"}

RECORDED MEDICAL HISTORY:
${historyText}

CLINICAL NOTES:
${notesText}
`;

        const systemMessage = type === "referral" 
            ? "You are a professional medical assistant. Generate a clear, structured Medical Referral Letter based strictly on the provided patient data. Include Reason for Referral, Clinical Summary, Relevant History, and Urgency Level."
            : "You are a professional medical assistant. Generate a structured Clinical Discharge Summary based strictly on the provided patient data. Include Admission Diagnosis, Course of Treatment, Discharge Instructions, and Follow-up Plan.";

        const prompt = `Generate a ${type === "referral" ? "Referral Letter" : "Discharge Summary"} for the following patient:\n${contextData}`;

        // 3. Call AI multi-provider service
        const aiResponse = await executeChatCompletion(systemMessage, prompt);

        res.json({ 
            success: true, 
            summary: aiResponse.text, 
            type,
            providerUsed: aiResponse.providerUsed 
        });

    } catch (err) {
        console.error("Summary Generation Error:", err);
        res.status(500).json({ error: err.message || "Failed to generate AI summary." });
    }
});

module.exports = router;
