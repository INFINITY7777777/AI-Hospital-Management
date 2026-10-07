// ==========================================================
// DASHBOARD
// UI REDESIGN ONLY
// Backend/API/business logic intentionally preserved
// ==========================================================

import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  Users,
  BedDouble,
  CalendarDays,
  Clock3,
  Plus,
  Siren,
  ChevronRight,
  Activity,
  AlertTriangle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import DashboardCard from "../components/DashboardCard";
import PatientTrendChart from "../components/PatientTrendChart";

import RaiseAlertModal from "../components/RaiseAlertModal";
import GlobalSearchModal from "../components/GlobalSearchModal";

function Dashboard() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

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

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // ==========================================================
  // DATA FETCHING
  // IMPORTANT: API LOGIC PRESERVED
  // ==========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, todayRes, bedRes] = await Promise.all([
          api.get(
            "/dashboard/stats",
          ),

          api.get(
            "/dashboard/today-appointments",
          ),

          api.get(
            "/dashboard/bed-summary",
          ),
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

    // ========================================================
    // CTRL + K / CMD + K SEARCH
    // ========================================================

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  // ==========================================================
  // CALCULATED VALUES
  // These are still completely database driven
  // ==========================================================

  const totalBeds =
    Number(statistics.occupiedBeds || 0) +
    Number(statistics.availableBeds || 0);

  const occupancyPercentage =
    totalBeds > 0
      ? Math.round(
          (Number(statistics.occupiedBeds || 0) / totalBeds) * 100
        )
      : 0;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fc] text-slate-800 antialiased">
      
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* TOP NAVBAR */}

        <Navbar
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        {/* ====================================================
            SCROLLABLE CONTENT
        ==================================================== */}

        <main className="flex-1 overflow-y-auto">

          <div className="mx-auto max-w-[1700px] space-y-5 p-4 sm:p-5 lg:p-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section
              className="
                rounded-3x1
                border border-white/80
                bg-white/70
                p-5
                shadow-[0_10px_40px_rgba(15,23,42,0.04)]
                backdrop-blur-xl
                transition-all
                duration-300
              "
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                {/* TITLE */}

                <div className="min-w-0">

                  <div className="mb-2 flex flex-wrap items-center gap-2">

                    <h1 className="text-[25px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[28px]">
                      Hospital Command Center
                    </h1>

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-emerald-700
                      "
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Live
                    </span>

                  </div>

                  <p className="max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                    Clinical operations overview, patient throughput,
                    ward capacity, and appointment scheduling.
                  </p>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    onClick={() => navigate("/patients")}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#08679f]
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      text-white
                      shadow-[0_8px_20px_rgba(8,103,159,0.20)]
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:bg-[#075b8e]
                      hover:shadow-[0_12px_25px_rgba(8,103,159,0.25)]
                      active:scale-[0.98]
                    "
                  >
                    <Plus className="h-4 w-4" />
                    New Patient
                  </button>

                  <button
                    onClick={() => setIsAlertModalOpen(true)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-rose-200
                      bg-rose-50
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      text-rose-600
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-rose-300
                      hover:bg-rose-100
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >
                    <Siren className="h-4 w-4" />
                    Emergency Alert
                  </button>

                </div>
              </div>

              {/* LIVE STATUS */}

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">

                <Activity className="h-3.5 w-3.5 text-emerald-500" />

                <span>
                  Live operational status
                </span>

                <span className="font-semibold text-emerald-600">
                  Normal Capacity
                </span>

                <span className="text-slate-300">•</span>

                <span>
                  Dashboard data synchronized with hospital records
                </span>

              </div>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-rose-200
                  bg-rose-50
                  px-4
                  py-3
                  text-xs
                  text-rose-700
                  shadow-sm
                "
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </span>

                <button
                  onClick={() => setError("")}
                  className="font-bold underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">

              <DashboardCard
                title="Total Patients"
                value={statistics.totalPatients}
                icon={<Users className="h-5 w-5" />}
                color="blue"
                onClick={() => navigate("/patients")}
              />

              <DashboardCard
                title="Active Admissions"
                value={statistics.activeAdmissions}
                icon={<Activity className="h-5 w-5" />}
                color="indigo"
                onClick={() => navigate("/admissions")}
              />

              <DashboardCard
                title="Occupied Beds"
                value={`${statistics.occupiedBeds} / ${totalBeds}`}
                icon={<BedDouble className="h-5 w-5" />}
                color="rose"
                subtitle={`${occupancyPercentage}% current occupancy`}
                onClick={() => navigate("/beds")}
              />

              <DashboardCard
                title="Today's Appointments"
                value={statistics.todayAppointments}
                icon={<CalendarDays className="h-5 w-5" />}
                color="emerald"
                onClick={() => navigate("/appointments")}
              />

              <DashboardCard
                title="Upcoming (7D)"
                value={statistics.upcomingAppointments}
                icon={<Clock3 className="h-5 w-5" />}
                color="blue"
                onClick={() => navigate("/appointments")}
              />

            </section>

            {/* =================================================
                MAIN GRID
            ================================================= */}

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

              {/* =================================================
                  LEFT / MAIN COLUMN
              ================================================= */}

              <div className="min-w-0 space-y-5 xl:col-span-2">

                {/* PATIENT TREND */}

                <div
                  className="
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    transition-all
                    duration-300
                    hover:shadow-[0_12px_35px_rgba(15,23,42,0.06)]
                  "
                >
                  <PatientTrendChart />
                </div>

                {/* =================================================
                    TODAY'S APPOINTMENTS
                ================================================= */}

                <div
                  className="
                    rounded-[22px]
                    border
                    border-slate-200/80
                    bg-white
                    p-5
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                  "
                >

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <h2 className="text-[15px] font-bold text-slate-900">
                        Today's Consultations
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Real-time doctor and outpatient schedule
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/appointments")}
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-[11px]
                        font-bold
                        text-[#08679f]
                        transition-all
                        hover:gap-2
                      "
                    >
                      View All
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                  </div>

                  {/* LOADING */}

                  {loading ? (
                    <div className="space-y-2.5">

                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="flex animate-pulse items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-200" />

                            <div className="space-y-2">
                              <div className="h-3 w-28 rounded bg-slate-200" />
                              <div className="h-2.5 w-40 rounded bg-slate-200" />
                            </div>
                          </div>

                          <div className="h-6 w-20 rounded-lg bg-slate-200" />
                        </div>
                      ))}

                    </div>
                  ) : todayAppointments.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">

                      <CalendarDays className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                      <p className="text-xs font-semibold text-slate-500">
                        No appointments scheduled for today.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-2">

                      {todayAppointments.map((appt) => (

                        <div
                          key={appt.id}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-2xl
                            border
                            border-slate-100
                            bg-slate-50/60
                            p-3
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:border-slate-200
                            hover:bg-white
                            hover:shadow-md
                          "
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-sm
                                font-bold
                                text-[#08679f]
                                ring-1
                                ring-blue-100
                              "
                            >
                              {appt.patient_name
                                ? appt.patient_name.charAt(0).toUpperCase()
                                : "P"}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-xs font-bold text-slate-800">
                                {appt.patient_name}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                Dr. {appt.doctor_name}
                                {" • "}
                                <span className="text-slate-400">
                                  {appt.specialization}
                                </span>
                              </p>

                            </div>

                          </div>

                          <div className="flex shrink-0 items-center gap-2">

                            <span
                              className="
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-2.5
                                py-1.5
                                font-mono
                                text-[10px]
                                font-bold
                                text-slate-700
                              "
                            >
                              {appt.appointment_time}
                            </span>

                            <span
                              className={`
                                rounded-lg
                                border
                                px-2.5
                                py-1.5
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-wide
                                ${
                                  appt.status === "Completed"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : appt.status === "Cancelled"
                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                }
                              `}
                            >
                              {appt.status || "Scheduled"}
                            </span>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <div className="space-y-5">

                {/* WARD CAPACITY */}

                <div
                  className="
                    rounded-[22px]
                    border
                    border-slate-200/80
                    bg-white
                    p-5
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                  "
                >

                  <div className="mb-5 flex items-start justify-between">

                    <div>
                      <h2 className="text-[15px] font-bold text-slate-900">
                        Ward Bed Capacity
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Live inpatient occupancy tracking
                      </p>
                    </div>

                    <button
                      onClick={() => navigate("/beds")}
                      className="
                        text-[11px]
                        font-bold
                        text-[#08679f]
                        transition-all
                        hover:underline
                      "
                    >
                      Manage
                    </button>

                  </div>

                  <div className="space-y-3">

                    {wardSummary.length === 0 ? (

                      <div className="rounded-xl bg-slate-50 py-8 text-center">
                        <BedDouble className="mx-auto mb-2 h-5 w-5 text-slate-300" />

                        <p className="text-[11px] text-slate-400">
                          No ward capacity status available.
                        </p>
                      </div>

                    ) : (

                      wardSummary.map((ward, idx) => {

                        const total =
                          parseInt(ward.total_beds) || 1;

                        const occupied =
                          parseInt(ward.occupied_beds) || 0;

                        const percentage = Math.round(
                          (occupied / total) * 100
                        );

                        return (
                          <div
                            key={idx}
                            className="
                              rounded-xl
                              border
                              border-slate-100
                              bg-slate-50/60
                              p-3
                              transition-all
                              duration-200
                              hover:bg-white
                              hover:shadow-sm
                            "
                          >

                            <div className="mb-2 flex items-center justify-between gap-3">

                              <span className="truncate text-[11px] font-bold text-slate-700">
                                {ward.ward_name}
                              </span>

                              <span className="shrink-0 font-mono text-[10px] font-semibold text-slate-500">
                                {occupied}/{total}
                                <span className="ml-1 text-slate-400">
                                  {percentage}%
                                </span>
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className={`
                                  h-full
                                  rounded-full
                                  transition-all
                                  duration-700
                                  ease-out
                                  ${
                                    percentage > 85
                                      ? "bg-rose-500"
                                      : percentage > 50
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }
                                `}
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      })

                    )}

                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                    <span className="text-[10px] font-medium text-slate-500">
                      Recent Registrations:
                      <strong className="ml-1 text-slate-800">
                        {recentPatients.length}
                      </strong>
                    </span>

                    <button
                      onClick={() => navigate("/patients")}
                      className="text-[10px] font-bold text-[#08679f] hover:underline"
                    >
                      Directory →
                    </button>

                  </div>

                </div>

                {/* UPCOMING APPOINTMENTS */}

                <div
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200/80
                    bg-white
                    p-5
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-blue-200
                    hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]
                  "
                >
                  {/* Subtle blue glass glow */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-12
                      -top-12
                      h-36
                      w-36
                      rounded-full
                      bg-blue-100/70
                      opacity-0
                      blur-3xl
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                    "
                  />

                  <div className="relative">

                    {/* HEADER */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <h2 className="text-[15px] font-bold text-slate-900">
                            Upcoming Appointments
                          </h2>

                          <span
                            className="
                              rounded-full
                              border
                              border-blue-100
                              bg-blue-50
                              px-2
                              py-0.5
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-blue-600
                            "
                          >
                            7 Days
                          </span>

                        </div>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Scheduled beyond today
                        </p>

                      </div>

                      {/* COUNT */}

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-blue-100
                          bg-blue-50
                          text-blue-600
                          transition-all
                          duration-300
                          group-hover:scale-105
                          group-hover:bg-blue-100
                        "
                      >
                        <Clock3 className="h-5 w-5" />
                      </div>

                    </div>

                    {/* DIVIDER */}

                    <div className="my-5 h-px bg-slate-100" />

                    {/* APPOINTMENT COUNT */}

                    <div className="flex items-end justify-between gap-4">

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Scheduled
                        </p>

                        <p className="mt-1 text-[30px] font-black tracking-[-0.04em] text-slate-900">
                          {statistics.upcomingAppointments}
                        </p>

                      </div>

                      <div
                        className="
                          rounded-lg
                          border
                          border-slate-100
                          bg-slate-50
                          px-2.5
                          py-1.5
                          text-[9px]
                          font-semibold
                          text-slate-500
                        "
                      >
                        Next 7 days
                      </div>

                    </div>

                    {/* EMPTY / INFO MESSAGE */}

                    <div
                      className="
                        mt-4
                        rounded-xl
                        border
                        border-blue-100/80
                        bg-blue-50/50
                        px-3
                        py-3
                      "
                    >
                      <p className="text-[10px] leading-4 text-slate-500">
                        {statistics.upcomingAppointments > 0
                          ? "Review upcoming appointments to prevent scheduling conflicts and maintain adequate medical coverage."
                          : "No upcoming appointments are currently scheduled for the next 7 days."}
                      </p>
                    </div>

                    {/* ACTION */}

                    <button
                      onClick={() => navigate("/appointments")}
                      className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        py-2.5
                        text-[11px]
                        font-bold
                        text-[#08679f]
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-blue-200
                        hover:bg-blue-100
                        hover:shadow-sm
                        active:scale-[0.99]
                      "
                    >
                      View Full Schedule

                      <ChevronRight
                        className="
                          h-3.5
                          w-3.5
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                        "
                      />
                    </button>

                  </div>
                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

      {/* ========================================================
          MODALS
          EXISTING FUNCTIONALITY PRESERVED
      ======================================================== */}

      <RaiseAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

    </div>
  );
}

export default Dashboard;