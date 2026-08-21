import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function AppointmentList({
  filter = "all",
  searchTerm = "",
  refreshAppointments,
}) {
  const navigate = useNavigate();

  // State Management
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch appointments from API on component mount or trigger change
  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }

        const response = await axios.get(
          "http://localhost:5000/api/appointments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isMounted) {
          setAppointments(response.data.appointments || []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (isMounted) {
          setError(
            error.response?.data?.error || "Failed to load appointments."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    // Cleanup logic to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [refreshAppointments, navigate]);

  // Safe helper to convert date string/object to YYYY-MM-DD format using local time
  const toLocalYYYYMMDD = (dateInput) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date display as DD/MM/YYYY without timezone skewing
  const formatDateDisplay = (dateInput) => {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter list by selected segment tab and global search query
  const filteredAppointments = appointments.filter((appt) => {
    const apptDateStr = toLocalYYYYMMDD(appt.appointment_date);
    const todayStr = toLocalYYYYMMDD(new Date());

    // 1. Segment filter logic
    let matchesFilter = true;
    if (filter === "today") matchesFilter = apptDateStr === todayStr;
    if (filter === "upcoming") matchesFilter = apptDateStr > todayStr;

    // 2. Search filter logic
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      appt.patient_name?.toLowerCase().includes(query) ||
      appt.doctor_name?.toLowerCase().includes(query) ||
      appt.specialization?.toLowerCase().includes(query) ||
      appt.reason?.toLowerCase().includes(query) ||
      appt.status?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  // Loading skeleton placeholder
  if (loading) {
    return (
      <div className="space-y-3 p-2">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header section displaying view summary & match count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {filter === "today"
              ? "Today's Schedule"
              : filter === "upcoming"
              ? "Upcoming Visits"
              : "Appointment List"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            View and manage patient appointments
          </p>
        </div>

        <div className="text-xs text-gray-500 whitespace-nowrap">
          Showing:{" "}
          <span className="font-semibold text-gray-900">
            {filteredAppointments.length}
          </span>{" "}
          of {appointments.length}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-xs">
          {error}
        </div>
      )}

      {/* Empty State Handler */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-base font-semibold text-gray-900">
            No appointments found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {searchTerm
              ? `No appointments matching "${searchTerm}".`
              : filter === "today"
              ? "No appointments scheduled for today."
              : filter === "upcoming"
              ? "No upcoming appointments found."
              : "Create an appointment to see it listed here."}
          </p>
        </div>
      ) : (
        /* Appointment Records Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold text-gray-600">Patient</th>
                <th className="p-3 font-semibold text-gray-600">Doctor</th>
                <th className="p-3 font-semibold text-gray-600">Specialization</th>
                <th className="p-3 font-semibold text-gray-600">Date</th>
                <th className="p-3 font-semibold text-gray-600">Time</th>
                <th className="p-3 font-semibold text-gray-600">Reason</th>
                <th className="p-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {appointment.patient_name || "—"}
                  </td>
                  <td className="p-3 text-gray-700">
                    {appointment.doctor_name || "—"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {appointment.specialization || "—"}
                  </td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">
                    {formatDateDisplay(appointment.appointment_date)}
                  </td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">
                    {appointment.appointment_time || "—"}
                  </td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">
                    {appointment.reason || "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        appointment.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : appointment.status === "Cancelled"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {appointment.status || "Scheduled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AppointmentList;