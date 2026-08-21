import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ✅ Correct source
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
          error.response?.data?.error || "Failed to fetch appointment"
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

      // Updates appointment status to Completed
      await axios.put(
        `http://localhost:5000/api/appointments/${id}`,
        { status: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Local state update
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
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <div className="p-6 text-gray-500 font-medium">
        Loading appointment details...
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/appointments")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND STATE
  // ==========================================================
  if (!appointment) {
    return (
      <div className="p-6 text-gray-500 font-medium">
        Appointment not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <button
          onClick={() => navigate("/appointments")}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
        >
          ← Back to Appointments
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Complete Appointment CTA (Hidden if already completed) */}
          {appointment.status !== "Completed" && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
            >
              {completing ? "Updating..." : "✓ Mark as Completed"}
            </button>
          )}

          <button
            onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
          >
            Edit Appointment
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Appointment"}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        Appointment Details
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-100">
        {/* ================= APPOINTMENT INFO ================= */}
        <section className="pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Appointment ID</p>
              <p className="font-semibold text-gray-900">{appointment.id}</p>
            </div>

            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">
                {formatDateDisplay(appointment.appointment_date)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-semibold text-gray-900">
                {appointment.appointment_time || "—"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`inline-block px-2.5 py-1 mt-1 rounded-full text-xs font-semibold ${
                  appointment.status === "Completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : appointment.status === "Cancelled"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {appointment.status || "Scheduled"}
              </span>
            </div>

            <div className="md:col-span-2">
              <p className="text-gray-500">Reason</p>
              <p className="font-semibold text-gray-900">
                {appointment.reason || "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* ================= PATIENT INFO ================= */}
        <section className="py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Patient Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Patient Name</p>
              <p className="font-semibold text-gray-900">
                {appointment.patient_name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Age</p>
              <p className="font-semibold text-gray-900">
                {appointment.age || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-semibold text-gray-900">
                {appointment.gender || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-semibold text-gray-900">
                {appointment.phone || "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* ================= DOCTOR INFO ================= */}
        <section className="pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Doctor Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Doctor Name</p>
              <p className="font-semibold text-gray-900">
                {appointment.doctor_name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Specialization</p>
              <p className="font-semibold text-gray-900">
                {appointment.specialization || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Department</p>
              <p className="font-semibold text-gray-900">
                {appointment.department || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-semibold text-gray-900">
                {appointment.doctor_phone || "N/A"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AppointmentDetails;