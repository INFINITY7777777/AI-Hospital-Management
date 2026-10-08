// ==========================================================
// DOCTORS PAGE
// Manages doctor registration and doctor list
// Untouched Sidebar component integrated with a circular
// vertically centered floating menu button via CSS overrides
// ==========================================================

import { useState, useRef } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar.jsx";
import AddDoctorForm from "../components/AddDoctorForm.jsx";
import DoctorList from "../components/DoctorList.jsx";
import MedicalPlusBackground from "../components/MedicalPlusBackground.jsx";

function Doctors() {
  // ==========================================================
  // REFRESH STATE
  // ==========================================================

  const [refreshDoctors, setRefreshDoctors] = useState(0);

  // ==========================================================
  // REFRESH DOCTOR LIST
  // Passed to AddDoctorForm to trigger a refetch in DoctorList
  // ==========================================================

  const handleDoctorAdded = () => {
    setRefreshDoctors((previousValue) => previousValue + 1);
  };

  // ==========================================================
  // 3D TILT & SPOTLIGHT HOVER ANIMATION STATES
  // ==========================================================

  // Add Doctor Form Card Hover
  const formCardRef = useRef(null);
  const [formMousePos, setFormMousePos] = useState({ x: 0, y: 0 });
  const [formCardRotate, setFormCardRotate] = useState({ x: 0, y: 0 });
  const [isFormHovered, setIsFormHovered] = useState(false);

  const handleMouseMoveFormCard = (e) => {
    if (!formCardRef.current) return;
    const rect = formCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFormMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setFormCardRotate({ x: rotateX, y: rotateY });
  };

  // Doctor List Card Hover
  const listCardRef = useRef(null);
  const [listMousePos, setListMousePos] = useState({ x: 0, y: 0 });
  const [listCardRotate, setListCardRotate] = useState({ x: 0, y: 0 });
  const [isListHovered, setIsListHovered] = useState(false);

  const handleMouseMoveListCard = (e) => {
    if (!listCardRef.current) return;
    const rect = listCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setListMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setListCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // PAGE RENDER
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">
      {/* Interactive Medical + Canvas Hover Effect */}
      <MedicalPlusBackground />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* =====================================================
          VERTICALLY CENTERED CIRCULAR MENU OVERRIDE CONTAINER
          Overrides the floating button position & shape without
          modifying any code inside Sidebar.jsx
      ====================================================== */}
      <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            BACK TO DASHBOARD
        ====================================================== */}

        <div>
          <Link
            to="/dashboard"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white/80 border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300
              text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-150
              active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200
            "
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>

            Back to Dashboard
          </Link>
        </div>

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
              CLINICAL STAFF
            </span>

            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Doctor Management
            </h1>

            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              Register new attending physicians and manage active hospital
              personnel
            </p>
          </div>
        </div>

        {/* =====================================================
            ADD DOCTOR FORM
        ====================================================== */}

        <div className="perspective-[1000px]">
          <div
            ref={formCardRef}
            onMouseMove={handleMouseMoveFormCard}
            onMouseEnter={() => setIsFormHovered(true)}
            onMouseLeave={() => {
              setIsFormHovered(false);
              setFormCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isFormHovered
                ? `rotateX(${formCardRotate.x}deg) rotateY(${formCardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isFormHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside Form Card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isFormHovered ? 1 : 0,
                background: `radial-gradient(500px circle at ${formMousePos.x}px ${formMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isFormHovered ? 1 : 0,
                background: `radial-gradient(350px circle at ${formMousePos.x}px ${formMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage:
                  "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10">
              <AddDoctorForm refreshDoctors={handleDoctorAdded} />
            </div>
          </div>
        </div>

        {/* =====================================================
            DOCTOR LIST
        ====================================================== */}

        <div className="perspective-[1000px]">
          <div
            ref={listCardRef}
            onMouseMove={handleMouseMoveListCard}
            onMouseEnter={() => setIsListHovered(true)}
            onMouseLeave={() => {
              setIsListHovered(false);
              setListCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isListHovered
                ? `rotateX(${listCardRotate.x}deg) rotateY(${listCardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isListHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside Doctor List Card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isListHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${listMousePos.x}px ${listMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isListHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${listMousePos.x}px ${listMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage:
                  "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10">
              <DoctorList refreshDoctors={refreshDoctors} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Doctors;