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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* PAGE NAVIGATION HEADER */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="
              inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
              bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Add Patient
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
              Register a new patient in the hospital system.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancelAddPatient}
            className="
              inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl
              bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400
              text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150
              active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200
            "
          >
            <svg
              className="h-4 w-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Patients
          </button>
        </div>

        {/* ADD PATIENT FORM CONTAINER */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <AddPatientForm onPatientAdded={handlePatientAdded} />
        </div>
      </div>
    );
  }

  // ==========================================================
  // PATIENT LIST SCREEN
  // ==========================================================

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="
            inline-flex items-center gap-2 h-9 px-3.5 rounded-xl
            bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Patient Management
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Search and manage registered patients.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddPatient}
          className="
            inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl
            bg-[#08679F] hover:bg-[#07557F] text-white text-xs sm:text-sm font-semibold
            shadow-md shadow-[#08679F]/20 transition-all duration-150
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#08679F]/25
            active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
          "
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Patient
        </button>
      </div>

      {/* CONTROLS SECTION (SEARCH + FILTERS CONTAINER) */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
        {/* SEARCH BAR */}
        <PatientSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* SORTING CONTROLS */}
        <div className="pt-2 border-t border-slate-100">
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
                    w-full h-10 rounded-xl border border-slate-300 bg-white
                    py-2 pl-3.5 pr-10 text-xs sm:text-sm text-slate-800 outline-none
                    transition-all duration-150 appearance-none cursor-pointer
                    focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
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
                    w-full h-10 rounded-xl border border-slate-300 bg-white
                    py-2 pl-3.5 pr-10 text-xs sm:text-sm text-slate-800 outline-none
                    transition-all duration-150 appearance-none cursor-pointer
                    focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
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

      {/* PATIENT LIST DATA SECTION */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <PatientList
          refreshPatients={refreshPatients}
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}

export default Patients;