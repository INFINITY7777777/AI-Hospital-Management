// ==========================================================
// REACT & ROUTER
// ==========================================================

import { useState, useRef } from "react";
import { Link } from "react-router-dom";

// ==========================================================
// COMPONENTS
// ==========================================================

import Sidebar from "../components/Sidebar.jsx";
import AddPatientForm from "../components/AddPatientForm";
import PatientSearch from "../components/PatientSearch";
import PatientList from "../components/PatientList";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

// ==========================================================
// PATIENTS PAGE
// ==========================================================

function Patients() {
  // ==========================================================
  // REFRESH STATE
  // ==========================================================

  const [refreshPatients, setRefreshPatients] = useState(false);

  // ==========================================================
  // ADD PATIENT VIEW
  // ==========================================================

  const [showAddPatient, setShowAddPatient] = useState(false);

  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState("");

  // ==========================================================
  // SORT STATE
  // ==========================================================

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // ==========================================================
  // 3D TILT & SPOTLIGHT HOVER ANIMATION STATES
  // ==========================================================

  // Add Patient Form Card Hover
  const addCardRef = useRef(null);
  const [addMousePos, setAddMousePos] = useState({ x: 0, y: 0 });
  const [addCardRotate, setAddCardRotate] = useState({ x: 0, y: 0 });
  const [isAddHovered, setIsAddHovered] = useState(false);

  const handleMouseMoveAddCard = (e) => {
    if (!addCardRef.current) return;
    const rect = addCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAddMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setAddCardRotate({ x: rotateX, y: rotateY });
  };

  // Search & Filter Card Hover
  const searchCardRef = useRef(null);
  const [searchMousePos, setSearchMousePos] = useState({ x: 0, y: 0 });
  const [searchCardRotate, setSearchCardRotate] = useState({ x: 0, y: 0 });
  const [isSearchHovered, setIsSearchHovered] = useState(false);

  const handleMouseMoveSearchCard = (e) => {
    if (!searchCardRef.current) return;
    const rect = searchCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSearchMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setSearchCardRotate({ x: rotateX, y: rotateY });
  };

  // Patient List Card Hover
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
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;

    setListCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // HANDLE PATIENT ADDED
  // ==========================================================

  const handlePatientAdded = () => {
    setRefreshPatients((previousValue) => !previousValue);
    setShowAddPatient(false);
  };

  // ==========================================================
  // OPEN ADD PATIENT FORM
  // ==========================================================

  const handleAddPatient = () => {
    setShowAddPatient(true);
  };

  // ==========================================================
  // CANCEL ADD PATIENT
  // ==========================================================

  const handleCancelAddPatient = () => {
    setShowAddPatient(false);
  };

  // ==========================================================
  // HANDLE SEARCH
  // ==========================================================

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // ==========================================================
  // HANDLE SORT CHANGE
  // ==========================================================

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // ==========================================================
  // HANDLE SORT ORDER CHANGE
  // ==========================================================

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  // ==========================================================
  // ADD PATIENT SCREEN
  // ==========================================================

  if (showAddPatient) {
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
                inline-flex h-9 items-center gap-2 rounded-xl
                border border-slate-200 bg-white/80 px-3.5
                text-xs font-semibold text-slate-700
                shadow-sm backdrop-blur-md transition-all duration-150
                hover:border-slate-300 hover:bg-slate-50
                focus:outline-none focus:ring-4 focus:ring-slate-100
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

          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Add Patient
              </h1>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Register a new patient in the hospital system.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancelAddPatient}
              className="
                inline-flex h-10 shrink-0 items-center justify-center
                gap-2 rounded-xl border border-slate-300 bg-white
                px-4 text-xs font-semibold text-slate-700
                shadow-sm transition-all duration-150
                hover:border-slate-400 hover:bg-slate-50
                active:scale-[0.99]
                focus:outline-none focus:ring-4 focus:ring-slate-100
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

              Back to Patients
            </button>
          </div>

          {/* =====================================================
              ADD PATIENT FORM CONTAINER WITH 3D PERSPECTIVE
          ====================================================== */}

          <div className="perspective-[1000px]">
            <div
              ref={addCardRef}
              onMouseMove={handleMouseMoveAddCard}
              onMouseEnter={() => setIsAddHovered(true)}
              onMouseLeave={() => {
                setIsAddHovered(false);
                setAddCardRotate({ x: 0, y: 0 });
              }}
              style={{
                transform: isAddHovered
                  ? `rotateX(${addCardRotate.x}deg) rotateY(${addCardRotate.y}deg) translateZ(10px)`
                  : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                transition: isAddHovered
                  ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                  : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
              }}
              className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
            >
              {/* Dynamic Spotlight Glow effect inside Add Patient Card */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isAddHovered ? 1 : 0,
                  background: `radial-gradient(600px circle at ${addMousePos.x}px ${addMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                }}
              />

              {/* Border Light Highlight */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                style={{
                  opacity: isAddHovered ? 1 : 0,
                  background: `radial-gradient(400px circle at ${addMousePos.x}px ${addMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                  maskImage:
                    "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              <div className="relative z-10">
                <AddPatientForm onPatientAdded={handlePatientAdded} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // PATIENT LIST SCREEN
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

        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Patient Management
              </h1>

              <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#08679F] sm:inline-flex">
                Patient Care
              </span>
            </div>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Search and manage registered patients.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddPatient}
            className="
              inline-flex h-10 shrink-0 items-center justify-center
              gap-1.5 rounded-xl bg-[#08679F] px-4
              text-xs font-semibold text-white
              shadow-md shadow-[#08679F]/20
              transition-all duration-150
              hover:-translate-y-0.5 hover:bg-[#07557F]
              active:translate-y-0 active:scale-[0.99]
              focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
            "
          >
            <span className="text-base leading-none">+</span>
            Add Patient
          </button>
        </div>

        {/* =====================================================
            SEARCH + SORT CONTROLS WITH 3D PERSPECTIVE
        ====================================================== */}

        <div className="perspective-[1000px]">
          <div
            ref={searchCardRef}
            onMouseMove={handleMouseMoveSearchCard}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => {
              setIsSearchHovered(false);
              setSearchCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isSearchHovered
                ? `rotateX(${searchCardRotate.x}deg) rotateY(${searchCardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isSearchHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside Search Card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isSearchHovered ? 1 : 0,
                background: `radial-gradient(500px circle at ${searchMousePos.x}px ${searchMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isSearchHovered ? 1 : 0,
                background: `radial-gradient(350px circle at ${searchMousePos.x}px ${searchMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage:
                  "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10">
              {/* SEARCH */}

              <PatientSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />

              {/* SORTING */}

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* SORT BY */}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Sort Patients By
                    </label>

                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="
                          h-10 w-full appearance-none
                          cursor-pointer rounded-xl
                          border border-slate-200 bg-white
                          py-2 pl-3.5 pr-10
                          text-xs font-medium text-slate-900
                          shadow-sm transition-all duration-150
                          focus:border-[#08679F]
                          focus:outline-none
                          focus:ring-4 focus:ring-[#08679F]/10
                        "
                      >
                        <option value="created_at">Recently Added</option>
                        <option value="id">Patient ID</option>
                        <option value="patient_name">Patient Name</option>
                        <option value="age">Age</option>
                      </select>

                      <svg
                        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>

                  {/* SORT ORDER */}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Order
                    </label>

                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={handleSortOrderChange}
                        className="
                          h-10 w-full appearance-none
                          cursor-pointer rounded-xl
                          border border-slate-200 bg-white
                          py-2 pl-3.5 pr-10
                          text-xs font-medium text-slate-900
                          shadow-sm transition-all duration-150
                          focus:border-[#08679F]
                          focus:outline-none
                          focus:ring-4 focus:ring-[#08679F]/10
                        "
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>

                      <svg
                        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            PATIENT LIST WITH 3D PERSPECTIVE
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
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside Patient List Card */}
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
              <PatientList
                refreshPatients={refreshPatients}
                searchTerm={searchTerm}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Patients;