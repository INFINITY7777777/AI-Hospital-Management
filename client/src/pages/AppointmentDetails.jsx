import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  // ==========================================================
  // 3D TILT + SPOTLIGHT STATE
  // Doctors page = 5°
  // Appointment Details = 10% less = 4.5°
  // ==========================================================

  const detailsCardRef = useRef(null);

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const [cardRotate, setCardRotate] = useState({
    x: 0,
    y: 0,
  });

  const [isCardHovered, setIsCardHovered] = useState(false);

  // ==========================================================
  // CARD MOUSE MOVE
  // ==========================================================

  const handleDetailsCardMouseMove = (event) => {
    const card = detailsCardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePos({
      x,
      y,
    });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Doctors page = ±5°
    // This page = 10% less = ±4.5°
    const rotateX = ((y - centerY) / centerY) * -4.5;
    const rotateY = ((x - centerX) / centerX) * 4.5;

    setCardRotate({
      x: rotateX,
      y: rotateY,
    });
  };

  // ==========================================================
  // CARD MOUSE ENTER
  // ==========================================================

  const handleDetailsCardMouseEnter = () => {
    setIsCardHovered(true);
  };

  // ==========================================================
  // CARD MOUSE LEAVE
  // ==========================================================

  const handleDetailsCardMouseLeave = () => {
    setIsCardHovered(false);

    setCardRotate({
      x: 0,
      y: 0,
    });

    setMousePos({
      x: 0,
      y: 0,
    });
  };

  // ==========================================================
  // AUTH ERROR HANDLER
  // ==========================================================

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

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDateDisplay = (dateInput) => {
    if (!dateInput) return "—";

    const dateString = String(dateInput);
    const dateOnly = dateString.substring(0, 10);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const [year, month, day] = dateOnly.split("-");

      return `${day}/${month}/${year}`;
    }

    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // ==========================================================
  // STATUS BADGE
  // ==========================================================

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

  // ==========================================================
  // FETCH APPOINTMENT
  // ==========================================================

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

  // ==========================================================
  // COMPLETE APPOINTMENT
  // ==========================================================

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

  // ==========================================================
  // DELETE APPOINTMENT
  // ==========================================================

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

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
        <MedicalPlusBackground />

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />

          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl space-y-6">
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

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
        <MedicalPlusBackground />

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />

          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl space-y-4">
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
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-xs transition hover:bg-slate-50"
          >
            ← Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!appointment) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] p-4 font-sans text-slate-900 antialiased sm:p-6 lg:p-8">
        <MedicalPlusBackground />

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />

          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl rounded-[22px] border border-dashed border-slate-200 bg-white p-6 py-12 text-center">
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

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">

      {/* =====================================================
          MEDICAL PLUS BACKGROUND
      ====================================================== */}

      <MedicalPlusBackground />

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />

        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            BACK BUTTON
        ==================================================== */}

        <div>
          <Link
            to="/appointments"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white/80 border border-slate-200 text-[#08679F]
              hover:bg-slate-50 hover:border-slate-300
              text-xs font-semibold shadow-xs backdrop-blur-md
              transition-all duration-150
              active:scale-[0.99]
              focus:outline-none focus:ring-4 focus:ring-slate-200
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

            Back to Appointments
          </Link>
        </div>

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center">

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
              APPOINTMENT MANAGEMENT
            </span>

            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Appointment Details
            </h1>

            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              Overview of scheduled consultation, patient records, and doctor assignment
            </p>
          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================== */}

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
                    {completing
                      ? "Updating..."
                      : "Mark as Completed"}
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
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.682-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>

              <span>
                {deleting ? "Deleting..." : "Delete"}
              </span>
            </button>
          </div>
        </div>

        {/* ===================================================
            APPOINTMENT DETAILS CARD
            Doctors page:
              Add Doctor = 5°
              Doctor List = 3°

            This page:
              10% less than Add Doctor = 4.5°
        ==================================================== */}

        <div className="perspective-[1000px]">

          <div
            ref={detailsCardRef}
            onMouseMove={handleDetailsCardMouseMove}
            onMouseEnter={handleDetailsCardMouseEnter}
            onMouseLeave={handleDetailsCardMouseLeave}
            style={{
              transform: isCardHovered
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",

              transition: isCardHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",

              transformStyle: "preserve-3d",
            }}
            className="
              relative overflow-hidden
              rounded-[22px]
              border border-slate-200/80
              bg-white/80
              p-6
              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
              backdrop-blur-xl
              transition-colors duration-200
              hover:border-[#08679F]/40
              hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]
            "
          >

            {/* =================================================
                DYNAMIC SPOTLIGHT
            ================================================== */}

            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isCardHovered ? 1 : 0,

                background: `
                  radial-gradient(
                    500px circle at ${mousePos.x}px ${mousePos.y}px,
                    rgba(8, 103, 159, 0.08),
                    transparent 80%
                  )
                `,
              }}
            />

            {/* =================================================
                BORDER LIGHT HIGHLIGHT
            ================================================== */}

            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isCardHovered ? 1 : 0,

                background: `
                  radial-gradient(
                    350px circle at ${mousePos.x}px ${mousePos.y}px,
                    rgba(8, 103, 159, 0.25),
                    transparent 100%
                  )
                `,

                maskImage:
                  "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",

                maskComposite: "exclude",

                WebkitMaskImage:
                  "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",

                WebkitMaskComposite: "xor",

                padding: "1px",
              }}
            />

            {/* =================================================
                CONTENT
            ================================================== */}

            <div
              className="relative z-10"
              style={{
                transform: "translateZ(8px)",
                transformStyle: "preserve-3d",
              }}
            >

              <div className="divide-y divide-slate-100">

                {/* =================================================
                    APPOINTMENT OVERVIEW
                ================================================== */}

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
                      <p className="mb-1 font-medium text-slate-500">
                        Date
                      </p>

                      <p className="font-semibold text-slate-900">
                        {formatDateDisplay(
                          appointment.appointment_date
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 font-medium text-slate-500">
                        Time
                      </p>

                      <p className="font-semibold text-slate-900">
                        {appointment.appointment_time || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 font-medium text-slate-500">
                        Status
                      </p>

                      <div>
                        {renderStatusBadge(
                          appointment.status
                        )}
                      </div>
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

                {/* =================================================
                    PATIENT INFORMATION
                ================================================== */}

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
                      <p className="mb-1 font-medium text-slate-500">
                        Age
                      </p>

                      <p className="font-semibold text-slate-900">
                        {appointment.age != null &&
                        appointment.age !== ""
                          ? `${appointment.age} yrs`
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 font-medium text-slate-500">
                        Gender
                      </p>

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

                {/* =================================================
                    DOCTOR INFORMATION
                ================================================== */}

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
        </div>
      </main>
    </div>
  );
}

export default AppointmentDetails;