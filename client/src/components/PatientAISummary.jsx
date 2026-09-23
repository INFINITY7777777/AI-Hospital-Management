import { useState } from "react";
import api from "../services/api";

function PatientAiSummary({ patientId, patientName }) {
  const [reportType, setReportType] = useState("discharge");
  const [reportContent, setReportContent] = useState("");
  const [providerUsed, setProviderUsed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateReport = async () => {
    if (!patientId) {
      setError("Patient ID is missing.");
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await api.post("/ai/reports", {
        patientId,
        reportType,
      });

      setReportContent(response.data.report);
      setProviderUsed(response.data.provider);
    } catch (err) {
      console.error("Error generating report:", err);
      setError(
        err.response?.data?.error || "Failed to generate AI report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📄 AI Clinical Report Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Synthesize medical records and notes for <strong className="text-gray-700">{patientName || "Patient"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
          >
            <option value="discharge">Discharge Summary</option>
            <option value="referral">Referral Letter</option>
            <option value="consult">Consultation Note</option>
            <option value="progress">Daily Progress Note</option>
            <option value="insurance">Insurance Claim Abstract</option>
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold text-sm transition shadow-sm whitespace-nowrap"
          >
            {loading ? "Synthesizing..." : "Generate Document"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {reportContent ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Generated Clinical Document</span>
            {providerUsed && (
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
                Engine: {providerUsed}
              </span>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm font-sans whitespace-pre-wrap text-gray-800 leading-relaxed max-h-128 overflow-y-auto shadow-inner">
            {reportContent}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCopy}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              {copied ? "✓ Copied to Clipboard" : "📋 Copy Report"}
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
            Select a document type and click <strong className="text-gray-600">Generate Document</strong> to automatically synthesize clinical summaries.
          </div>
        )
      )}
    </div>
  );
}

export default PatientAiSummary;