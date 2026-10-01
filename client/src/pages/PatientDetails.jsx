// ==========================================================
// REACT & ROUTER
// ==========================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ==========================================================
// SERVICES
// ==========================================================

import api from "../services/api";

// ==========================================================
// SUB-COMPONENTS
// ==========================================================

import DigitalPatientCard from "../components/DigitalPatientCard";
import ClinicalNotes from "../components/ClinicalNotes";
import PatientMedicalHistory from "../components/PatientMedicalHistory";
import RaiseAlertModal from "../components/RaiseAlertModal";
import PatientStayHistory from "../components/PatientStayHistory";
import PatientAIChat from "../components/PatientAiChat";
import PatientAiSummary from "../components/PatientAISummary";

// ==========================================================
// PATIENT DETAILS VIEW
// ==========================================================

function PatientDetails() {
  // -------------------------------------------------------------------------
  // Hooks
  // -------------------------------------------------------------------------
  const { id } = useParams();
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch Patient Details
  // -------------------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await api.get(`/patients/${id}`, {
          signal: controller.signal,
        });

        setPatient(response.data.patient || response.data);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;

        console.error("Error fetching patient details:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (err.response?.status === 403) {
          setError("You do not have permission to view this patient.");
          return;
        }

        if (err.response?.status === 404) {
          setError("Patient record not found.");
          return;
        }

        setError(
          err.response?.data?.error || "Failed to load patient details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }

    return () => controller.abort();
  }, [id, navigate]);

  // -------------------------------------------------------------------------
  // Delete Patient
  // -------------------------------------------------------------------------
  const handleDeletePatient = async () => {
    if (!patient?.id) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this patient record?"
      )
    ) {
      return;
    }

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      await api.delete(`/patients/${patient.id}`);
      navigate("/patients");
    } catch (err) {
      console.error("Error deleting patient:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (err.response?.status === 403) {
        alert("Only administrators can delete patient records.");
        return;
      }

      alert(
        err.response?.data?.error || "Failed to delete patient record."
      );
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-[22px] border border-slate-200/80 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 rounded-lg w-40"></div>
            <div className="h-9 bg-slate-200 rounded-lg w-72"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-16 bg-slate-100 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error State
  // -------------------------------------------------------------------------
  if (error || !patient) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-[22px] border border-rose-200 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Unable to Load Patient
          </h1>
          <p className="text-sm text-rose-600 mb-6 font-medium">
            {error || "Patient not found."}
          </p>
          <button
            onClick={() => navigate("/patients")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            ← Back to Patients
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Tabs Config
  // -------------------------------------------------------------------------
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: "Clinical Notes" },
    { id: "history", label: "Medical History" },
    { id: "stays", label: "Stay History" },
    { id: "ai", label: "🤖 AI Assistant" },
    { id: "reports", label: "📄 AI Reports" },
  ];

  const patientDisplayName = patient.patient_name || patient.name || "Unknown Patient";

  // -------------------------------------------------------------------------
  // Primary Render
  // -------------------------------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* HEADER ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate("/patients")}
          className="
            inline-flex items-center gap-2 h-10 px-4 rounded-xl
            border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700
            shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-300
            active:scale-[0.98]
          "
        >
          <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Patients
        </button>

        <button
          onClick={() => setIsAlertModalOpen(true)}
          className="
            inline-flex items-center gap-2 h-10 px-4 rounded-xl
            bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold
            shadow-md shadow-rose-600/20 transition-all duration-150
            hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
          "
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM12 3a9 9 0 100 18 9 9 0 000-18z" />
          </svg>
          Raise Patient Alert
        </button>
      </div>

      {/* PATIENT IDENTITY HERO HEADER */}
      <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {patientDisplayName}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#08679F]/10 text-[#08679F]">
                ID: #{patient.id}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm font-medium text-slate-500 pt-1">
              {patient.age && <span>Age: <strong className="text-slate-800">{patient.age}</strong></span>}
              {patient.gender && <span>Gender: <strong className="text-slate-800">{patient.gender}</strong></span>}
              {patient.blood_group && (
                <span>Blood Group: <strong className="text-rose-600 font-bold">{patient.blood_group}</strong></span>
              )}
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Record
            </span>
          </div>
        </div>
      </div>

      {/* SEGMENTED TAB NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150
                ${
                  activeTab === tab.id
                    ? "bg-[#08679F] text-white shadow-md shadow-[#08679F]/20"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <DigitalPatientCard patient={patient} />

          <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
              Patient Record Actions
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/patients/${patient.id}/edit`)}
                className="
                  inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl
                  bg-[#08679F] hover:bg-[#07557F] text-white text-xs sm:text-sm font-semibold
                  shadow-md shadow-[#08679F]/20 transition-all duration-150
                  hover:-translate-y-0.5 active:translate-y-0
                "
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Patient
              </button>

              <button
                onClick={handleDeletePatient}
                disabled={deleting}
                className="
                  inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl
                  border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700
                  text-xs sm:text-sm font-semibold transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {deleting ? "Deleting..." : "Delete Patient"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CLINICAL NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900">
              Clinical Notes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clinical notes, daily observations, and doctor assessments for this patient.
            </p>
          </div>
          <ClinicalNotes patientId={patient.id} />
        </div>
      )}

      {/* TAB CONTENT: MEDICAL HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900">
              Medical History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Medical history, past conditions, and recorded clinical events.
            </p>
          </div>
          <PatientMedicalHistory patientId={patient.id} />
        </div>
      )}

      {/* TAB CONTENT: STAY HISTORY */}
      {activeTab === "stays" && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900">
              Stay History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ward allocations, bed transfer logs, and stay history for this patient.
            </p>
          </div>
          <PatientStayHistory patientId={patient.id} />
        </div>
      )}

      {/* TAB CONTENT: AI ASSISTANT */}
      {activeTab === "ai" && (
        <PatientAIChat
          patientId={patient.id}
          patientName={patientDisplayName}
        />
      )}

      {/* TAB CONTENT: AI REPORTS */}
      {activeTab === "reports" && (
        <PatientAiSummary
          patientId={patient.id}
          patientName={patientDisplayName}
        />
      )}

      {/* EMERGENCY NOTIFICATION MODAL */}
      <RaiseAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        patientId={patient.id}
        patientName={patientDisplayName}
        onAlertSent={() => {
          alert("Critical notification sent to all active team members.");
        }}
      />
    </div>
  );
}

export default PatientDetails;