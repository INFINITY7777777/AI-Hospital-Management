// ==========================================================
// PATIENT MEDICAL HISTORY
// Displays admissions, appointments and clinical notes
// belonging to a patient
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

// ==========================================================
// COMPONENT
// ==========================================================

function PatientMedicalHistory({ patientId }) {
  // ======================================================
  // HISTORY STATE
  // ======================================================

  const [history, setHistory] = useState({
    admissions: [],
    appointments: [],
    clinicalNotes: []
  });

  // ======================================================
  // LOADING STATE
  // ======================================================

  const [loading, setLoading] = useState(true);

  // ======================================================
  // ERROR STATE
  // ======================================================

  const [error, setError] = useState("");

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    return time.substring(0, 5);
  };

  // ======================================================
  // FETCH MEDICAL HISTORY
  // ======================================================

  useEffect(() => {
    if (!patientId) {
      return;
    }

    const fetchMedicalHistory = async () => {
      try {
        setLoading(true);
        setError("");

        // ==================================================
        // API REQUEST
        // ==================================================

        const response = await api.get(
          `/patient-history/patient/${patientId}`
        );

        // ==================================================
        // SAVE HISTORY
        // ==================================================

        setHistory({
          admissions: response.data.admissions || [],
          appointments: response.data.appointments || [],
          clinicalNotes: response.data.clinicalNotes || []
        });
      } catch (error) {
        console.error("Error fetching medical history:", error);
        console.error("Backend response:", error.response?.data);

        // ==================================================
        // ERROR MESSAGE
        // ==================================================

        setError(
          error.response?.data?.error || "Failed to load medical history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [patientId]);

  // Status Badge Color Resolver
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "discharged") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (s === "active" || s === "admitted") {
      return "bg-[#08679F]/10 text-[#08679F] border-[#08679F]/20";
    }
    if (s === "cancelled") {
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // ==========================================================
  // LOADING SKELETON
  // ==========================================================

  if (loading) {
    return (
      <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-7 bg-slate-200 rounded w-52 mb-6"></div>
          <div className="space-y-3">
            <div className="h-28 bg-slate-100 rounded-2xl"></div>
            <div className="h-28 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR VIEW
  // ==========================================================

  if (error) {
    return (
      <div className="bg-white rounded-[22px] border border-rose-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Medical History</h2>
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mt-8 space-y-8">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
          PATIENT RECORD
        </span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
          Medical History
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Previous admissions, appointments, and clinical notes timeline
        </p>
      </div>

      {/* ==================================================
          ADMISSIONS SECTION
      ================================================== */}
      <section>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Admissions
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {history.admissions.length} record
            {history.admissions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {history.admissions.length === 0 ? (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              No admission history found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.admissions.map((admission) => (
              <div
                key={admission.id}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all duration-150 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Admission Date
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {formatDate(admission.admission_date)}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(
                      admission.status
                    )}`}
                  >
                    {admission.status || "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Admission Reason
                    </span>
                    <p className="font-semibold text-slate-800">
                      {admission.admission_reason || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Diagnosis
                    </span>
                    <p className="font-semibold text-slate-800">
                      {admission.diagnosis || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Bed ID
                    </span>
                    <p className="font-semibold text-slate-800">
                      {admission.bed_id ?? "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Discharge Date
                    </span>
                    <p className="font-semibold text-slate-800">
                      {formatDate(admission.discharge_date)}
                    </p>
                  </div>
                </div>

                {admission.discharge_reason && (
                  <div className="pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Discharge Reason
                    </span>
                    <p className="font-medium text-slate-700">
                      {admission.discharge_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================================================
          APPOINTMENTS SECTION
      ================================================== */}
      <section className="pt-2">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Appointments
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {history.appointments.length} record
            {history.appointments.length !== 1 ? "s" : ""}
          </span>
        </div>

        {history.appointments.length === 0 ? (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              No appointment history found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all duration-150 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Appointment Schedule
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      {formatDate(appointment.appointment_date)}
                      <span className="text-slate-400 font-normal mx-1">•</span>
                      {formatTime(appointment.appointment_time)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(
                      appointment.status
                    )}`}
                  >
                    {appointment.status || "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Doctor ID
                    </span>
                    <p className="font-semibold text-slate-800">
                      {appointment.doctor_id ?? "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Reason
                    </span>
                    <p className="font-semibold text-slate-800">
                      {appointment.reason || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================================================
          CLINICAL NOTES SECTION
      ================================================== */}
      <section className="pt-2">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Clinical Notes
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {history.clinicalNotes.length} record
            {history.clinicalNotes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {history.clinicalNotes.length === 0 ? (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              No clinical notes found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.clinicalNotes.map((note) => (
              <div
                key={note.id}
                className="border border-slate-200/80 rounded-2xl p-4 bg-white hover:border-slate-300 transition-all duration-150 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 mb-1">
                      {note.note_type || "General"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {note.title || "Clinical Note"}
                    </h4>
                  </div>

                  <p className="text-[11px] font-medium text-slate-400">
                    {formatDate(note.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>
                    Written by{" "}
                    <strong className="text-slate-700 font-semibold">
                      {note.author_name || "Unknown"}
                    </strong>
                    {" • "}
                    {note.author_role || "Unknown role"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ==========================================================
// EXPORT
// ==========================================================

export default PatientMedicalHistory;