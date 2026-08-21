import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ==========================================================
// IMPORTED COMPONENTS
// ==========================================================
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
import RaiseAlertModal from "../components/RaiseAlertModal";
import GlobalSearchModal from "../components/GlobalSearchModal";
import PatientTrendChart from "../components/PatientTrendChart";

function Dashboard() {
  const navigate = useNavigate();

  // STATE MANAGEMENT
  const [statistics, setStatistics] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalAdmissions: 0,
    activeAdmissions: 0,
    occupiedBeds: 0,
    availableBeds: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [wardSummary, setWardSummary] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MODAL CONTROLS
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // DATA FETCHING & KEYBOARD LISTENERS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const axiosConfig = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, todayRes, bedRes] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/stats", axiosConfig),
          axios.get("http://localhost:5000/api/dashboard/today-appointments", axiosConfig),
          axios.get("http://localhost:5000/api/dashboard/bed-summary", axiosConfig),
        ]);

        if (statsRes.data.statistics) {
          setStatistics(statsRes.data.statistics);
        }

        if (statsRes.data.recentPatients) {
          setRecentPatients(statsRes.data.recentPatients);
        }

        setTodayAppointments(todayRes.data.appointments || []);
        setWardSummary(bedRes.data.wardSummary || []);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // KEYBOARD SHORTCUT LISTENER (Ctrl+K / Cmd+K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onOpenSearch={() => setIsSearchModalOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: HEADER & QUICK ACTIONS BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hospital Overview</h1>
              <p className="text-xs text-gray-500 mt-1">
                Real-time status and high-level patient management
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
              >
                <span>🔍</span> Quick Search <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded shadow-xs">Ctrl+K</kbd>
              </button>

              <button
                onClick={() => navigate("/patients")}
                className="px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                + Add Patient
              </button>

              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 transition"
              >
                🚨 Raise Emergency Alert
              </button>
            </div>
          </div>

          {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs rounded-xl">{error}</div>}

          {/* SECTION 2: STATS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard title="Total Patients" value={statistics.totalPatients} icon="👥" color="blue" />
            <DashboardCard title="Active Admissions" value={statistics.activeAdmissions} icon="🏥" color="amber" />
            <DashboardCard
              title="Occupied Beds"
              value={`${statistics.occupiedBeds} / ${statistics.occupiedBeds + statistics.availableBeds}`}
              icon="🛏️"
              color="rose"
            />
            <DashboardCard title="Today's Appointments" value={statistics.todayAppointments} icon="📅" color="emerald" />
            <DashboardCard title="Upcoming Appointments" value={statistics.upcomingAppointments} icon="⏳" color="indigo" />
          </div>

          {/* SECTION 3: MAIN DATA GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: CHART & TODAY'S APPOINTMENTS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* PATIENT TREND CHART WIDGET */}
              <PatientTrendChart />

              {/* TODAY'S APPOINTMENTS LIST */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-900">Today's Appointments</h2>
                  <button onClick={() => navigate("/appointments")} className="text-xs text-blue-600 font-semibold hover:underline">
                    View All →
                  </button>
                </div>

                {loading ? (
                  <p className="text-xs text-gray-400 py-4 animate-pulse">Loading appointments...</p>
                ) : todayAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No appointments scheduled for today.</p>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((appt) => (
                      <div key={appt.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-800">{appt.patient_name}</p>
                          <p className="text-gray-500">Dr. {appt.doctor_name} • {appt.specialization}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono bg-white px-2 py-1 rounded text-gray-700 border border-gray-100">
                            {appt.appointment_time}
                          </span>
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold mt-1 ${
                                appt.status === "Completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : appt.status === "Cancelled"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {appt.status || "Scheduled"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: BED OCCUPANCY & UPCOMING CARDS */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-gray-900">Bed Occupancy</h2>
                    <button onClick={() => navigate("/beds")} className="text-xs text-blue-600 font-semibold hover:underline">
                      Manage →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {wardSummary.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4">No ward status available.</p>
                    ) : (
                      wardSummary.map((ward, idx) => {
                        const total = parseInt(ward.total_beds) || 1;
                        const occupied = parseInt(ward.occupied_beds) || 0;
                        const percentage = Math.round((occupied / total) * 100);

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-gray-700">
                              <span>{ward.ward_name}</span>
                              <span>{occupied}/{total} Beds ({percentage}%)</span>
                            </div>
                            
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  percentage > 85 ? "bg-rose-500" : percentage > 50 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Recent Registrations: {recentPatients.length}</span>
                  <button onClick={() => navigate("/patients")} className="text-blue-600 font-medium hover:underline">
                    View Patient Directory
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Upcoming Appointments</h2>
                    <p className="text-xs text-gray-500">Scheduled beyond today</p>
                  </div>
                  <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                    {statistics.upcomingAppointments}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/appointments")}
                  className="w-full py-2 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition text-center border border-gray-100"
                >
                  View Full Schedule →
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      <RaiseAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} />
      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
}

export default Dashboard;