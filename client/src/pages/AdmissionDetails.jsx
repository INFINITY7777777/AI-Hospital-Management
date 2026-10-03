import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

function AdmissionDetails() {
  // ==========================================================
  // GET ADMISSION ID FROM URL
  // ==========================================================
  const { id } = useParams();

  // ==========================================================
  // NAVIGATION
  // ==========================================================
  const navigate = useNavigate();

  // ==========================================================
  // STATE MANAGEMENT
  // ==========================================================
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dischargeReason, setDischargeReason] = useState("");
  const [discharging, setDischarging] = useState(false);

  // ==========================================================
  // FETCH ADMISSION
  // ==========================================================
  useEffect(() => {
    const loadAdmission = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/admissions/${id}`);
        setAdmission(response.data.admission);
      } catch (err) {
        console.error("Error fetching admission:", err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to fetch admission"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdmission();
  }, [id]);

  // ==========================================================
  // DISCHARGE PATIENT HANDLER
  // ==========================================================
  const handleDischarge = async () => {
    const confirmDischarge = window.confirm(
      "Are you sure you want to discharge this patient?"
    );

    if (!confirmDischarge) return;

    try {
      setDischarging(true);
      setError("");

      await api.put(`/admissions/${id}/discharge`, {
        dischargeDate: new Date().toISOString().split("T")[0],
        dischargeReason: dischargeReason,
      });

      alert("Patient discharged successfully");
      navigate("/admissions");
    } catch (err) {
      console.error("Error discharging patient:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to discharge patient"
      );
    } finally {
      setDischarging(false);
    }
  };

  // ==========================================================
  // STATUS BADGE COMPONENT
  // ==========================================================
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Admitted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Admitted
          </span>
        );
      case "Discharged":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Discharged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // ==========================================================
  // LOADING SKELETON
  // ==========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-9 w-40 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-5">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200/80 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-slate-200/80 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-slate-200/80 rounded-xl animate-pulse" />
          </div>
          <div className="h-48 bg-slate-200/80 rounded-[22px] animate-pulse" />
          <div className="h-36 bg-slate-200/80 rounded-[22px] animate-pulse" />
          <div className="h-48 bg-slate-200/80 rounded-[22px] animate-pulse" />
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
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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
            <p className="mt-1 text-xs text-slate-500">
              The requested admission details could not be loaded or do not exist.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/admissions/${id}/edit`)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Edit Admission
              </button>
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
  // MAIN DETAIL RENDER
  // ==========================================================
  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            BACK TO ADMISSIONS
        ====================================================== */}
        <div>
          <Link
            to="/admissions"
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
            Back to Admissions
          </Link>
        </div>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Admission #{admission.id}
              </h1>
              {renderStatusBadge(admission.status)}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Detailed hospital stay and clinical record for {admission.patient_name || "Patient"}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admissions/${id}/edit`)}
              className="
                inline-flex h-10 shrink-0 items-center justify-center
                gap-1.5 rounded-xl border border-slate-300 bg-white
                px-4 text-xs font-semibold text-slate-700
                shadow-sm transition-all duration-150
                hover:border-slate-400 hover:bg-slate-50
                active:scale-[0.99]
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Admission
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR ALERT
        ====================================================== */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
            <div className="flex items-center gap-2.5">
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
          </div>
        )}

        {/* =====================================================
            PATIENT INFORMATION
        ====================================================== */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xs font-bold text-[#08679F]">
              {admission.patient_name
                ? admission.patient_name.charAt(0).toUpperCase()
                : "P"}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Patient Information
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                Demographic and contact information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Patient Name
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {admission.patient_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Phone Number
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {admission.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Age / Gender
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {admission.age ? `${admission.age} yrs` : "—"} / {admission.gender || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Blood Group
              </p>
              <div className="mt-1">
                {admission.blood_group ? (
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                    {admission.blood_group}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-900">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BED ALLOCATION
        ====================================================== */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Bed & Ward Allocation
            </h2>
            <p className="text-[11px] font-medium text-slate-400">
              Current bed assignment and location inside hospital facility
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Bed Number
              </p>
              <div className="mt-1">
                {admission.bed_number ? (
                  <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-[#08679F]">
                    {admission.bed_number}
                  </span>
                ) : (
                  <span className="italic text-slate-400 text-xs">
                    Not Assigned
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">Ward</p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {admission.ward || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Bed Type
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {admission.bed_type || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            ADMISSION INFORMATION
        ====================================================== */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Admission Details
            </h2>
            <p className="text-[11px] font-medium text-slate-400">
              Reason for entry, admission date, and clinical diagnosis
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Admission Date
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {admission.admission_date
                  ? new Date(admission.admission_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">Status</p>
              <div className="mt-1">{renderStatusBadge(admission.status)}</div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Admission Reason
              </p>
              <p className="mt-1 text-xs font-medium text-slate-700 leading-relaxed">
                {admission.admission_reason || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400">
                Diagnosis
              </p>
              <p className="mt-1 text-xs font-medium text-slate-700 leading-relaxed">
                {admission.diagnosis || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            DISCHARGE ACTION SECTION
        ====================================================== */}
        {admission.status !== "Discharged" && (
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-bold text-slate-900">
              Discharge Patient
            </h2>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              Record discharge details and release bed allocation.
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Discharge Reason / Notes
              </label>
              <textarea
                value={dischargeReason}
                onChange={(event) => setDischargeReason(event.target.value)}
                placeholder="Enter clinical condition at discharge or reason for release..."
                rows={3}
                className="
                  w-full rounded-xl border border-slate-200 bg-white
                  p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400
                  shadow-sm transition-all duration-150
                  focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                "
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleDischarge}
                disabled={discharging}
                className="
                  inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-5
                  text-xs font-semibold text-white shadow-md shadow-rose-600/20
                  transition-all duration-150 hover:bg-rose-700
                  active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50
                  focus:outline-none focus:ring-4 focus:ring-rose-200
                "
              >
                {discharging ? "Discharging..." : "Discharge Patient"}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            DISCHARGED INFORMATION SUMMARY
        ====================================================== */}
        {admission.status === "Discharged" && (
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Discharge Record
            </h2>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">
                  Discharge Date
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-900">
                  {admission.discharge_date
                    ? new Date(admission.discharge_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-400">
                  Discharge Reason
                </p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  {admission.discharge_reason || "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdmissionDetails;