import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar.jsx";
import MedicalPlusBackground from "../components/MedicalPlusBackground.jsx";

function BedList() {
  const navigate = useNavigate();

  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBed, setSelectedBed] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================================
  // 3D EFFECT STATE
  // ==========================================================
  const wardCardRefs = useRef({});

  const [hoveredWard, setHoveredWard] = useState(null);
  const [mousePositions, setMousePositions] = useState({});
  const [wardRotations, setWardRotations] = useState({});

  // Summary Card 3D State
  const summaryCardRef = useRef(null);
  const [isSummaryHovered, setIsSummaryHovered] = useState(false);
  const [summaryMousePos, setSummaryMousePos] = useState({ x: 0, y: 0 });
  const [summaryCardRotate, setSummaryCardRotate] = useState({ x: 0, y: 0 });

  const handleSummaryMouseMove = (e) => {
    if (!summaryCardRef.current) return;
    const rect = summaryCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSummaryMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    setSummaryCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // FETCH BEDS & PATIENTS
  // ==========================================================
  const fetchBeds = async () => {
    try {
      setError("");
      const response = await api.get("/beds");
      setBeds(response.data?.beds || []);
    } catch (error) {
      console.error("Error fetching beds:", error);
      setError(error.response?.data?.error || "Failed to fetch beds");
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data?.patients || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError(error.response?.data?.error || "Failed to fetch patients");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchBeds(), fetchPatients()]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================================
  // BED STATISTICS
  // ==========================================================
  const totalBeds = beds.length;
  const availableBeds = beds.filter((bed) => bed.status === "Available").length;
  const occupiedBeds = beds.filter((bed) => bed.status === "Occupied").length;
  const maintenanceBeds = beds.filter((bed) => bed.status === "Maintenance").length;

  const occupancyPercentage =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // ==========================================================
  // GROUP BEDS BY WARD
  // ==========================================================
  const bedsByWard = beds.reduce((groups, bed) => {
    const wardName = bed.ward || "Unassigned Ward";
    if (!groups[wardName]) {
      groups[wardName] = [];
    }
    groups[wardName].push(bed);
    return groups;
  }, {});

  // ==========================================================
  // 3D WARD CARD EFFECTS
  // ==========================================================
  const handleWardMouseMove = (event, wardName) => {
    const card = wardCardRefs.current[wardName];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setMousePositions((previous) => ({
      ...previous,
      [wardName]: { x, y },
    }));

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setWardRotations((previous) => ({
      ...previous,
      [wardName]: { x: rotateX, y: rotateY },
    }));
  };

  const handleWardMouseEnter = (wardName) => {
    setHoveredWard(wardName);
  };

  const handleWardMouseLeave = (wardName) => {
    setHoveredWard(null);
    setWardRotations((previous) => ({
      ...previous,
      [wardName]: { x: 0, y: 0 },
    }));
  };

  // ==========================================================
  // MODAL HANDLERS & API ACTIONS
  // ==========================================================
  const handleAssignClick = (bed) => {
    setSelectedBed(bed);
    setSelectedPatientId("");
    setModalType("assign");
  };

  const handleReleaseClick = (bed) => {
    setSelectedBed(bed);
    setModalType("release");
  };

  const closeModal = () => {
    if (actionLoading) return;
    setSelectedBed(null);
    setSelectedPatientId("");
    setModalType(null);
  };

  const handleAssignPatient = async () => {
    if (!selectedBed) return;
    if (!selectedPatientId) {
      alert("Please select a patient.");
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/beds/${selectedBed.id}/assign`, {
        patient_id: Number(selectedPatientId),
        patientId: Number(selectedPatientId),
        bed_id: Number(selectedBed.id),
        bedId: Number(selectedBed.id),
      });

      alert("Patient assigned to bed successfully.");
      await fetchBeds();
      closeModal();
    } catch (error) {
      console.error("Error assigning patient:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to assign patient."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseBed = async () => {
    if (!selectedBed) return;

    try {
      setActionLoading(true);
      await api.put(`/beds/${selectedBed.id}/release`);
      alert("Bed released successfully.");
      await fetchBeds();
      closeModal();
    } catch (error) {
      console.error("Error releasing bed:", error);
      alert(error.response?.data?.error || "Failed to release bed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBed = async (bed) => {
    if (bed.status === "Occupied") {
      alert("Occupied beds cannot be deleted. Release the bed first.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete bed ${bed.bed_number}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await api.delete(`/beds/${bed.id}`);
      alert("Bed deleted successfully.");
      await fetchBeds();
    } catch (error) {
      console.error("Error deleting bed:", error);
      alert(error.response?.data?.error || "Failed to delete bed.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Available":
        return {
          card: "border-emerald-100 bg-emerald-50/30",
          dot: "bg-emerald-500",
          badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
        };
      case "Occupied":
        return {
          card: "border-rose-100 bg-rose-50/30",
          dot: "bg-rose-500",
          badge: "bg-rose-50 text-rose-700 border border-rose-200/80",
        };
      case "Maintenance":
        return {
          card: "border-amber-100 bg-amber-50/30",
          dot: "bg-amber-500",
          badge: "bg-amber-50 text-amber-700 border border-amber-200/80",
        };
      default:
        return {
          card: "border-slate-100 bg-slate-50/30",
          dot: "bg-slate-400",
          badge: "bg-slate-100 text-slate-700 border border-slate-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <MedicalPlusBackground />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10">
          <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
            <Sidebar />
          </div>
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="h-9 w-48 bg-slate-200/80 rounded-xl animate-pulse" />
            <div className="border-b border-slate-200/80 pb-5">
              <div className="h-8 w-64 bg-slate-200/80 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-slate-200/80 rounded-[22px] animate-pulse" />
              <div className="h-28 bg-slate-200/80 rounded-[22px] animate-pulse" />
              <div className="h-28 bg-slate-200/80 rounded-[22px] animate-pulse" />
              <div className="h-28 bg-slate-200/80 rounded-[22px] animate-pulse" />
            </div>
            <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <MedicalPlusBackground />

      {/* Login Page Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10">
        <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
          <Sidebar />
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* TOP BAR */}
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200/80 text-[#08679F] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-150 active:scale-[0.99]"
            >
              <svg
                className="h-3.5 w-3.5 text-[#08679F]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Dashboard
            </Link>

            <button
              onClick={() => navigate("/beds/add")}
              className="group relative overflow-hidden inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
              <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span className="text-sm leading-none z-10">+</span>
              <span className="z-10">Add Bed</span>
            </button>
          </div>

          {/* PAGE HEADER */}
          <div className="border-b border-slate-200/80 pb-5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Bed Management
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Monitor bed availability, ward occupancy, and manage patient assignments.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
              <div className="flex items-center gap-2.5">
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

              <button
                onClick={() => {
                  setError("");
                  fetchBeds();
                  fetchPatients();
                }}
                className="text-xs font-semibold text-rose-800 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* SUMMARY CARDS IN 3D PERSPECTIVE CONTAINER */}
          <div className="perspective-[1000px]">
            <div
              ref={summaryCardRef}
              onMouseMove={handleSummaryMouseMove}
              onMouseEnter={() => setIsSummaryHovered(true)}
              onMouseLeave={() => {
                setIsSummaryHovered(false);
                setSummaryCardRotate({ x: 0, y: 0 });
              }}
              style={{
                transform: isSummaryHovered
                  ? `rotateX(${summaryCardRotate.x}deg) rotateY(${summaryCardRotate.y}deg) translateZ(6px)`
                  : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                transition: isSummaryHovered
                  ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                  : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
              }}
              className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
            >
              {/* Dynamic Spotlight Glow */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isSummaryHovered ? 1 : 0,
                  background: `radial-gradient(600px circle at ${summaryMousePos.x}px ${summaryMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                }}
              />

              {/* Border Light Highlight */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isSummaryHovered ? 1 : 0,
                  background: `radial-gradient(400px circle at ${summaryMousePos.x}px ${summaryMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                  maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-slate-500">Total Beds</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalBeds}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hospital capacity</p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-slate-500">Available</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{availableBeds}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ready for assignment</p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-slate-500">Occupied</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{occupiedBeds}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{occupancyPercentage}% occupancy rate</p>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-slate-500">Maintenance</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{maintenanceBeds}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Currently unavailable</p>
                </div>
              </div>
            </div>
          </div>

          {/* EMPTY STATE */}
          {beds.length === 0 ? (
            <div className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3 text-xl">
                🛏️
              </div>
              <h2 className="text-base font-bold text-slate-900">No beds found</h2>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
                Add your first hospital bed to begin managing capacity.
              </p>
              <button
                onClick={() => navigate("/beds/add")}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all duration-150"
              >
                + Add Bed
              </button>
            </div>
          ) : (
            /* WARD LIST */
            <div className="space-y-6">
              {Object.entries(bedsByWard).map(([wardName, wardBeds]) => {
                const wardOccupied = wardBeds.filter((bed) => bed.status === "Occupied").length;
                const wardAvailable = wardBeds.filter((bed) => bed.status === "Available").length;
                const wardMaintenance = wardBeds.filter((bed) => bed.status === "Maintenance").length;
                const wardOccupancy = wardBeds.length > 0 ? Math.round((wardOccupied / wardBeds.length) * 100) : 0;

                const rotation = wardRotations[wardName] || { x: 0, y: 0 };
                const mouse = mousePositions[wardName] || { x: 0, y: 0 };
                const isHovered = hoveredWard === wardName;

                return (
                  <div key={wardName} className="perspective-[1000px]">
                    <section
                      ref={(element) => {
                        wardCardRefs.current[wardName] = element;
                      }}
                      onMouseEnter={() => handleWardMouseEnter(wardName)}
                      onMouseMove={(event) => handleWardMouseMove(event, wardName)}
                      onMouseLeave={() => handleWardMouseLeave(wardName)}
                      className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
                      style={{
                        transform: isHovered
                          ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(8px)`
                          : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                        transformStyle: "preserve-3d",
                        transition: isHovered
                          ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                          : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                      }}
                    >
                      {/* Dynamic Spotlight Glow */}
                      <div
                        className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                        style={{
                          opacity: isHovered ? 1 : 0,
                          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                        }}
                      />

                      {/* Border Light Highlight */}
                      <div
                        className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300 z-20"
                        style={{
                          opacity: isHovered ? 1 : 0,
                          background: `radial-gradient(400px circle at ${mouse.x}px ${mouse.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                          maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                          maskComposite: "exclude",
                          WebkitMaskComposite: "xor",
                          padding: "1px",
                        }}
                      />

                      {/* CONTENT */}
                      <div
                        className="relative z-10"
                        style={{
                          transform: isHovered ? "translateZ(8px)" : "translateZ(0px)",
                          transition: "transform 0.2s ease-out",
                        }}
                      >
                        {/* WARD HEADER */}
                        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h2 className="text-base font-bold text-slate-900">
                                {wardName}
                              </h2>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {wardBeds.length} {wardBeds.length === 1 ? "bed" : "beds"} • {wardAvailable} available • {wardOccupied} occupied
                                {wardMaintenance > 0 && ` • ${wardMaintenance} maintenance`}
                              </p>
                            </div>

                            <div className="w-full md:w-56">
                              <div className="flex items-center justify-between mb-1 text-xs">
                                <span className="text-slate-500 font-medium">Occupancy</span>
                                <span className="font-bold text-slate-700">{wardOccupancy}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#08679F] rounded-full transition-all duration-300"
                                  style={{ width: `${wardOccupancy}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BED GRID */}
                        <div className="p-5 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {wardBeds.map((bed) => {
                              const styles = getStatusStyles(bed.status);

                              return (
                                <div
                                  key={bed.id}
                                  className={`border rounded-2xl p-4 ${styles.card} transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between space-y-3 backdrop-blur-md`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                      <button
                                        onClick={() => navigate(`/beds/${bed.id}`)}
                                        className="text-sm font-bold text-slate-900 hover:text-[#08679F] hover:underline truncate"
                                      >
                                        {bed.bed_number}
                                      </button>

                                      <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                                        {bed.status}
                                      </span>
                                    </div>

                                    <div className="mb-2">
                                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                        Bed Type
                                      </p>
                                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                                        {bed.bed_type || "—"}
                                      </p>
                                    </div>

                                    <div className="bg-white/80 border border-slate-200/60 rounded-xl p-2.5">
                                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                        Patient
                                      </p>
                                      {bed.patient_name ? (
                                        <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                                          {bed.patient_name}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-slate-400 mt-0.5 italic">
                                          No patient assigned
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-200/50">
                                    <button
                                      onClick={() => navigate(`/beds/${bed.id}`)}
                                      className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
                                    >
                                      View
                                    </button>

                                    <button
                                      onClick={() => navigate(`/beds/edit/${bed.id}`)}
                                      className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
                                    >
                                      Edit
                                    </button>

                                    {bed.status === "Available" && (
                                      <>
                                        <button
                                          onClick={() => handleAssignClick(bed)}
                                          disabled={actionLoading}
                                          className="h-7 px-3 rounded-lg text-xs font-semibold bg-[#08679F] hover:bg-[#07557F] text-white shadow-xs transition disabled:opacity-50"
                                        >
                                          Assign
                                        </button>

                                        <button
                                          onClick={() => handleDeleteBed(bed)}
                                          disabled={actionLoading}
                                          className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition shadow-xs disabled:opacity-50"
                                        >
                                          Delete
                                        </button>
                                      </>
                                    )}

                                    {bed.status === "Occupied" && (
                                      <button
                                        onClick={() => handleReleaseClick(bed)}
                                        disabled={actionLoading}
                                        className="h-7 px-3 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 transition shadow-xs disabled:opacity-50"
                                      >
                                        Release
                                      </button>
                                    )}

                                    {bed.status === "Maintenance" && (
                                      <button
                                        onClick={() => handleDeleteBed(bed)}
                                        disabled={actionLoading}
                                        className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition shadow-xs disabled:opacity-50"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN PATIENT MODAL */}
      {modalType === "assign" && selectedBed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !actionLoading) {
              closeModal();
            }
          }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[22px] border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Assign Patient</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign a patient to{" "}
                <span className="font-semibold text-slate-700">{selectedBed.bed_number}</span>.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Bed</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedBed.bed_number}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ward</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedBed.ward || "—"}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  disabled={actionLoading}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 disabled:bg-slate-100"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_name}
                    </option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium">
                    No patients available for assignment.
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPatient}
                disabled={actionLoading || !selectedPatientId}
                className="h-9 px-4 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Assigning..." : "Assign Patient"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RELEASE BED MODAL */}
      {modalType === "release" && selectedBed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !actionLoading) {
              closeModal();
            }
          }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-[22px] border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                  !
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Release Bed</h2>
                  <p className="text-xs text-slate-500 font-medium">Confirm bed release</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to release bed{" "}
                <strong className="text-slate-900 font-semibold">{selectedBed.bed_number}</strong>?
              </p>

              {selectedBed.patient_name && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Current Patient
                  </p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedBed.patient_name}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseBed}
                disabled={actionLoading}
                className="h-9 px-4 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Releasing..." : "Confirm Release"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BedList;