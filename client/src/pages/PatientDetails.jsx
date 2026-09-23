import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// API Service Layer
import api from "../services/api";

// Sub-components
import DigitalPatientCard from "../components/DigitalPatientCard";
import ClinicalNotes from "../components/ClinicalNotes";
import PatientMedicalHistory from "../components/PatientMedicalHistory";
import RaiseAlertModal from "../components/RaiseAlertModal";
import PatientStayHistory from "../components/PatientStayHistory";
import PatientAIChat from "../components/PatientAiChat";
import PatientAiSummary from "../components/PatientAISummary";

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-40"></div>
              <div className="h-9 bg-gray-200 rounded w-72"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-16 bg-gray-100 rounded-lg"
                  ></div>
                ))}
              </div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to Load Patient
            </h1>
            <p className="text-red-600 mb-6 font-medium">
              {error || "Patient not found."}
            </p>
            <button
              onClick={() => navigate("/patients")}
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold transition text-sm"
            >
              ← Back to Patients
            </button>
          </div>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate("/patients")}
            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold transition text-sm"
          >
            ← Back to Patients
          </button>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm flex items-center gap-2 text-sm"
          >
            <span>⚠️</span> Raise Patient Alert
          </button>
        </div>

        {/* PATIENT IDENTITY HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patientDisplayName}
              </h1>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <span>Patient ID: {patient.id}</span>
                {patient.age && <span>Age: {patient.age}</span>}
                {patient.gender && <span>{patient.gender}</span>}
                {patient.blood_group && (
                  <span>Blood Group: {patient.blood_group}</span>
                )}
              </div>
            </div>

            <div className="text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                Patient Record
              </span>
            </div>
          </div>
        </div>

        {/* PATIENT WORKSPACE NAVIGATION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <DigitalPatientCard patient={patient} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Patient Record Actions
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/patients/${patient.id}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition text-sm"
                >
                  Edit Patient
                </button>

                <button
                  onClick={handleDeletePatient}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition text-sm"
                >
                  {deleting ? "Deleting..." : "Delete Patient"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLINICAL NOTES TAB */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Clinical Notes
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Clinical notes and observations for this patient.
              </p>
            </div>
            <ClinicalNotes patientId={patient.id} />
          </div>
        )}

        {/* MEDICAL HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Medical History
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Medical history and recorded patient events.
              </p>
            </div>
            <PatientMedicalHistory patientId={patient.id} />
          </div>
        )}

        {/* STAY HISTORY TAB */}
        {activeTab === "stays" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Stay History
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ward and bed assignment history for this patient.
              </p>
            </div>
            <PatientStayHistory patientId={patient.id} />
          </div>
        )}

        {/* AI ASSISTANT TAB */}
        {activeTab === "ai" && (
          <PatientAIChat
            patientId={patient.id}
            patientName={patientDisplayName}
          />
        )}

        {/* AI REPORTS TAB */}
        {activeTab === "reports" && (
          <PatientAiSummary
            patientId={patient.id}
            patientName={patientDisplayName}
          />
        )}
      </div>

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