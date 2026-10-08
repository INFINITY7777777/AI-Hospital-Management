import { useEffect, useState, useCallback, useRef } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function Admissions() {
  const navigate = useNavigate();

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filter 3D Card Spotlight
  const filterCardRef = useRef(null);
  const [filterMousePos, setFilterMousePos] = useState({ x: 0, y: 0 });
  const [isFilterHovered, setIsFilterHovered] = useState(false);

  // Table 3D Card Spotlight
  const tableCardRef = useRef(null);
  const [tableMousePos, setTableMousePos] = useState({ x: 0, y: 0 });
  const [tableCardRotate, setTableCardRotate] = useState({ x: 0, y: 0 });
  const [isTableHovered, setIsTableHovered] = useState(false);

  const fetchAdmissions = useCallback(async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const response = await api.get("/admissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmissions(response.data.admissions || []);
    } catch (err) {
      console.error("Error fetching admissions:", err);
      setError(err.response?.data?.error || "Failed to fetch admissions");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const loadAdmissions = async () => {
      try {
        setLoading(true);
        await fetchAdmissions();
      } finally {
        setLoading(false);
      }
    };
    loadAdmissions();
  }, [navigate, fetchAdmissions]);

  const filteredAdmissions = admissions.filter((admission) => {
    const matchesSearch = admission.patient_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || admission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteAdmission = async (admission) => {
    if (admission.status !== "Discharged") {
      alert("Active admissions cannot be deleted. Discharge the patient first.");
      return;
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the admission record for ${admission.patient_name}?`
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admissions/${admission.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Admission deleted successfully");
      await fetchAdmissions();
    } catch (err) {
      console.error("Error deleting admission:", err);
      alert(err.response?.data?.error || "Failed to delete admission");
    }
  };

  const handleTableMouseMove = (e) => {
    if (!tableCardRef.current) return;
    const rect = tableCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTableMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setTableCardRotate({ x: rotateX, y: rotateY });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Admitted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Admitted
          </span>
        );
      case "Discharged":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Discharged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#F6F8FC] font-sans text-slate-900 antialiased">
        <MedicalPlusBackground />
        <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
          <Sidebar />
        </div>
        <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-9 w-40 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="flex justify-between items-center border-b border-slate-200/80 pb-5">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-200/80 rounded-lg animate-pulse" />
              <div className="h-4 w-80 bg-slate-200/80 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 bg-slate-200/80 rounded-xl animate-pulse" />
          </div>
          <div className="h-28 bg-slate-200/80 rounded-[22px] animate-pulse" />
          <div className="h-64 bg-slate-200/80 rounded-[22px] animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">
      <MedicalPlusBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-20 [&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200/80 text-[#08679F] hover:bg-white hover:border-[#08679F]/40 text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-150 active:scale-[0.99]"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Admissions Management
              </h1>
              <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#08679F] sm:inline-flex">
                Patient Care
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Manage patient hospital admissions and discharge records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admissions/add")}
            className="group relative overflow-hidden inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <span className="text-base leading-none relative z-10">+</span>
            <span className="relative z-10">Add Admission</span>
          </button>
        </div>

        {/* Search & Filter Controls Card */}
        <div
          ref={filterCardRef}
          onMouseMove={(e) => {
            if (!filterCardRef.current) return;
            const rect = filterCardRef.current.getBoundingClientRect();
            setFilterMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseEnter={() => setIsFilterHovered(true)}
          onMouseLeave={() => setIsFilterHovered(false)}
          className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
            style={{
              opacity: isFilterHovered ? 1 : 0,
              background: `radial-gradient(500px circle at ${filterMousePos.x}px ${filterMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
            }}
          />

          <div className="relative z-10">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Search Patient</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name..."
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                />
                <svg className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Filter by Status</label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-10 w-full appearance-none cursor-pointer rounded-xl border border-slate-300 bg-white py-2 pl-3.5 pr-10 text-xs font-medium text-slate-900 shadow-sm transition-all duration-150 focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Admitted">Admitted</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Admission Records</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Showing {filteredAdmissions.length} of {admissions.length} records
                    </p>
                  </div>
                  {(searchTerm || statusFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("All");
                      }}
                      className="text-[11px] font-semibold text-[#08679F] hover:text-[#07557F] transition-colors mb-1 cursor-pointer"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            <button type="button" onClick={fetchAdmissions} className="text-xs font-semibold text-rose-800 underline hover:no-underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Admissions Table Card with 3D Spotlight */}
        <section className="perspective-[1000px]">
          <div
            ref={tableCardRef}
            onMouseMove={handleTableMouseMove}
            onMouseEnter={() => setIsTableHovered(true)}
            onMouseLeave={() => {
              setIsTableHovered(false);
              setTableCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isTableHovered
                ? `rotateX(${tableCardRotate.x}deg) rotateY(${tableCardRotate.y}deg) translateZ(6px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isTableHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="animate-login-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Spotlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isTableHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${tableMousePos.x}px ${tableMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            <div className="relative z-10">
              {filteredAdmissions.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h9l3 3v15H6V3Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v4h3M9 12h6M9 16h4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No admissions found</h3>
                  <p className="mb-5 mt-1 text-xs font-medium text-slate-500">
                    {searchTerm || statusFilter !== "All"
                      ? "Try adjusting your search query or filters."
                      : "There are no admissions recorded in the system."}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/admissions/add")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#08679F] px-4 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#07557F] cursor-pointer"
                  >
                    <span className="text-base leading-none">+</span>
                    Add Admission
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="px-4 py-3.5 font-semibold text-slate-500">Patient</th>
                        <th className="px-4 py-3.5 font-semibold text-slate-500">Bed Number</th>
                        <th className="px-4 py-3.5 font-semibold text-slate-500">Admission Date</th>
                        <th className="px-4 py-3.5 font-semibold text-slate-500">Reason</th>
                        <th className="px-4 py-3.5 font-semibold text-slate-500">Diagnosis</th>
                        <th className="px-4 py-3.5 font-semibold text-slate-500">Status</th>
                        <th className="px-4 py-3.5 text-right font-semibold text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdmissions.map((admission) => (
                        <tr key={admission.id} className="group transition-colors duration-150 hover:bg-slate-50/70">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[11px] font-bold text-[#08679F]">
                                {admission.patient_name ? admission.patient_name.charAt(0).toUpperCase() : "P"}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">{admission.patient_name || "—"}</p>
                                <p className="mt-0.5 text-[10px] text-slate-400">Admission #{admission.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">
                            {admission.bed_number ? (
                              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-700">
                                {admission.bed_number}
                              </span>
                            ) : (
                              <span className="italic text-slate-400">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-600">
                            {admission.admission_date
                              ? new Date(admission.admission_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="max-w-45 truncate px-4 py-3.5 font-medium text-slate-600">{admission.admission_reason || "—"}</td>
                          <td className="max-w-45 truncate px-4 py-3.5 font-medium text-slate-600">{admission.diagnosis || "—"}</td>
                          <td className="px-4 py-3.5">{getStatusBadge(admission.status)}</td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/admissions/${admission.id}`)}
                                className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                              >
                                View
                              </button>
                              {admission.status === "Discharged" && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdmission(admission)}
                                  className="h-8 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 transition-all duration-150 hover:bg-rose-100 cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}

export default Admissions;