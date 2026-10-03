import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Helper to format ISO Date strings into DD/MM/YYYY
  const formatDateDisplay = (dateInput) => {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Status Badge Rendering based on HMS Master Plan
  const renderStatusBadge = (status) => {
    const statusLower = (status || "scheduled").toLowerCase();

    switch (statusLower) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#08679F] border border-sky-200/60">
            Scheduled
          </span>
        );
    }
  };

  // ==========================================================
  // FETCH APPOINTMENT
  // ==========================================================
  useEffect(() => {
    const fetchAppointment = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/appointments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAppointment(response.data.appointment);
      } catch (error) {
        console.error("Error fetching appointment:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        setError(
          error.response?.data?.error || "Failed to fetch appointment details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, navigate]);

  // ==========================================================
  // MARK AS COMPLETED
  // ==========================================================
  const handleComplete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setCompleting(true);

      await axios.put(
        `http://localhost:5000/api/appointments/${id}`,
        { status: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointment((prev) => ({ ...prev, status: "Completed" }));
      alert("Appointment marked as completed.");
    } catch (error) {
      console.error("Error completing appointment:", error);
      setError(
        error.response?.data?.error || "Failed to complete appointment"
      );
    } finally {
      setCompleting(false);
    }
  };

  // ==========================================================
  // DELETE APPOINTMENT
  // ==========================================================
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setDeleting(true);

      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Appointment deleted successfully.");
      navigate("/appointments");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      setError(
        error.response?.data?.error || "Failed to delete appointment"
      );
      setDeleting(false);
    }
  };

  // ==========================================================
  // HMS SKELETON LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-9 w-40 bg-slate-200/80 rounded-xl animate-pulse"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="h-8 w-64 bg-slate-200/80 rounded-lg animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-slate-200/80 rounded-xl animate-pulse"></div>
              <div className="h-10 w-28 bg-slate-200/80 rounded-xl animate-pulse"></div>
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4">
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
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            ← Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND STATE
  // ==========================================================
  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center py-12 rounded-[22px] border border-dashed border-slate-200 bg-white p-6">
          <h3 className="text-sm font-bold text-slate-800">
            Appointment Not Found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            The requested record could not be found or may have been deleted.
          </p>
          <Link
            to="/appointments"
            className="mt-4 inline-flex items-center justify-center h-10 px-4 rounded-xl bg-[#08679F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20"
          >
            Return to Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar: Back to Appointments Button (Exactly matches Appointments.jsx) */}
        <div className="flex items-center justify-between">
          <Link
            to="/appointments"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300
              text-xs font-semibold shadow-xs transition-all duration-150
              active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200
            "
          >
            <svg
              className="h-3.5 w-3.5 text-[#08679F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to Appointments
          </Link>
        </div>

        {/* Page Header & Action Buttons Row (Exactly matches Appointments.jsx layout & button sizing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Appointment Details
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Overview of scheduled consultation, patient records, and doctor assignment.
            </p>
          </div>

          {/* Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {appointment.status !== "Completed" && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="
                  inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl
                  bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold
                  shadow-md shadow-emerald-600/20 transition-all duration-150
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
                  focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-50
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <span>{completing ? "Updating..." : "Mark as Completed"}</span>
              </button>
            )}

            <button
              onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
              className="
                inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl
                bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold
                shadow-md shadow-[#08679F]/20 transition-all duration-150
                hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
                focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
              "
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                />
              </svg>
              <span>Edit Appointment</span>
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="
                inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl
                bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200
                transition-all duration-150 active:scale-[0.99] disabled:opacity-50
              "
            >
              <svg
                className="h-4 w-4 text-rose-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Container Card (Matches Appointments.jsx card container styling) */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] divide-y divide-slate-100 space-y-6">
          {/* ================= APPOINTMENT INFO ================= */}
          <section className="pt-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#08679F] mb-4">
              Appointment Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
              <div>
                <p className="text-slate-500 font-medium mb-1">Appointment ID</p>
                <p className="font-semibold text-slate-900">
                  #{appointment.id}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Date</p>
                <p className="font-semibold text-slate-900">
                  {formatDateDisplay(appointment.appointment_date)}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Time</p>
                <p className="font-semibold text-slate-900">
                  {appointment.appointment_time || "—"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Status</p>
                <div>{renderStatusBadge(appointment.status)}</div>
              </div>

              <div className="sm:col-span-2 md:col-span-2">
                <p className="text-slate-500 font-medium mb-1">Reason for Visit</p>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {appointment.reason || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* ================= PATIENT INFO ================= */}
          <section className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#08679F] mb-4">
              Patient Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs">
              <div>
                <p className="text-slate-500 font-medium mb-1">Patient Name</p>
                <p className="font-semibold text-slate-900">
                  {appointment.patient_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Age</p>
                <p className="font-semibold text-slate-900">
                  {appointment.age ? `${appointment.age} yrs` : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Gender</p>
                <p className="font-semibold text-slate-900">
                  {appointment.gender || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Contact Phone</p>
                <p className="font-semibold text-slate-900">
                  {appointment.phone || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* ================= DOCTOR INFO ================= */}
          <section className="pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#08679F] mb-4">
              Doctor Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs">
              <div>
                <p className="text-slate-500 font-medium mb-1">Assigned Doctor</p>
                <p className="font-semibold text-slate-900">
                  {appointment.doctor_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Specialization</p>
                <p className="font-semibold text-slate-900">
                  {appointment.specialization || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Department</p>
                <p className="font-semibold text-slate-900">
                  {appointment.department || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-medium mb-1">Doctor Phone</p>
                <p className="font-semibold text-slate-900">
                  {appointment.doctor_phone || "N/A"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetails;