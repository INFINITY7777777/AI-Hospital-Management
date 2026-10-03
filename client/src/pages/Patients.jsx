// ==========================================================
// REACT & ROUTER
// ==========================================================

import { useState } from "react";
import { Link } from "react-router-dom";

// ==========================================================
// COMPONENTS
// ==========================================================

import AddPatientForm from "../components/AddPatientForm";
import PatientSearch from "../components/PatientSearch";
import PatientList from "../components/PatientList";

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
      <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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
              ADD PATIENT FORM
          ====================================================== */}

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <AddPatientForm onPatientAdded={handlePatientAdded} />
          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // PATIENT LIST SCREEN
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            BACK TO DASHBOARD
        ====================================================== */}

        <div>
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
            SEARCH + SORT CONTROLS
        ====================================================== */}

        <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
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

        {/* =====================================================
            PATIENT LIST
        ====================================================== */}

        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <PatientList
            refreshPatients={refreshPatients}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </main>
    </div>
  );
}

export default Patients;