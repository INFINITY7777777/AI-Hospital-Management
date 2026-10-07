import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

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

  // Load appointment, patients, and doctors.
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

        // The shared API service attaches the JWT automatically.
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

  // Handle input changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Submit appointment updates.
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

  // Loading state.
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-9 w-48 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="border-b border-slate-200/80 pb-5">
            <div className="h-8 w-64 bg-slate-200/80 rounded-lg animate-pulse" />
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state.
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
            to={`/appointments/${id}`}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-slate-200 text-[#08679F] hover:bg-slate-50 text-xs font-semibold shadow-xs"
          >
            ← Back to Appointment Details
          </Link>
        </div>
      </div>
    );
  }

  // Main form.
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back to appointment details */}
        <div className="flex items-center justify-between">
          <Link
            to={`/appointments/${id}`}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200"
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

        {/* Page header */}
        <div className="border-b border-slate-200/80 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Edit Appointment
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Modify appointment schedule, assigned doctor, patient, or status.
          </p>
        </div>

        {/* Form container */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Patient */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Patient <span className="text-rose-500">*</span>
                </label>

                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
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
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Doctor <span className="text-rose-500">*</span>
                </label>

                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
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

              {/* Appointment date */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Appointment Date <span className="text-rose-500">*</span>
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>

              {/* Appointment time */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Appointment Time <span className="text-rose-500">*</span>
                </label>

                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Reason for Visit
                </label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter reason for appointment"
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Appointment"}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/appointments/${id}`)}
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all duration-150 active:scale-[0.99]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditAppointment;