// ==========================================================
// PATIENT SEARCH
// ==========================================================

function PatientSearch({ searchTerm, onSearchChange }) {
  return (
    <div className="space-y-2">
      {/* ==================================================
          HEADER & LABEL
      ================================================== */}
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4 text-[#08679F]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Search Patients
        </h2>
      </div>

      {/* ==================================================
          SEARCH INPUT CONTAINER
      ================================================== */}
      <div className="relative">
        {/* MAGNIFYING GLASS ICON */}
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* INPUT FIELD */}
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by patient name, phone, or patient ID..."
          className="
            w-full h-10 rounded-xl border border-slate-300 bg-white
            pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
            transition-all duration-150
            focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
          "
        />

        {/* ==================================================
            CLEAR BUTTON
        ================================================== */}
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="
              absolute right-2.5 top-1/2 -translate-y-1/2 
              flex h-6 w-6 items-center justify-center rounded-lg 
              text-slate-400 hover:bg-slate-100 hover:text-slate-600
              transition-colors focus:outline-none focus:ring-2 focus:ring-[#08679F]/20
            "
            aria-label="Clear search"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default PatientSearch;