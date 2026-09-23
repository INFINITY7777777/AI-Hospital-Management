const db = require("../config/db");
const { executeChatCompletion } = require("../services/aiService");

/**
 * AI Patient Chat Controller
 */
const patientChat = async (req, res) => {
  try {
    const { patientId, prompt } = req.body;

    if (!patientId || !prompt) {
      return res
        .status(400)
        .json({ error: "patientId and prompt are required" });
    }

    const safePatientId = parseInt(patientId, 10);
    if (isNaN(safePatientId)) {
      return res.status(400).json({ error: "Invalid patientId format" });
    }

    const patientResult = await db.query(
      "SELECT * FROM patients WHERE id = $1",
      [safePatientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient record not found" });
    }
    const patient = patientResult.rows[0];

    const admissionsResult = await db.query(
      `SELECT a.*, b.bed_number, b.ward 
       FROM admissions a 
       LEFT JOIN beds b ON a.bed_id = b.id 
       WHERE a.patient_id = $1 
       ORDER BY a.admission_date DESC LIMIT 5`,
      [safePatientId]
    );

    const notesResult = await db.query(
      "SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 5",
      [safePatientId]
    );

    const admissions = admissionsResult.rows;
    const notes = notesResult.rows;

    const formattedNotes =
      notes.length > 0
        ? notes
            .map((n) => {
              const date = new Date(n.created_at).toLocaleDateString();
              const text = n.note || n.content || n.note_text || "N/A";
              return "[" + date + "]: " + text;
            })
            .join("\n")
        : "No clinical notes.";

    const systemContext = [
      "You are an AI Clinical Assistant built into a Hospital Management System.",
      "Answer questions strictly based on the provided patient record. Do not invent medical conditions.",
      "",
      "PATIENT RECORD:",
      "Name: " +
        (patient.full_name || patient.patient_name || patient.name || "N/A"),
      "Age: " + (patient.age || "N/A"),
      "Gender: " + (patient.gender || "N/A"),
      "Blood Group: " + (patient.blood_group || "N/A"),
      "Medical History: " + (patient.medical_history || "None"),
      "",
      "ADMISSIONS:",
      JSON.stringify(admissions, null, 2),
      "",
      "CLINICAL NOTES:",
      formattedNotes,
    ].join("\n");

    const result = await executeChatCompletion(systemContext, prompt);

    return res.status(200).json({
      response: result.text,
      provider: result.providerUsed,
    });
  } catch (error) {
    console.error("AI Controller Error:", error.message);
    return res.status(503).json({
      error:
        "All free AI servers are currently busy. Please wait a minute and try again.",
    });
  }
};

/**
 * AI Patient Report Synthesis Controller
 */
const generatePatientReport = async (req, res) => {
  try {
    const { patientId, reportType } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    const safePatientId = parseInt(patientId, 10);
    if (isNaN(safePatientId)) {
      return res.status(400).json({ error: "Invalid patientId format" });
    }

    const patientResult = await db.query(
      "SELECT * FROM patients WHERE id = $1",
      [safePatientId]
    );
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient record not found" });
    }
    const patient = patientResult.rows[0];

    const notesResult = await db.query(
      "SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC",
      [safePatientId]
    );
    const admissionsResult = await db.query(
      "SELECT * FROM admissions WHERE patient_id = $1 ORDER BY admission_date DESC",
      [safePatientId]
    );

    // Map report types to document titles
    const titleMap = {
      discharge: "Comprehensive Discharge Summary",
      referral: "Official Medical Referral Letter",
      consult: "Clinical Consultation Assessment Note",
      progress: "Inpatient Daily Progress Summary",
      insurance: "Insurance Claim Medical Justification Abstract",
    };

    const documentTitle = titleMap[reportType] || "Clinical Summary Report";

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemContext = [
      `You are a senior Chief Medical Officer compiling an ${documentTitle}.`,
      "Synthesize the electronic medical health records into a formal, structured Markdown report.",
      "",
      "Formatting & Content guidelines:",
      "- Use professional structured headings tailored to the requested document type.",
      "- Be concise, professional, and clinical.",
      "- Strictly rely on provided clinical history without inventing unrecorded medical events.",
      "- Do NOT output placeholder text like '[Insert Date]' or '[Chief Medical Officer's Name]'.",
      `- End the document with Date: ${currentDate} and Sign-off: Chief Medical Officer / Attending Clinical Team.`,
    ].join("\n");

    const formattedAdmissions =
      admissionsResult.rows.length > 0
        ? admissionsResult.rows
            .map((a) => {
              const reason = a.reason || "N/A";
              const status = a.status || "N/A";
              return `- Admitted: ${a.admission_date}, Reason: ${reason}, Status: ${status}`;
            })
            .join("\n")
        : "No historical admissions recorded.";

    const formattedReportNotes =
      notesResult.rows.length > 0
        ? notesResult.rows
            .map((n) => {
              const date = new Date(n.created_at).toLocaleDateString();
              const text = n.note || n.content || n.note_text || "N/A";
              return `- [${date}]: ${text}`;
            })
            .join("\n")
        : "No clinical notes documented.";

    const userPrompt = [
      `Generate a ${documentTitle} for the following patient:`,
      "",
      "PATIENT INFORMATION:",
      "Name: " +
        (patient.full_name || patient.patient_name || patient.name || "N/A"),
      "Age: " +
        (patient.age || "N/A") +
        " | Gender: " +
        (patient.gender || "N/A") +
        " | Blood Group: " +
        (patient.blood_group || "N/A"),
      "Medical History: " + (patient.medical_history || "None reported"),
      "",
      "ADMISSION RECORDS:",
      formattedAdmissions,
      "",
      "CLINICAL NOTES & OBSERVATIONS:",
      formattedReportNotes,
    ].join("\n");

    const result = await executeChatCompletion(systemContext, userPrompt);

    return res.status(200).json({
      report: result.text,
      provider: result.providerUsed,
    });
  } catch (error) {
    console.error("AI Report Generation Error:", error.message);
    return res.status(503).json({
      error:
        "Failed to generate report due to AI server overload. Please try again.",
    });
  }
};

module.exports = {
  patientChat,
  generatePatientReport,
};