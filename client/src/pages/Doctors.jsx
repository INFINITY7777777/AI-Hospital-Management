// ==========================================================
// DOCTORS PAGE
// Manages doctor registration and doctor list
// ==========================================================

import { useState } from "react";
import { Link } from "react-router-dom";

import AddDoctorForm from "../components/AddDoctorForm.jsx";
import DoctorList from "../components/DoctorList.jsx";

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
  // PAGE RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* =====================================================
            BACK TO DASHBOARD
        ====================================================== */}

        <div>
          <Link
            to="/dashboard"
            className="
              inline-flex h-9 items-center gap-2 rounded-xl
              border border-slate-200 bg-white px-3.5
              text-xs font-semibold text-slate-700
              shadow-sm transition-all duration-150
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

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <AddDoctorForm refreshDoctors={handleDoctorAdded} />
        </div>

        {/* =====================================================
            DOCTOR LIST
        ====================================================== */}

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <DoctorList refreshDoctors={refreshDoctors} />
        </div>
      </div>
    </div>
  );
}

export default Doctors;