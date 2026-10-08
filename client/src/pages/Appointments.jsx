// ==========================================================
// REACT & ROUTER
// ==========================================================

import { useState } from "react";
import { Link } from "react-router-dom";

// ==========================================================
// COMPONENTS
// ==========================================================

import Sidebar from "../components/Sidebar.jsx";
import AppointmentList from "../components/AppointmentList";
import AddAppointmentForm from "../components/AddAppointmentForm";

// ==========================================================
// APPOINTMENTS PAGE
// ==========================================================

function Appointments() {
  // ==========================================================
  // REFRESH STATE
  // ==========================================================

  const [refreshAppointments, setRefreshAppointments] = useState(0);

  // ==========================================================
  // ADD APPOINTMENT MODAL
  // ==========================================================

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ==========================================================
  // ACTIVE FILTER
  // ==========================================================

  const [activeFilter, setActiveFilter] = useState("all");

  // ==========================================================
  // SEARCH STATE
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState("");

  // ==========================================================
  // HANDLE APPOINTMENT CREATED
  // ==========================================================

  const handleAppointmentCreated = () => {
    setRefreshAppointments((previousValue) => previousValue + 1);
    setIsAddModalOpen(false);
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="relative min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      {/* =====================================================
          VERTICALLY CENTERED CIRCULAR MENU OVERRIDE CONTAINER
          Overrides the floating button position & shape without
          modifying any code inside Sidebar.jsx
      ====================================================== */}
      <div className="[&>button]:fixed! [&>button]:top-1/2! [&>button]:left-2! [&>button]:-translate-y-1/2! [&>button]:z-99! [&>button]:h-12! [&>button]:w-12! [&>button]:p-0! [&>button]:justify-center! [&>button]:rounded-full! [&>button]:shadow-xl! [&>button]:bg-[#0b1b32]! [&>button_span]:hidden!">
        <Sidebar />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP BAR */}

        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300
              text-xs font-semibold shadow-xs transition-all duration-150
              active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200
            "
          >
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>

            Back to Dashboard
          </Link>
        </div>

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Appointment Management
            </h1>

            <p className="mt-1 text-xs text-slate-500 font-medium">
              Schedule, view, and manage patient appointments and clinical
              visits.
            </p>
          </div>

          {/* BOOK APPOINTMENT CTA */}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="
              inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl
              bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold
              shadow-md shadow-[#08679F]/20 transition-all duration-150
              hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
              focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 shrink-0
            "
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>

            <span>Book Appointment</span>
          </button>
        </div>

        {/* CONTROLS BAR */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* FILTER TABS */}

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 text-xs font-semibold w-fit">
            {[
              {
                id: "all",
                label: "All Appointments",
              },
              {
                id: "today",
                label: "Today's Schedule",
              },
              {
                id: "upcoming",
                label: "Upcoming Visits",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`
                  px-3.5 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-150 whitespace-nowrap
                  ${
                    activeFilter === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH INPUT */}

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search patient, doctor, reason..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="
                w-full h-10 pl-10 pr-9 rounded-xl
                border border-slate-200 bg-white
                text-xs font-medium text-slate-900
                placeholder:text-slate-400
                transition-all duration-150 shadow-xs
                focus:border-[#08679F]
                focus:outline-none
                focus:ring-4 focus:ring-[#08679F]/10
              "
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="
                  absolute inset-y-0 right-0 pr-3
                  flex items-center text-slate-400
                  hover:text-slate-600 transition
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <AppointmentList
            filter={activeFilter}
            searchTerm={searchTerm}
            refreshAppointments={refreshAppointments}
          />
        </div>
      </div>

      {/* ADD APPOINTMENT MODAL */}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[22px] max-w-xl w-full p-6 sm:p-8 shadow-2xl shadow-slate-900/10 border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}

            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Book New Appointment
                </h2>

                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Enter appointment details to schedule a patient
                  consultation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="
                  h-8 w-8 rounded-xl border border-slate-200
                  text-slate-400 hover:bg-slate-50
                  hover:text-slate-700 transition
                  flex items-center justify-center
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* MODAL FORM */}

            <AddAppointmentForm
              refreshAppointments={handleAppointmentCreated}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;