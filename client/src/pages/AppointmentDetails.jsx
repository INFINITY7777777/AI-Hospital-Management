import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Handle expired or invalid authentication.
  const handleAuthError = useCallback(
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return true;
      }

      return false;
    },
    [navigate]
  );

  // Format dates as DD/MM/YYYY without shifting date-only values.
  const formatDateDisplay = (dateInput) => {
    if (!dateInput) return "—";

    const dateString = String(dateInput);
    const dateOnly = dateString.substring(0, 10);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const [year, month, day] = dateOnly.split("-");
      return `${day}/${month}/${year}`;
    }

    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Render appointment status.
  const renderStatusBadge = (status) => {
    const statusLower = (status || "scheduled").toLowerCase();

    switch (statusLower) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            Completed
          </span>
        );

      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
            Cancelled
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center rounded-full border border-sky-200/60 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#08679F]">
            Scheduled
          </span>
        );
    }
  };

  // FETCH APPOINTMENT
  useEffect(() => {
    let isMounted = true;

    const fetchAppointment = async () => {
      if (!localStorage.getItem("token")) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/appointments/${id}`);

        if (isMounted) {
          setAppointment(
            response.data?.appointment ?? response.data ?? null
          );
        }
      } catch (err) {
        console.error("Error fetching appointment:", err);

        if (handleAuthError(err)) return;

        if (isMounted) {
          setError(
            err.response?.data?.error ||
              "Failed to fetch appointment details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAppointment();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, handleAuthError]);

  // MARK APPOINTMENT AS COMPLETED
  const handleComplete = async () => {
    if (completing || deleting) return;

    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    setCompleting(true);
    setError("");

    try {
      const response = await api.put(`/appointments/${id}`, {
        status: "Completed",
      });

      const updatedAppointment =
        response.data?.appointment ?? response.data;

      setAppointment((previous) => ({
        ...previous,
        ...(updatedAppointment &&
        typeof updatedAppointment === "object"
          ? updatedAppointment
          : {}),
        status: "Completed",
      }));

      window.alert("Appointment marked as completed.");
    } catch (err) {
      console.error("Error completing appointment:", err);

      if (handleAuthError(err)) return;

      setError(
        err.response?.data?.error ||
          "Failed to complete appointment."
      );
    } finally {
      setCompleting(false);
    }
  };

  // DELETE APPOINTMENT
  const handleDelete = async () => {
    if (deleting || completing) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) return;

    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await api.delete(`/appointments/${id}`);

      window.alert("Appointment deleted successfully.");
      navigate("/appointments");
    } catch (err) {
      console.error("Error deleting appointment:", err);

      if (handleAuthError(err)) return;

      setError(
        err.response?.data?.error ||
          "Failed to delete appointment."
      );

      setDeleting(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-9 w-40 animate-pulse rounded-xl bg-slate-200/80" />

          <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200/80" />

            <div className="flex gap-2">
              <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200/80" />
              <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200/80" />
            </div>
          </div>

          <div className="h-64 animate-pulse rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6" />
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700"
          >
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
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-xs hover:bg-slate-50"
          >
            ← Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl rounded-[22px] border border-dashed border-slate-200 bg-white p-6 py-12 text-center">
          <h3 className="text-sm font-bold text-slate-800">
            Appointment Not Found
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            The requested record could not be found or may have been deleted.
          </p>

          <Link
            to="/appointments"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20"
          >
            Return to Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/appointments"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-[#08679F] shadow-xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200"
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

        {/* Page heading and action buttons */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Appointment Details
            </h1>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Overview of scheduled consultation, patient records, and doctor assignment.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            {String(appointment.status || "").toLowerCase() !==
              "completed" &&
              String(appointment.status || "").toLowerCase() !==
                "cancelled" && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={completing || deleting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-50"
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

                  <span>
                    {completing ? "Updating..." : "Mark as Completed"}
                  </span>
                </button>
              )}

            <button
              type="button"
              onClick={() =>
                navigate(`/appointments/${appointment.id}/edit`)
              }
              disabled={deleting || completing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#07557F] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:opacity-50"
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
              type="button"
              onClick={handleDelete}
              disabled={deleting || completing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-semibold text-rose-700 transition-all duration-150 hover:bg-rose-100 active:scale-[0.99] disabled:opacity-50"
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

        {/* Appointment details card */}
        <div className="divide-y divide-slate-100 rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6">
          {/* Appointment overview */}
          <section className="pb-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#08679F]">
              Appointment Overview
            </h2>

            <div className="grid grid-cols-1 gap-5 text-xs sm:grid-cols-2 md:grid-cols-3">
              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Appointment ID
                </p>
                <p className="font-semibold text-slate-900">
                  #{appointment.id}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">
                  {formatDateDisplay(appointment.appointment_date)}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">
                  {appointment.appointment_time || "—"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">Status</p>
                <div>{renderStatusBadge(appointment.status)}</div>
              </div>

              <div className="sm:col-span-2 md:col-span-2">
                <p className="mb-1 font-medium text-slate-500">
                  Reason for Visit
                </p>
                <p className="font-semibold leading-relaxed text-slate-800">
                  {appointment.reason || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Patient information */}
          <section className="py-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#08679F]">
              Patient Information
            </h2>

            <div className="grid grid-cols-1 gap-5 text-xs sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Patient Name
                </p>
                <p className="font-semibold text-slate-900">
                  {appointment.patient_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">Age</p>
                <p className="font-semibold text-slate-900">
                  {appointment.age != null && appointment.age !== ""
                    ? `${appointment.age} yrs`
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">Gender</p>
                <p className="font-semibold text-slate-900">
                  {appointment.gender || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Contact Phone
                </p>
                <p className="font-semibold text-slate-900">
                  {appointment.phone || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Doctor information */}
          <section className="pt-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#08679F]">
              Doctor Details
            </h2>

            <div className="grid grid-cols-1 gap-5 text-xs sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Assigned Doctor
                </p>
                <p className="font-semibold text-slate-900">
                  {appointment.doctor_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Specialization
                </p>
                <p className="font-semibold text-slate-900">
                  {appointment.specialization || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Department
                </p>
                <p className="font-semibold text-slate-900">
                  {appointment.department || "N/A"}
                </p>
              </div>

              <div>
                <p className="mb-1 font-medium text-slate-500">
                  Doctor Phone
                </p>
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

