import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

function EditAdmission() {
  // ==========================================================
  // GET ADMISSION ID FROM URL
  // ==========================================================
  const { id } = useParams();

  // ==========================================================
  // NAVIGATION
  // ==========================================================
  const navigate = useNavigate();

  // ==========================================================
  // ADMISSION & FORM STATES
  // ==========================================================
  const [admission, setAdmission] = useState(null);
  const [admissionDate, setAdmissionDate] = useState("");
  const [admissionReason, setAdmissionReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");

  // ==========================================================
  // LOADING & ERROR STATES
  // ==========================================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD ADMISSION (FIXED: Using configured 'api' instance)
  // ==========================================================
  useEffect(() => {
    const loadAdmission = async () => {
      try {
        setLoading(true);
        setError("");

        // Fixed 401 Error: Using configured api service with JWT headers
        const response = await api.get(`/admissions/${id}`);
        const data = response.data.admission;

        setAdmission(data);

        // Populate Form Fields
        setAdmissionDate(
          data.admission_date
            ? new Date(data.admission_date).toISOString().split("T")[0]
            : ""
        );
        setAdmissionReason(data.admission_reason || "");
        setDiagnosis(data.diagnosis || "");
      } catch (err) {
        console.error("Error fetching admission:", err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to fetch admission details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdmission();
  }, [id]);

  // ==========================================================
  // UPDATE ADMISSION HANDLER
  // ==========================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!admissionDate) {
      setError("Admission date is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/admissions/${id}`, {
        admissionDate,
        admissionReason,
        diagnosis,
      });

      alert("Admission updated successfully");
      navigate(`/admissions/${id}`);
    } catch (err) {
      console.error("Error updating admission:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update admission"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING SKELETON
  // ==========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-9 w-36 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-200/80 rounded-[22px] animate-pulse" />
          <div className="h-96 bg-slate-200/80 rounded-[22px] animate-pulse" />
        </main>
      </div>
    );
  }

  // ==========================================================
  // ERROR / NOT FOUND SCREEN
  // ==========================================================
  if (!admission) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <Link
              to="/admissions"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Admissions
            </Link>
          </div>

          <div className="rounded-[22px] border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {error || "Admission Record Not Found"}
            </h2>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/admissions")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 hover:bg-[#07557F]"
              >
                Back to Admissions
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // MAIN FORM RENDER
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            BACK NAVIGATION
        ====================================================== */}
        <div>
          <Link
            to={`/admissions/${id}`}
            className="
              inline-flex h-9 items-center gap-2 rounded-xl
              border border-slate-200 bg-white px-3.5
              text-xs font-semibold text-slate-700
              shadow-sm transition-all duration-150
              hover:border-slate-300 hover:bg-slate-50
              focus:outline-none focus:ring-4 focus:ring-slate-100
            "
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Details
          </Link>
        </div>

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Edit Admission Record
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Update stay details, dates, and diagnosis for Admission #{id}.
            </p>
          </div>
        </div>

        {/* =====================================================
            ERROR MESSAGE ALERT
        ====================================================== */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
            <svg
              className="h-4 w-4 shrink-0 text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            PATIENT CONTEXT CARD
        ====================================================== */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-bold text-[#08679F]">
              {admission.patient_name
                ? admission.patient_name.charAt(0).toUpperCase()
                : "P"}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">
                Patient Name
              </span>
              <p className="text-xs font-bold text-slate-900">
                {admission.patient_name || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            EDIT FORM CARD
        ====================================================== */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-5"
        >
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Admission Details
          </h2>

          {/* ADMISSION DATE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Admission Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="
                w-full rounded-xl border border-slate-200 bg-white
                px-3.5 py-2.5 text-xs font-medium text-slate-900
                shadow-sm transition-all duration-150
                focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* ADMISSION REASON */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Admission Reason
            </label>
            <textarea
              value={admissionReason}
              onChange={(e) => setAdmissionReason(e.target.value)}
              placeholder="Primary reason for patient admission..."
              rows={3}
              className="
                w-full rounded-xl border border-slate-200 bg-white
                p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400
                shadow-sm transition-all duration-150
                focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* DIAGNOSIS */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Diagnosis
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Clinical diagnosis notes..."
              rows={3}
              className="
                w-full rounded-xl border border-slate-200 bg-white
                p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400
                shadow-sm transition-all duration-150
                focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(`/admissions/${id}`)}
              className="
                inline-flex h-10 items-center justify-center rounded-xl
                border border-slate-300 bg-white px-4 text-xs font-semibold
                text-slate-700 shadow-sm transition-all duration-150
                hover:border-slate-400 hover:bg-slate-50
                focus:outline-none focus:ring-4 focus:ring-slate-100
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex h-10 items-center justify-center rounded-xl
                bg-[#08679F] px-5 text-xs font-semibold text-white
                shadow-md shadow-[#08679F]/20 transition-all duration-150
                hover:bg-[#07557F] active:scale-[0.99]
                disabled:cursor-not-allowed disabled:opacity-50
                focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
              "
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditAdmission;