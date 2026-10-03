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

  // Status Badge Rendering based on HMS Master Plan Semantic Colors
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

  // HMS Standard Skeleton Loader
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-100 rounded-md animate-pulse"></div>
          <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header section displaying view summary & match count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {filter === "today"
              ? "Today's Schedule"
              : filter === "upcoming"
              ? "Upcoming Visits"
              : "Appointments Queue"}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View scheduled visits and patient appointments.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span>Showing:</span>
          <span className="text-[#08679F] font-bold">
            {filteredAppointments.length}
          </span>
          <span className="text-slate-400">/ {appointments.length}</span>
        </div>
      </div>

      {/* HMS Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-700">
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

      {/* HMS Empty State Handler */}
      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No Appointments Found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
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
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-4 py-3">Patient</th>
                <th scope="col" className="px-4 py-3">Doctor</th>
                <th scope="col" className="px-4 py-3">Specialization</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Time</th>
                <th scope="col" className="px-4 py-3">Reason</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="hover:bg-slate-50/60 transition-colors duration-150"
                >
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    {appointment.patient_name || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">
                    {appointment.doctor_name || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {appointment.specialization || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                    {formatDateDisplay(appointment.appointment_date)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap font-medium">
                    {appointment.appointment_time || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                    {appointment.reason || "N/A"}
                  </td>
                  <td className="px-4 py-3.5">
                    {renderStatusBadge(appointment.status)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                      className="
                        inline-flex items-center gap-1.5 h-8 px-3 rounded-lg
                        bg-slate-100 hover:bg-[#08679F] text-slate-700 hover:text-white
                        text-xs font-semibold transition-all duration-150 active:scale-[0.98]
                      "
                    >
                      <span>View</span>
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
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