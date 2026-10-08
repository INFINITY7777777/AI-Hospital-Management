import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import AppointmentList from "../components/AppointmentList";
import AddAppointmentForm from "../components/AddAppointmentForm";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function Appointments() {
  const [refreshAppointments, setRefreshAppointments] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Card 3D Tilt & Spotlight
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setCardRotate({ x: rotateX, y: rotateY });
  };

  const handleAppointmentCreated = () => {
    setRefreshAppointments((prev) => prev + 1);
    setIsAddModalOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans text-slate-900 antialiased p-4 sm:p-6 lg:p-8">
      {/* Interactive Medical + Canvas Hover Background */}
      <MedicalPlusBackground />

      {/* Decorative Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* Sidebar override */}
      <div className="relative z-20 [&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200/80 text-[#08679F] hover:bg-white hover:border-[#08679F]/40 text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-150 active:scale-[0.99]"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Appointment Management
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Schedule, view, and manage patient appointments and clinical visits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#08679F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 shrink-0 cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
            <svg className="h-4 w-4 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="relative z-10">Book Appointment</span>
          </button>
        </div>

        {/* Filter + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 backdrop-blur-md text-xs font-semibold w-fit">
            {[
              { id: "all", label: "All Appointments" },
              { id: "today", label: "Today's Schedule" },
              { id: "upcoming", label: "Upcoming Visits" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search patient, doctor, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-300/80 bg-white/80 backdrop-blur-md text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Interactive 3D Card with Spotlight */}
        <section className="perspective-[1000px]">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isHovered
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(6px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="animate-login-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 sm:p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Spotlight Glow */}
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
                maskImage: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10">
              <AppointmentList
                filter={activeFilter}
                searchTerm={searchTerm}
                refreshAppointments={refreshAppointments}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Book Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white/95 rounded-[22px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative max-h-[90vh] overflow-y-auto backdrop-blur-xl">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Book New Appointment</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Enter appointment details to schedule a patient consultation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <AddAppointmentForm
              refreshAppointments={handleAppointmentCreated}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* CSS Animations */}
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

export default Appointments;