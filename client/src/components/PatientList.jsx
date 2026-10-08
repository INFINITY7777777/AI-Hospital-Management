// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState, useRef } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

// ==========================================================
// PATIENT LIST
// ==========================================================

function PatientList({ refreshPatients, searchTerm, sortBy, sortOrder }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize state lazily directly from localStorage
  const [userRole] = useState(() => {
    const storedRole = localStorage.getItem("role") || "";
    return storedRole.toLowerCase().trim();
  });

  const navigate = useNavigate();

  // 3D Tilt & Spotlight Hover Animation State
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveCard = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // VIEW PATIENT
  // ==========================================================
  const handleViewPatient = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  // ==========================================================
  // FETCH PATIENTS
  // ==========================================================
  useEffect(() => {
    let isMounted = true;

    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await api.get("/patients");

        if (isMounted) {
          setPatients(response.data.patients || []);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (error.response?.status === 403) {
          if (isMounted) {
            setError("You do not have permission to view patients.");
          }
          return;
        }

        if (isMounted) {
          setError(
            error.response?.data?.error || "Failed to load patients."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPatients();

    return () => {
      isMounted = false;
    };
  }, [refreshPatients, navigate]);

  // ==========================================================
  // SEARCH & SORT
  // ==========================================================
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

  const filteredPatients = patients.filter((patient) => {
    if (!normalizedSearch) return true;

    const patientName = String(patient.patient_name || "").trim().toLowerCase();
    const patientPhone = String(patient.phone || "").trim().toLowerCase();
    const patientId = String(patient.patient_id || patient.id || "").trim().toLowerCase();

    return (
      patientName.includes(normalizedSearch) ||
      patientPhone.includes(normalizedSearch) ||
      patientId.includes(normalizedSearch)
    );
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let valueA;
    let valueB;

    if (sortBy === "patient_name") {
      valueA = String(a.patient_name || "").trim().toLowerCase();
      valueB = String(b.patient_name || "").trim().toLowerCase();
      const result = valueA.localeCompare(valueB);
      return sortOrder === "asc" ? result : -result;
    }

    if (sortBy === "age") {
      valueA = Number(a.age) || 0;
      valueB = Number(b.age) || 0;
    } else if (sortBy === "id") {
      const numericA = Number(a.patient_id || a.id);
      const numericB = Number(b.patient_id || b.id);

      if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
        valueA = numericA;
        valueB = numericB;
      } else {
        valueA = String(a.patient_id || a.id || "").toLowerCase();
        valueB = String(b.patient_id || b.id || "").toLowerCase();
        const result = valueA.localeCompare(valueB, undefined, { numeric: true });
        return sortOrder === "asc" ? result : -result;
      }
    } else {
      valueA = new Date(a.created_at || 0).getTime();
      valueB = new Date(b.created_at || 0).getTime();
    }

    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });

  // ==========================================================
  // HELPER: ROLE BADGE RENDERING
  // ==========================================================
  const renderRoleScopeBadge = () => {
    if (userRole === "doctor") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-[#08679F] border border-sky-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#08679F]"></span>
          Assigned Patients Only
        </span>
      );
    }
    if (userRole === "staff" || userRole === "nurse") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Admitted / Ward Patients
        </span>
      );
    }
    if (userRole === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
          All Patients (Admin View)
        </span>
      );
    }
    return null;
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <div className="p-5 sm:p-6 space-y-4 rounded-[22px] border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-100 rounded-md animate-pulse"></div>
          <div className="h-4 w-24 bg-slate-100 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="perspective-[1000px]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMoveCard}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCardRotate({ x: 0, y: 0 });
        }}
        style={{
          transform: isHovered
            ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(10px)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered
            ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
        }}
        className="relative overflow-hidden p-5 sm:p-6 space-y-5 rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
      >
        {/* Dynamic Spotlight Glow effect inside Patient List Card */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
          }}
        />

        {/* Border Light Highlight */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
            maskImage:
              "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        <div className="relative z-10 space-y-5">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Patient Directory
                </h2>
                {renderRoleScopeBadge()}
              </div>
              <p className="text-xs font-medium text-slate-500">
                {userRole === "doctor" && "Viewing clinical roster assigned to you"}
                {userRole === "staff" && "Viewing patients currently assigned to ward beds"}
                {userRole === "admin" && "Full administrative patient directory access"}
                {!userRole && "View and manage registered patients"}
              </p>
            </div>

            {/* PATIENT COUNT */}
            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/70 shrink-0 self-start sm:self-center">
              <span>Showing</span>
              <span className="font-bold text-[#08679F]">{filteredPatients.length}</span>
              <span>of</span>
              <span className="font-bold text-slate-900">{patients.length}</span>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm">
              <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" />
                <line x1="12" y1="16" x2="12.01" />
              </svg>
              {error}
            </div>
          )}

          {/* NO PATIENTS */}
          {patients.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No patients found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {userRole === "doctor"
                  ? "No patients are currently assigned to you."
                  : userRole === "staff"
                  ? "No patients are currently assigned to ward beds."
                  : "Add a patient to see them listed here."}
              </p>
            </div>
          ) : filteredPatients.length === 0 ? (
            /* NO SEARCH RESULTS */
            <div className="text-center py-12 px-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No matching patients</h3>
              <p className="text-xs text-slate-500 mt-1">
                No patient matches "<span className="font-medium text-slate-700">{searchTerm}</span>".
              </p>
            </div>
          ) : (
            /* PATIENT TABLE */
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Patient ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Age</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Ward</th>
                      <th className="py-3 px-4">Bed</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {sortedPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#08679F]">
                          {patient.patient_id || patient.id || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize">
                          {patient.patient_name || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {patient.age ?? "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {patient.gender || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {patient.ward ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                              {patient.ward}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {patient.bed_number ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                              {patient.bed_number}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewPatient(patient.id)}
                            className="
                              inline-flex items-center gap-1 h-8 px-3 rounded-lg
                              bg-slate-100 hover:bg-[#08679F] hover:text-white text-slate-700
                              text-xs font-semibold transition-all duration-150
                              active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#08679F]/20
                            "
                          >
                            View
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientList;