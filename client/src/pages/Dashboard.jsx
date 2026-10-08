// ==========================================================
// DASHBOARD
// Integrated with Login background, spotlight, tilt, and animations.
// Backend/API/business logic preserved intact.
// ==========================================================

import { useEffect, useState, useRef } from "react";
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
import MedicalPlusBackground from "../components/MedicalPlusBackground";

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
  const [upcomingAppointmentsList, setUpcomingAppointmentsList] = useState([]);
  const [wardSummary, setWardSummary] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // ==========================================================
  // 3D TILT & SPOTLIGHT HOOK / REFS FOR CARDS/SECTIONS
  // ==========================================================

  const headerRef = useRef(null);
  const [headerMousePos, setHeaderMousePos] = useState({ x: 0, y: 0 });
  const [headerRotate, setHeaderRotate] = useState({ x: 0, y: 0 });
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const handleMouseMoveHeader = (e) => {
    if (!headerRef.current) return;
    const rect = headerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHeaderMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setHeaderRotate({ x: rotateX, y: rotateY });
  };

  const chartRef = useRef(null);
  const [chartMousePos, setChartMousePos] = useState({ x: 0, y: 0 });
  const [chartRotate, setChartRotate] = useState({ x: 0, y: 0 });
  const [isChartHovered, setIsChartHovered] = useState(false);

  const handleMouseMoveChart = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setChartMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;

    setChartRotate({ x: rotateX, y: rotateY });
  };

  const wardRef = useRef(null);
  const [wardMousePos, setWardMousePos] = useState({ x: 0, y: 0 });
  const [wardRotate, setWardRotate] = useState({ x: 0, y: 0 });
  const [isWardHovered, setIsWardHovered] = useState(false);

  const handleMouseMoveWard = (e) => {
    if (!wardRef.current) return;
    const rect = wardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setWardMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setWardRotate({ x: rotateX, y: rotateY });
  };

  const todayConsultsRef = useRef(null);
  const [todayMousePos, setTodayMousePos] = useState({ x: 0, y: 0 });
  const [todayRotate, setTodayRotate] = useState({ x: 0, y: 0 });
  const [isTodayHovered, setIsTodayHovered] = useState(false);

  const handleMouseMoveToday = (e) => {
    if (!todayConsultsRef.current) return;
    const rect = todayConsultsRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTodayMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTodayRotate({ x: rotateX, y: rotateY });
  };

  const upcomingRef = useRef(null);
  const [upcomingMousePos, setUpcomingMousePos] = useState({ x: 0, y: 0 });
  const [upcomingRotate, setUpcomingRotate] = useState({ x: 0, y: 0 });
  const [isUpcomingHovered, setIsUpcomingHovered] = useState(false);

  const handleMouseMoveUpcoming = (e) => {
    if (!upcomingRef.current) return;
    const rect = upcomingRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setUpcomingMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setUpcomingRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // DATA FETCHING
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

        const [statsRes, todayRes, upcomingRes, bedRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/today-appointments"),
          api.get("/dashboard/upcoming-appointments"),
          api.get("/dashboard/bed-summary"),
        ]);

        if (statsRes.data.statistics) {
          setStatistics(statsRes.data.statistics);
        }

        if (statsRes.data.recentPatients) {
          setRecentPatients(statsRes.data.recentPatients);
        }

        setTodayAppointments(todayRes.data.appointments || []);
        setUpcomingAppointmentsList(upcomingRes.data.appointments || []);
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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
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
  // ==========================================================

  const totalBeds =
    Number(statistics.occupiedBeds || 0) +
    Number(statistics.availableBeds || 0);

  const occupancyPercentage =
    totalBeds > 0
      ? Math.round((Number(statistics.occupiedBeds || 0) / totalBeds) * 100)
      : 0;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#F6F8FC] font-sans text-slate-800 antialiased">
      {/* Medical Plus Interactive Background Canvas */}
      <MedicalPlusBackground />

      {/* Decorative background glow overlays */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <Navbar onOpenSearch={() => setIsSearchModalOpen(true)} />

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1700px] space-y-5 p-4 sm:p-5 lg:p-6">
            
            {/* PAGE HEADER */}
            <div className="perspective-[1000px]">
              <section
                ref={headerRef}
                onMouseMove={handleMouseMoveHeader}
                onMouseEnter={() => setIsHeaderHovered(true)}
                onMouseLeave={() => {
                  setIsHeaderHovered(false);
                  setHeaderRotate({ x: 0, y: 0 });
                }}
                style={{
                  transform: isHeaderHovered
                    ? `rotateX(${headerRotate.x}deg) rotateY(${headerRotate.y}deg) translateZ(8px)`
                    : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                  transition: isHeaderHovered
                    ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                    : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                }}
                className="animate-dashboard-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
              >
                {/* Dynamic Spotlight Glow effect inside header card */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                  style={{
                    opacity: isHeaderHovered ? 1 : 0,
                    background: `radial-gradient(600px circle at ${headerMousePos.x}px ${headerMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                  }}
                />

                {/* Card Border Light Highlight */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                  style={{
                    opacity: isHeaderHovered ? 1 : 0,
                    background: `radial-gradient(400px circle at ${headerMousePos.x}px ${headerMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                    maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                />

                <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h1 className="text-[25px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[28px]">
                        Hospital Command Center
                      </h1>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </div>

                    <p className="max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                      Clinical operations overview, patient throughput, ward capacity, and appointment scheduling.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => navigate("/patients")}
                      className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#08679f] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(8,103,159,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#075b8e] hover:shadow-[0_12px_25px_rgba(8,103,159,0.35)] active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                      <Plus className="relative z-10 h-4 w-4" />
                      <span className="relative z-10">New Patient</span>
                    </button>

                    <button
                      onClick={() => setIsAlertModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow-md active:scale-[0.98]"
                    >
                      <Siren className="h-4 w-4" />
                      Emergency Alert
                    </button>
                  </div>
                </div>

                <div className="relative z-10 mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Live operational status</span>
                  <span className="font-semibold text-emerald-600">
                    Normal Capacity
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Dashboard data synchronized with hospital records</span>
                </div>
              </section>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 shadow-sm">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </span>

                <button onClick={() => setError("")} className="font-bold underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* KPI CARDS */}
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

            {/* TOP ROW: PATIENT TREND CHART (2 COLS) + WARD BED CAPACITY (1 COL) */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {/* PATIENT TREND */}
              <div className="perspective-[1000px] xl:col-span-2">
                <div
                  ref={chartRef}
                  onMouseMove={handleMouseMoveChart}
                  onMouseEnter={() => setIsChartHovered(true)}
                  onMouseLeave={() => {
                    setIsChartHovered(false);
                    setChartRotate({ x: 0, y: 0 });
                  }}
                  style={{
                    transform: isChartHovered
                      ? `rotateX(${chartRotate.x}deg) rotateY(${chartRotate.y}deg) translateZ(6px)`
                      : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isChartHovered
                      ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                      : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                  }}
                  className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
                >
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isChartHovered ? 1 : 0,
                      background: `radial-gradient(600px circle at ${chartMousePos.x}px ${chartMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isChartHovered ? 1 : 0,
                      background: `radial-gradient(400px circle at ${chartMousePos.x}px ${chartMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                      maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                  />
                  <div className="relative z-10">
                    <PatientTrendChart />
                  </div>
                </div>
              </div>

              {/* WARD CAPACITY */}
              <div className="perspective-[1000px]">
                <div
                  ref={wardRef}
                  onMouseMove={handleMouseMoveWard}
                  onMouseEnter={() => setIsWardHovered(true)}
                  onMouseLeave={() => {
                    setIsWardHovered(false);
                    setWardRotate({ x: 0, y: 0 });
                  }}
                  style={{
                    transform: isWardHovered
                      ? `rotateX(${wardRotate.x}deg) rotateY(${wardRotate.y}deg) translateZ(6px)`
                      : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isWardHovered
                      ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                      : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                  }}
                  className="relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
                >
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isWardHovered ? 1 : 0,
                      background: `radial-gradient(500px circle at ${wardMousePos.x}px ${wardMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isWardHovered ? 1 : 0,
                      background: `radial-gradient(350px circle at ${wardMousePos.x}px ${wardMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                      maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                  />

                  <div className="relative z-10">
                    <div className="mb-4 flex items-start justify-between">
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
                        className="text-[11px] font-bold text-[#08679f] transition-all hover:underline"
                      >
                        Manage
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-55 overflow-y-auto pr-1">
                      {wardSummary.length === 0 ? (
                        <div className="rounded-xl bg-slate-50 py-8 text-center">
                          <BedDouble className="mx-auto mb-2 h-5 w-5 text-slate-300" />
                          <p className="text-[11px] text-slate-400">
                            No ward capacity status available.
                          </p>
                        </div>
                      ) : (
                        wardSummary.map((ward, idx) => {
                          const total = parseInt(ward.total_beds) || 1;
                          const occupied = parseInt(ward.occupied_beds) || 0;
                          const percentage = Math.round((occupied / total) * 100);

                          return (
                            <div
                              key={idx}
                              className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition-all duration-200 hover:bg-white hover:shadow-xs"
                            >
                              <div className="mb-1.5 flex items-center justify-between gap-3">
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

                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    percentage > 85
                                      ? "bg-rose-500"
                                      : percentage > 50
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
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

                  <div className="relative z-10 mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
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
              </div>
            </section>

            {/* BOTTOM ROW: TODAY'S CONSULTATIONS + UPCOMING APPOINTMENTS (SIDE-BY-SIDE) */}
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* TODAY'S CONSULTATIONS */}
              <div className="perspective-[1000px]">
                <div
                  ref={todayConsultsRef}
                  onMouseMove={handleMouseMoveToday}
                  onMouseEnter={() => setIsTodayHovered(true)}
                  onMouseLeave={() => {
                    setIsTodayHovered(false);
                    setTodayRotate({ x: 0, y: 0 });
                  }}
                  style={{
                    transform: isTodayHovered
                      ? `rotateX(${todayRotate.x}deg) rotateY(${todayRotate.y}deg) translateZ(6px)`
                      : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isTodayHovered
                      ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                      : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                  }}
                  className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
                >
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isTodayHovered ? 1 : 0,
                      background: `radial-gradient(500px circle at ${todayMousePos.x}px ${todayMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isTodayHovered ? 1 : 0,
                      background: `radial-gradient(350px circle at ${todayMousePos.x}px ${todayMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                      maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                  />

                  <div className="relative z-10">
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
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#08679f] transition-all hover:gap-2"
                      >
                        View All
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

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
                            className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#08679f] ring-1 ring-blue-100">
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
                              <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[10px] font-bold text-slate-700">
                                {appt.appointment_time}
                              </span>

                              <span
                                className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide ${
                                  appt.status === "Completed"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : appt.status === "Cancelled"
                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                }`}
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
              </div>

              {/* UPCOMING APPOINTMENTS */}
              <div className="perspective-[1000px]">
                <div
                  ref={upcomingRef}
                  onMouseMove={handleMouseMoveUpcoming}
                  onMouseEnter={() => setIsUpcomingHovered(true)}
                  onMouseLeave={() => {
                    setIsUpcomingHovered(false);
                    setUpcomingRotate({ x: 0, y: 0 });
                  }}
                  style={{
                    transform: isUpcomingHovered
                      ? `rotateX(${upcomingRotate.x}deg) rotateY(${upcomingRotate.y}deg) translateZ(6px)`
                      : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isUpcomingHovered
                      ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                      : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                  }}
                  className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
                >
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isUpcomingHovered ? 1 : 0,
                      background: `radial-gradient(500px circle at ${upcomingMousePos.x}px ${upcomingMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isUpcomingHovered ? 1 : 0,
                      background: `radial-gradient(350px circle at ${upcomingMousePos.x}px ${upcomingMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                      maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                  />

                  <div className="relative z-10">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[15px] font-bold text-slate-900">
                            Upcoming Appointments
                          </h2>

                          <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-blue-600">
                            7 Days
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Scheduled beyond today
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("/appointments")}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#08679f] transition-all hover:gap-2"
                      >
                        View All
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

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
                    ) : upcomingAppointmentsList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
                        <Clock3 className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-500">
                          No upcoming appointments scheduled for the next 7 days.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingAppointmentsList.map((appt) => (
                          <div
                            key={appt.id}
                            className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 ring-1 ring-indigo-100">
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
                              <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[10px] font-bold text-slate-700">
                                {appt.appointment_date} {appt.appointment_time}
                              </span>

                              <span
                                className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide ${
                                  appt.status === "Completed"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : appt.status === "Cancelled"
                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                    : "border-indigo-200 bg-indigo-50 text-indigo-700"
                                }`}
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
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* MODALS */}
      <RaiseAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Entry animation styles */}
      <style>{`
        @keyframes dashboardCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-dashboard-card {
          animation: dashboardCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-dashboard-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;