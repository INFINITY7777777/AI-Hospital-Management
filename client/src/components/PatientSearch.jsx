// ==========================================================
// PATIENT SEARCH
// ==========================================================

function PatientSearch({
    searchTerm,
    onSearchChange
}) {

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Search Patients
            </h2>


            {/* ==================================================
                SEARCH INPUT
            ================================================== */}

            <div className="relative">

                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Search by patient name, phone, or patient ID..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />


                {/* ==================================================
                    CLEAR BUTTON
                ================================================== */}

                {searchTerm && (

                    <button
                        type="button"
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xl"
                        aria-label="Clear search"
                    >
                        ×
                    </button>

                )}

            </div>

        </div>

    );

}

export default PatientSearch;