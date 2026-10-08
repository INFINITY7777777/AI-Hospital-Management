import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function PageEffects() {
  return (
    <style>{`
      @keyframes hmsFloatOne {
        0%, 100% {
          transform: translate3d(0, 0, 0) scale(1);
        }

        50% {
          transform: translate3d(18px, -14px, 0) scale(1.04);
        }
      }

      @keyframes hmsFloatTwo {
        0%, 100% {
          transform: translate3d(0, 0, 0) scale(1);
        }

        50% {
          transform: translate3d(-16px, 12px, 0) scale(1.03);
        }
      }

      .hms-page-bg {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .hms-page-bg::before,
      .hms-page-bg::after {
        content: "";
        position: fixed;
        pointer-events: none;
        z-index: 0;
        border-radius: 9999px;
        filter: blur(50px);
        opacity: 0.15;
      }

      .hms-page-bg::before {
        width: 300px;
        height: 300px;
        top: 5%;
        right: 6%;
        background: rgba(8, 103, 159, 0.18);
        animation: hmsFloatOne 14s ease-in-out infinite;
      }

      .hms-page-bg::after {
        width: 250px;
        height: 250px;
        bottom: 5%;
        left: 6%;
        background: rgba(59, 130, 246, 0.12);
        animation: hmsFloatTwo 16s ease-in-out infinite;
      }

      .hms-content-layer {
        position: relative;
        z-index: 1;
      }

      /*
       * Spotlight card
       */
      .hms-spotlight-card {
        position: relative;
        overflow: hidden;
        transition:
          box-shadow 0.4s ease,
          border-color 0.3s ease;
        will-change: transform;
      }

      /*
       * Cursor spotlight
       */
      .hms-spotlight {
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.25s ease;

        background:
          radial-gradient(
            500px circle at var(--spot-x, 50%) var(--spot-y, 50%),
            rgba(8, 103, 159, 0.08),
            transparent 80%
          );
      }

      /*
       * Cursor-following border glow
       */
      .hms-border-glow {
        pointer-events: none;
        position: absolute;
        inset: -1px;
        z-index: 2;
        opacity: 0;
        padding: 1px;
        border-radius: inherit;
        transition: opacity 0.3s ease;

        background:
          radial-gradient(
            350px circle at var(--spot-x, 50%) var(--spot-y, 50%),
            rgba(8, 103, 159, 0.25),
            transparent 100%
          );

        mask:
          linear-gradient(#000, #000) content-box,
          linear-gradient(#000, #000);

        mask-composite: exclude;

        -webkit-mask:
          linear-gradient(#000, #000) content-box,
          linear-gradient(#000, #000);

        -webkit-mask-composite: xor;
      }

      .hms-spotlight-card:hover {
        border-color: rgba(8, 103, 159, 0.28);

        box-shadow:
          0 18px 45px rgba(15, 23, 42, 0.07),
          0 4px 15px rgba(8, 103, 159, 0.04);
      }

      .hms-spotlight-card:hover .hms-spotlight,
      .hms-spotlight-card:hover .hms-border-glow {
        opacity: 1;
      }

      @media (prefers-reduced-motion: reduce) {
        .hms-page-bg::before,
        .hms-page-bg::after {
          animation: none;
        }

        .hms-spotlight-card {
          transition:
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }
      }
    `}</style>
  );
}

function EditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    status: "Scheduled",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // 3D CARD / SPOTLIGHT STATE
  // ==========================================================

  const appointmentCardRef = useRef(null);

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const [isCardHovered, setIsCardHovered] = useState(false);

  const [cardRotate, setCardRotate] = useState({
    x: 0,
    y: 0,
  });

  // ==========================================================
  // HANDLE CARD MOUSE MOVE
  // ==========================================================

  const handleCardMouseMove = (event) => {
    const card = appointmentCardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Cursor position for spotlight
    setMousePos({
      x,
      y,
    });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // ========================================================
    // 4° 3D TILT
    // ========================================================

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setCardRotate({
      x: rotateX,
      y: rotateY,
    });
  };

  // ==========================================================
  // HANDLE CARD MOUSE ENTER
  // ==========================================================

  const handleCardMouseEnter = () => {
    setIsCardHovered(true);
  };

  // ==========================================================
  // HANDLE CARD MOUSE LEAVE
  // ==========================================================

  const handleCardMouseLeave = () => {
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
  // LOAD APPOINTMENT DATA
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const [
          appointmentResponse,
          patientsResponse,
          doctorsResponse,
        ] = await Promise.all([
          api.get(`/appointments/${id}`),
          api.get("/patients"),
          api.get("/doctors"),
        ]);

        if (!isMounted) return;

        const appointment = appointmentResponse.data.appointment;

        if (!appointment) {
          setError("Appointment not found.");
          return;
        }

        setPatients(patientsResponse.data.patients || []);
        setDoctors(doctorsResponse.data.doctors || []);

        setFormData({
          patientId: appointment.patient_id || "",
          doctorId: appointment.doctor_id || "",
          appointmentDate: appointment.appointment_date
            ? String(appointment.appointment_date).substring(0, 10)
            : "",
          appointmentTime: appointment.appointment_time
            ? String(appointment.appointment_time).substring(0, 5)
            : "",
          reason: appointment.reason || "",
          status: appointment.status || "Scheduled",
        });
      } catch (error) {
        console.error("Error loading appointment:", error);

        if (!isMounted) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }

        if (error.response?.status === 403) {
          setError("You do not have permission to edit this appointment.");
          return;
        }

        setError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to load appointment."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================================
  // HANDLE FORM SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      await api.put(`/appointments/${id}`, {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        status: formData.status,
      });

      alert("Appointment updated successfully!");

      navigate(`/appointments/${id}`);
    } catch (error) {
      console.error("Error updating appointment:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        return;
      }

      if (error.response?.status === 403) {
        setError("You do not have permission to update this appointment.");
        return;
      }

      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update appointment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <>
        <PageEffects />

        <div className="hms-page-bg min-h-screen bg-[#F6F8FC] p-4 font-sans antialiased text-slate-900 sm:p-6 lg:p-8">
          <MedicalPlusBackground />

          <div className="pointer-events-none fixed inset-0 z-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />

          <div className="hms-content-layer mx-auto max-w-7xl space-y-6">
            <div className="h-9 w-48 animate-pulse rounded-xl bg-slate-200/80" />

            <div className="border-b border-slate-200/80 pb-5">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200/80" />
            </div>

            <div className="h-96 animate-pulse rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6" />
          </div>
        </div>
      </>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <>
        <PageEffects />

        <div className="hms-page-bg min-h-screen bg-[#F6F8FC] p-4 font-sans antialiased text-slate-900 sm:p-6 lg:p-8">
          <MedicalPlusBackground />

          <div className="pointer-events-none fixed inset-0 z-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />

          <div className="hms-content-layer mx-auto max-w-7xl space-y-4">
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
              to={`/appointments/${id}`}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-[#08679F] shadow-xs transition-all duration-150 hover:bg-slate-50"
            >
              ← Back to Appointment Details
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <>
      <PageEffects />

      <div className="hms-page-bg min-h-screen bg-[#F6F8FC] p-4 font-sans antialiased text-slate-900 sm:p-6 lg:p-8">
        <MedicalPlusBackground />

        <div className="pointer-events-none fixed inset-0 z-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />

        <div className="hms-content-layer mx-auto max-w-7xl space-y-6">

          {/* =================================================
              BACK BUTTON
          ================================================== */}

          <div className="flex items-center justify-between">
            <Link
              to={`/appointments/${id}`}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 text-xs font-semibold text-[#08679F] shadow-xs transition-all duration-150 hover:border-slate-300 hover:bg-white active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200"
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

              Back to Appointment Details
            </Link>
          </div>

          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="border-b border-slate-200/80 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Edit Appointment
            </h1>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Modify appointment schedule, assigned doctor, patient, or status.
            </p>
          </div>

          {/* =================================================
              EDIT APPOINTMENT CARD
              4° 3D TILT + SPOTLIGHT + BORDER GLOW
          ================================================== */}

          <div
            ref={appointmentCardRef}
            onMouseMove={handleCardMouseMove}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            className="hms-spotlight-card rounded-[22px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6"
            style={{
              transform: isCardHovered
                ? `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(4px)`
                : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",

              transformStyle: "preserve-3d",

              transition: isCardHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
          >

            {/* =================================================
                CURSOR SPOTLIGHT
            ================================================== */}

            <div
              className="hms-spotlight"
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
                BORDER GLOW
            ================================================== */}

            <div
              className="hms-border-glow"
              style={{
                opacity: isCardHovered ? 1 : 0,

                background: `
                  radial-gradient(
                    350px circle at ${mousePos.x}px ${mousePos.y}px,
                    rgba(8, 103, 159, 0.25),
                    transparent 100%
                  )
                `,
              }}
            />

            {/* =================================================
                FORM CONTENT
            ================================================== */}

            <div
              className="relative z-10"
              style={{
                transform: "translateZ(8px)",
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* =================================================
                    FORM FIELDS
                ================================================== */}

                <div className="grid grid-cols-1 gap-5 text-xs md:grid-cols-2">

                  {/* Patient */}
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">
                      Patient <span className="text-rose-500">*</span>
                    </label>

                    <select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 shadow-xs transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    >
                      <option value="">Select patient</option>

                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.patient_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor */}
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">
                      Doctor <span className="text-rose-500">*</span>
                    </label>

                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleChange}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 shadow-xs transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    >
                      <option value="">Select doctor</option>

                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.doctor_name}
                          {doctor.specialization
                            ? ` - ${doctor.specialization}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">
                      Appointment Date{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 shadow-xs transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">
                      Appointment Time{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 shadow-xs transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-1.5 block font-semibold text-slate-700">
                      Status <span className="text-rose-500">*</span>
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-900 shadow-xs transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block font-semibold text-slate-700">
                      Reason for Visit
                    </label>

                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter reason for appointment"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-xs transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>
                </div>

                {/* =================================================
                    ACTIONS
                ================================================== */}

                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#08679F] px-5 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#07557F] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Update Appointment"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/appointments/${id}`)}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-5 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-200/80 active:scale-[0.99]"
                  >
                    Cancel
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAppointment;