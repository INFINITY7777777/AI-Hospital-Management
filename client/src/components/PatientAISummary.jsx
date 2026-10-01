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
    <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mt-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
            DOCUMENT SYNTHESIS
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            AI Clinical Report Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synthesize medical records and notes for{" "}
            <strong className="text-slate-700 font-semibold">
              {patientName || "Patient"}
            </strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
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
            className="bg-[#08679F] hover:bg-[#065381] disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>Generate Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-200/80 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Generated Content Output */}
      {reportContent ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
              Generated Clinical Document
            </span>
            {providerUsed && (
              <span className="bg-[#08679F]/10 text-[#08679F] border border-[#08679F]/20 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                Engine: {providerUsed}
              </span>
            )}
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-xs sm:text-sm font-sans whitespace-pre-wrap text-slate-800 leading-relaxed max-h-128 overflow-y-auto">
            {reportContent}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleCopy}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.75v-6.75" />
                  </svg>
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs sm:text-sm bg-slate-50/50">
            Select a document type and click{" "}
            <strong className="text-slate-700 font-semibold">Generate Document</strong> to
            automatically synthesize clinical summaries.
          </div>
        )
      )}
    </div>
  );
}

export default PatientAiSummary;