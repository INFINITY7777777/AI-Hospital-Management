// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState, useRef } from "react";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

// ==========================================================
// PATIENT STAY HISTORY COMPONENT
// ==========================================================

function PatientStayHistory({ patientId }) {
  // ======================================================
  // STAY HISTORY STATE
  // ======================================================

  const [stays, setStays] = useState([]);

  // ======================================================
  // LOADING STATE
  // ======================================================

  const [loading, setLoading] = useState(Boolean(patientId));

  // ======================================================
  // ERROR STATE
  // ======================================================

  const [error, setError] = useState("");

  // 3D Tilt & Spotlight Hover State
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

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Status Badge Resolver
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "admitted") {
      return "bg-[#08679F]/10 text-[#08679F] border-[#08679F]/20";
    }
    if (s === "completed" || s === "discharged") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // ======================================================
  // FETCH STAY HISTORY
  // ======================================================

  useEffect(() => {
    if (!patientId) {
      return;
    }

    const fetchStayHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/patient-history/patient/${patientId}/stays`
        );

        setStays(response.data.stays || []);
      } catch (error) {
        console.error("Error fetching patient stay history:", error);
        console.error("Backend response:", error.response?.data);

        setError(
          error.response?.data?.error || "Failed to load stay history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStayHistory();
  }, [patientId]);

  // ======================================================
  // LOADING SKELETON
  // ======================================================

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-7 bg-slate-200 rounded w-52 mb-6"></div>
          <div className="space-y-3">
            <div className="h-28 bg-slate-100 rounded-2xl"></div>
            <div className="h-28 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR VIEW
  // ======================================================

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[22px] border border-rose-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Stay History</h2>
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="perspective-[1000px] mt-8">
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
        className="relative overflow-hidden bg-white/80 rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-6"
      >
        {/* Dynamic Spotlight Glow effect inside Card */}
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

        <div className="relative z-10 space-y-6">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
                PATIENT RECORD
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Stay History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ward and bed assignment timeline
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
              {stays.length} record
              {stays.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ==================================================
              EMPTY STATE / LIST
          ================================================== */}

          {stays.length === 0 ? (
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 text-center">
              <p className="text-xs text-slate-500 font-medium">
                No stay history found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stays.map((stay) => (
                <div
                  key={stay.id}
                  className="border border-slate-200/80 rounded-2xl p-4 bg-white/90 hover:border-slate-300 transition-all duration-150 space-y-4"
                >
                  {/* TOP ROW */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Ward Unit
                      </span>
                      <p className="text-sm font-bold text-slate-900">
                        {stay.ward || "—"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(
                        stay.status
                      )}`}
                    >
                      {stay.status || "Unknown"}
                    </span>
                  </div>

                  {/* STAY DETAILS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Bed Number
                      </span>
                      <p className="font-semibold text-slate-800">
                        {stay.bed_number || "—"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Start Date
                      </span>
                      <p className="font-semibold text-slate-800">
                        {formatDate(stay.start_date)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        End Date
                      </span>
                      <p className="font-semibold text-slate-800">
                        {formatDate(stay.end_date)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Admission ID
                      </span>
                      <p className="font-semibold text-slate-800">
                        {stay.admission_id ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientStayHistory;