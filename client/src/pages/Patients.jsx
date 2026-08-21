// ==========================================================
// REACT
// ==========================================================

import { useState } from "react";

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

        setRefreshPatients(
            (previousValue) => !previousValue
        );

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

            <div>

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Add Patient
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Register a new patient in the hospital system.
                        </p>

                    </div>


                    {/* ==================================================
                        BACK BUTTON
                    ================================================== */}

                    <button
                        type="button"
                        onClick={handleCancelAddPatient}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-lg font-semibold transition"
                    >
                        ← Back to Patients
                    </button>

                </div>


                {/* ==================================================
                    ADD PATIENT FORM
                ================================================== */}

                <AddPatientForm
                    onPatientAdded={handlePatientAdded}
                />

            </div>

        );

    }


    // ==========================================================
    // PATIENT LIST SCREEN
    // ==========================================================

    return (

        <div>

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Patient Management
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Search and manage registered patients.
                    </p>

                </div>


                {/* ==================================================
                    ADD PATIENT BUTTON
                ================================================== */}

                <button
                    type="button"
                    onClick={handleAddPatient}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                    + Add Patient
                </button>

            </div>


            {/* ==================================================
                SEARCH
            ================================================== */}

            <PatientSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
            />


            {/* ==================================================
                SORTING
            ================================================== */}

            <div className="mt-4 mb-6 bg-white border border-gray-200 rounded-xl p-4">

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* ==================================================
                        SORT BY
                    ================================================== */}

                    <div className="flex-1">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort Patients By
                        </label>

                        <select
                            value={sortBy}
                            onChange={handleSortChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="created_at">
                                Recently Added
                            </option>

                            <option value="id">
                                Patient ID
                            </option>

                            <option value="patient_name">
                                Patient Name
                            </option>

                            <option value="age">
                                Age
                            </option>

                        </select>

                    </div>


                    {/* ==================================================
                        SORT ORDER
                    ================================================== */}

                    <div className="flex-1">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order
                        </label>

                        <select
                            value={sortOrder}
                            onChange={handleSortOrderChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="desc">
                                Descending
                            </option>

                            <option value="asc">
                                Ascending
                            </option>

                        </select>

                    </div>

                </div>

            </div>


            {/* ==================================================
                PATIENT LIST
            ================================================== */}

            <PatientList
                refreshPatients={refreshPatients}
                searchTerm={searchTerm}
                sortBy={sortBy}
                sortOrder={sortOrder}
            />

        </div>

    );

}

export default Patients;