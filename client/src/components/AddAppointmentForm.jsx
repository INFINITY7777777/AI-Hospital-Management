import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function AddAppointmentForm({ refreshAppointments }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [appointmentData, setAppointmentData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // 3D CARD / SPOTLIGHT
  // ==========================================================

  const cardRef = useRef(null);

  const handleCardMouseMove = (event) => {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Maximum ±4 degrees
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(4px)
    `;

    card.style.setProperty("--spot-x", `${x}px`);
    card.style.setProperty("--spot-y", `${y}px`);
  };

  const handleCardMouseLeave = () => {
    const card = cardRef.current;

    if (!card) return;

    card.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0)
    `;
  };

  // ==========================================================
  // LOAD PATIENTS + DOCTORS
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        const [patientsResponse, doctorsResponse] = await Promise.all([
          api.get("/patients"),
          api.get("/doctors"),
        ]);

        setPatients(patientsResponse.data.patients || []);
        setDoctors(doctorsResponse.data.doctors || []);
      } catch (error) {
        console.error(
          "Error loading patients and doctors:",
          error
        );

        setError(
          error.response?.data?.error ||
            "Failed to load patients or doctors."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAppointmentData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================================
  // HANDLE SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/appointments", {
        patientId: Number(appointmentData.patientId),
        doctorId: Number(appointmentData.doctorId),
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        reason: appointmentData.reason,
      });

      setSuccess("Appointment created successfully!");

      setAppointmentData({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });

      if (refreshAppointments) {
        await refreshAppointments();
      }
    } catch (error) {
      console.error(
        "Error creating appointment:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create appointment."
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
      <div
        className="
          relative
          mt-6
          overflow-hidden
          rounded-[20px]
          border
          border-slate-200/80
          bg-white
          p-6
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        "
      >
        <MedicalPlusBackground />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-0
            bg-linear-to-br
            from-white/70
            via-[#F6F8FC]/40
            to-[#F8FAFC]/60
          "
        />

        <div className="relative z-10">

          <div
            className="
              mb-6
              h-5
              w-48
              animate-pulse
              rounded-md
              bg-slate-100
            "
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="h-10 animate-pulse rounded-xl bg-slate-100/80" />

            <div className="h-10 animate-pulse rounded-xl bg-slate-100/80" />

            <div className="h-10 animate-pulse rounded-xl bg-slate-100/80" />

            <div className="h-10 animate-pulse rounded-xl bg-slate-100/80" />

            <div className="h-24 animate-pulse rounded-xl bg-slate-100/80 md:col-span-2" />

          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN FORM
  // ==========================================================

  return (
    <div
      ref={cardRef}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      className="
        relative
        mt-6
        overflow-hidden
        rounded-[20px]
        border
        border-slate-200/80
        bg-white
        p-6
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        transition-[transform,box-shadow,border-color]
        duration-500
        ease-out
        will-change-transform
      "
      style={{
        transformStyle: "preserve-3d",
      }}
    >

      {/* ======================================================
          MEDICAL BACKGROUND
      ======================================================= */}

      <MedicalPlusBackground />

      {/* ======================================================
          ATMOSPHERIC OVERLAY
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-linear-to-br
          from-white/70
          via-[#F6F8FC]/40
          to-[#F8FAFC]/60
        "
      />

      {/* ======================================================
          CURSOR SPOTLIGHT
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
        style={{
          background:
            "radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(8,103,159,0.075), transparent 72%)",
        }}
      />

      {/* ======================================================
          BORDER GLOW
      ======================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -inset-px
          z-10
          rounded-[20px]
          opacity-0
          transition-opacity
          duration-300
        "
        style={{
          background:
            "radial-gradient(350px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(8,103,159,0.22), transparent 100%)",

          mask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",

          maskComposite: "exclude",

          WebkitMask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",

          WebkitMaskComposite: "xor",

          padding: "1px",
        }}
      />

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <div
        className="relative z-20"
        style={{
          transform: "translateZ(8px)",
        }}
      >

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">

          <h2
            className="
              text-base
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Create Appointment
          </h2>

          <p
            className="
              mt-0.5
              text-xs
              font-medium
              text-slate-500
            "
          >
            Schedule a new consultation for an existing patient.
          </p>

        </div>

        {/* ====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error && (
          <div
            className="
              mb-5
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              border-rose-200
              bg-rose-50/80
              px-4
              py-3
              text-xs
              font-medium
              text-rose-700
            "
          >
            <svg
              className="h-4 w-4 shrink-0 text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />

              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              />

              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              />
            </svg>

            <span>{error}</span>
          </div>
        )}

        {/* ====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {success && (
          <div
            className="
              mb-5
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              border-emerald-200
              bg-emerald-50/80
              px-4
              py-3
              text-xs
              font-medium
              text-emerald-700
            "
          >
            <svg
              className="h-4 w-4 shrink-0 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0"
              />
            </svg>

            <span>{success}</span>
          </div>
        )}

        {/* ====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >

            {/* ==================================================
                PATIENT
            =================================================== */}

            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Select Patient{" "}
                <span className="text-rose-500">*</span>
              </label>

              <select
                name="patientId"
                value={appointmentData.patientId}
                onChange={handleChange}
                required
                className="
                  h-10
                  w-full
                  rounded-[10px]
                  border
                  border-slate-300
                  bg-white
                  px-3.5
                  text-xs
                  text-slate-800
                  transition-all
                  duration-150
                  hover:border-slate-400
                  focus:border-[#08679F]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#08679F]/20
                "
              >
                <option value="">
                  Select a patient
                </option>

                {patients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    {patient.patient_name}
                  </option>
                ))}
              </select>

            </div>

            {/* ==================================================
                DOCTOR
            =================================================== */}

            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Select Doctor{" "}
                <span className="text-rose-500">*</span>
              </label>

              <select
                name="doctorId"
                value={appointmentData.doctorId}
                onChange={handleChange}
                required
                className="
                  h-10
                  w-full
                  rounded-[10px]
                  border
                  border-slate-300
                  bg-white
                  px-3.5
                  text-xs
                  text-slate-800
                  transition-all
                  duration-150
                  hover:border-slate-400
                  focus:border-[#08679F]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#08679F]/20
                "
              >
                <option value="">
                  Select a doctor
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >
                    {doctor.doctor_name}

                    {doctor.specialization
                      ? ` - ${doctor.specialization}`
                      : ""}
                  </option>
                ))}
              </select>

            </div>

            {/* ==================================================
                DATE
            =================================================== */}

            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Appointment Date{" "}
                <span className="text-rose-500">*</span>
              </label>

              <input
                type="date"
                name="appointmentDate"
                value={appointmentData.appointmentDate}
                onChange={handleChange}
                required
                className="
                  h-10
                  w-full
                  rounded-[10px]
                  border
                  border-slate-300
                  bg-white
                  px-3.5
                  text-xs
                  text-slate-800
                  transition-all
                  duration-150
                  hover:border-slate-400
                  focus:border-[#08679F]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#08679F]/20
                "
              />

            </div>

            {/* ==================================================
                TIME
            =================================================== */}

            <div>

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Appointment Time{" "}
                <span className="text-rose-500">*</span>
              </label>

              <input
                type="time"
                name="appointmentTime"
                value={appointmentData.appointmentTime}
                onChange={handleChange}
                required
                className="
                  h-10
                  w-full
                  rounded-[10px]
                  border
                  border-slate-300
                  bg-white
                  px-3.5
                  text-xs
                  text-slate-800
                  transition-all
                  duration-150
                  hover:border-slate-400
                  focus:border-[#08679F]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#08679F]/20
                "
              />

            </div>

            {/* ==================================================
                REASON
            =================================================== */}

            <div className="md:col-span-2">

              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                "
              >
                Reason for Appointment
              </label>

              <textarea
                name="reason"
                value={appointmentData.reason}
                onChange={handleChange}
                rows="3"
                placeholder="Enter clinical reason or notes for the visit..."
                className="
                  w-full
                  resize-none
                  rounded-[10px]
                  border
                  border-slate-300
                  bg-white
                  p-3.5
                  text-xs
                  text-slate-800
                  transition-all
                  duration-150
                  hover:border-slate-400
                  focus:border-[#08679F]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#08679F]/20
                "
              />

            </div>

          </div>

          {/* ==================================================
              SUBMIT BUTTON
          =================================================== */}

          <div className="pt-2">

            <button
              type="submit"
              disabled={submitting}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-[10px]
                bg-[#08679F]
                px-5
                text-xs
                font-semibold
                text-white
                transition-all
                duration-150
                hover:-translate-y-0.5
                hover:bg-[#07557F]
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting
                ? "Creating Appointment..."
                : "Create Appointment"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default AddAppointmentForm;