
import { useEffect, useState } from "react";
import api from "../services/api";

function AddAppointmentForm({ refreshAppointments }) {
  // PATIENTS
  const [patients, setPatients] = useState([]);

  // DOCTORS
  const [doctors, setDoctors] = useState([]);

  // FORM DATA
  const [appointmentData, setAppointmentData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  // LOADING / SUBMITTING / FEEDBACK STATES
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOAD PATIENTS + DOCTORS
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
        console.error("Error loading patients and doctors:", error);

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

  // INPUT CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setAppointmentData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // SUBMIT
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

      // RESET FORM
      setAppointmentData({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });

      // REFRESH APPOINTMENT LIST
      if (refreshAppointments) {
        await refreshAppointments();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      console.error("Backend response:", error.response?.data);

      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create appointment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="bg-white rounded-[20px] border border-slate-200/80 p-6 shadow-sm mt-6">
        <div className="h-5 w-48 bg-slate-100 rounded-md animate-pulse mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-10 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="md:col-span-2 h-24 bg-slate-100/80 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-slate-200/80 p-6 shadow-sm mt-6">
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Create Appointment
        </h2>

        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Schedule a new consultation for an existing patient.
        </p>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-700">
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

      {/* SUCCESS NOTICE */}
      {success && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-medium text-emerald-700">
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
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PATIENT SELECT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Patient <span className="text-rose-500">*</span>
            </label>

            <select
              name="patientId"
              value={appointmentData.patientId}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-[10px] border border-slate-300 bg-white text-xs text-slate-800 transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-2 focus:ring-[#08679F]/20"
            >
              <option value="">Select a patient</option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.patient_name}
                </option>
              ))}
            </select>
          </div>

          {/* DOCTOR SELECT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Doctor <span className="text-rose-500">*</span>
            </label>

            <select
              name="doctorId"
              value={appointmentData.doctorId}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-[10px] border border-slate-300 bg-white text-xs text-slate-800 transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-2 focus:ring-[#08679F]/20"
            >
              <option value="">Select a doctor</option>

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

          {/* DATE INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Appointment Date <span className="text-rose-500">*</span>
            </label>

            <input
              type="date"
              name="appointmentDate"
              value={appointmentData.appointmentDate}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-[10px] border border-slate-300 bg-white text-xs text-slate-800 transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-2 focus:ring-[#08679F]/20"
            />
          </div>

          {/* TIME INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Appointment Time <span className="text-rose-500">*</span>
            </label>

            <input
              type="time"
              name="appointmentTime"
              value={appointmentData.appointmentTime}
              onChange={handleChange}
              required
              className="w-full h-10 px-3.5 rounded-[10px] border border-slate-300 bg-white text-xs text-slate-800 transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-2 focus:ring-[#08679F]/20"
            />
          </div>

          {/* REASON TEXTAREA */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Appointment
            </label>

            <textarea
              name="reason"
              value={appointmentData.reason}
              onChange={handleChange}
              rows="3"
              placeholder="Enter clinical reason or notes for the visit..."
              className="w-full p-3.5 rounded-[10px] border border-slate-300 bg-white text-xs text-slate-800 transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 resize-none"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center h-10 px-5 rounded-[10px] bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating Appointment..." : "Create Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAppointmentForm;

