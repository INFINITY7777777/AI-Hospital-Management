import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";

function AppointmentList({
  filter = "all",
  searchTerm = "",
  refreshAppointments,
}) {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const response = await api.get("/appointments");

        if (isMounted) {
          setAppointments(response.data.appointments || []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

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

    return () => {
      isMounted = false;
    };
  }, [refreshAppointments, navigate]);

  const toLocalYYYYMMDD = (dateInput) => {
    if (!dateInput) return "";

    const d = new Date(dateInput);

    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateInput) => {
    if (!dateInput) return "—";

    const d = new Date(dateInput);

    if (Number.isNaN(d.getTime())) return "—";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

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

  const filteredAppointments = appointments.filter((appt) => {
    const apptDateStr = toLocalYYYYMMDD(appt.appointment_date);
    const todayStr = toLocalYYYYMMDD(new Date());

    let matchesFilter = true;

    if (filter === "today") {
      matchesFilter = apptDateStr === todayStr;
    }

    if (filter === "upcoming") {
      matchesFilter = apptDateStr > todayStr;
    }

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

  const handleTableMouseMove = (event) => {
    const container = tableContainerRef.current;

    if (!container) return;

    const rect = container.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    container.style.setProperty("--mouse-x", `${x}px`);
    container.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleTableMouseLeave = () => {
    const container = tableContainerRef.current;

    if (!container) return;

    container.style.setProperty("--mouse-x", "50%");
    container.style.setProperty("--mouse-y", "50%");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-100 rounded-md animate-pulse" />
          <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse" />
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse" />
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

          <span className="text-slate-400">
            / {appointments.length}
          </span>
        </div>
      </div>

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

      <div
        ref={tableContainerRef}
        onMouseMove={handleTableMouseMove}
        onMouseLeave={handleTableMouseLeave}
        className="
          relative
          overflow-x-auto
          rounded-xl
          border
          border-slate-200/80
          bg-white
          isolate
          transition-all
          duration-300
          ease-out
          hover:border-[#08679F]/30
          hover:shadow-[0_12px_40px_rgba(8,103,159,0.08)]
          before:pointer-events-none
          before:absolute
          before:inset-0
          before:z-20
          before:rounded-xl
          before:opacity-0
          before:transition-opacity
          before:duration-300
          hover:before:opacity-100
          after:pointer-events-none
          after:absolute
          after:inset-0
          after:z-30
          after:rounded-xl
          after:border
          after:border-transparent
          after:opacity-0
          after:transition-opacity
          after:duration-300
          hover:after:opacity-100
        "
        style={{
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          backgroundImage:
            "linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, rgba(8,103,159,0.20), rgba(34,211,238,0.10), rgba(99,102,241,0.12))",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            rounded-xl
            opacity-0
            transition-opacity
            duration-300
            hover:opacity-100
          "
          style={{
            background:
              "radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(8,103,159,0.075), transparent 55%)",
          }}
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-30
            rounded-xl
            opacity-0
            transition-opacity
            duration-300
            hover:opacity-100
          "
          style={{
            background:
              "radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(8,103,159,0.18), transparent 65%)",
            maskImage:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskImage:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        <table
          ref={tableRef}
          className="relative z-10 w-full text-left text-xs text-slate-600"
        >
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-4 py-3">
                Patient
              </th>

              <th scope="col" className="px-4 py-3">
                Doctor
              </th>

              <th scope="col" className="px-4 py-3">
                Specialization
              </th>

              <th scope="col" className="px-4 py-3">
                Date
              </th>

              <th scope="col" className="px-4 py-3">
                Time
              </th>

              <th scope="col" className="px-4 py-3">
                Reason
              </th>

              <th scope="col" className="px-4 py-3">
                Status
              </th>

              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="
                  hover:bg-slate-50/60
                  transition-colors
                  duration-150
                "
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
                    type="button"
                    onClick={() =>
                      navigate(`/appointments/${appointment.id}`)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      h-8
                      px-3
                      rounded-lg
                      bg-slate-100
                      hover:bg-[#08679F]
                      text-slate-700
                      hover:text-white
                      text-xs
                      font-semibold
                      transition-all
                      duration-150
                      active:scale-[0.98]
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
    </div>
  );
}

export default AppointmentList;