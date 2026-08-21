// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";


// ==========================================================
// PATIENT LIST
// ==========================================================

function PatientList({
    refreshPatients,
    searchTerm,
    sortBy,
    sortOrder
}) {

    const [patients, setPatients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const navigate = useNavigate();


    // ==========================================================
    // VIEW PATIENT
    // ==========================================================

    const handleViewPatient = (patientId) => {

        navigate(`/patients/${patientId}`);

    };


    // ==========================================================
    // FETCH PATIENTS
    // ==========================================================

    useEffect(() => {

        let isMounted = true;


        const fetchPatients = async () => {

            try {

                setLoading(true);

                setError("");


                // ==================================================
                // CHECK LOGIN
                // ==================================================

                const token = localStorage.getItem("token");


                if (!token) {

                    navigate("/");

                    return;

                }


                // ==================================================
                // GET PATIENTS
                // ==================================================

                const response = await api.get("/patients");


                if (isMounted) {

                    setPatients(
                        response.data.patients || []
                    );

                }

            }

            catch (error) {

                console.error(
                    "Error fetching patients:",
                    error
                );

                console.error(
                    "Backend response:",
                    error.response?.data
                );


                // ==================================================
                // UNAUTHORIZED
                // ==================================================

                if (error.response?.status === 401) {

                    localStorage.removeItem("token");

                    navigate("/");

                    return;

                }


                // ==================================================
                // FORBIDDEN
                // ==================================================

                if (error.response?.status === 403) {

                    if (isMounted) {

                        setError(
                            "You do not have permission to view patients."
                        );

                    }

                    return;

                }


                // ==================================================
                // GENERAL ERROR
                // ==================================================

                if (isMounted) {

                    setError(

                        error.response?.data?.error ||
                        "Failed to load patients."

                    );

                }

            }

            finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };


        fetchPatients();


        // ==================================================
        // CLEANUP
        // ==================================================

        return () => {

            isMounted = false;

        };

    }, [refreshPatients, navigate]);


    // ==========================================================
    // SEARCH
    // ==========================================================

    const normalizedSearch = String(
        searchTerm || ""
    )
        .trim()
        .toLowerCase();


    const filteredPatients = patients.filter(
        (patient) => {

            // ==================================================
            // SHOW ALL
            // ==================================================

            if (!normalizedSearch) {

                return true;

            }


            // ==================================================
            // PATIENT NAME
            // ==================================================

            const patientName = String(
                patient.patient_name || ""
            )
                .trim()
                .toLowerCase();


            // ==================================================
            // PHONE
            // ==================================================

            const patientPhone = String(
                patient.phone || ""
            )
                .trim()
                .toLowerCase();


            // ==================================================
            // PATIENT ID
            // ==================================================

            const patientId = String(
                patient.patient_id ||
                patient.id ||
                ""
            )
                .trim()
                .toLowerCase();


            // ==================================================
            // SEARCH MATCH
            // ==================================================

            return (

                patientName.includes(
                    normalizedSearch
                ) ||

                patientPhone.includes(
                    normalizedSearch
                ) ||

                patientId.includes(
                    normalizedSearch
                )

            );

        }
    );


    // ==========================================================
    // SORT PATIENTS
    // ==========================================================

    const sortedPatients = [...filteredPatients];


    sortedPatients.sort(
        (a, b) => {

            let valueA;

            let valueB;


            // ==================================================
            // SORT BY PATIENT NAME
            // ==================================================

            if (sortBy === "patient_name") {

                valueA = String(
                    a.patient_name || ""
                )
                    .trim()
                    .toLowerCase();


                valueB = String(
                    b.patient_name || ""
                )
                    .trim()
                    .toLowerCase();


                const result =
                    valueA.localeCompare(
                        valueB
                    );


                return sortOrder === "asc"
                    ? result
                    : -result;

            }


            // ==================================================
            // SORT BY AGE
            // ==================================================

            if (sortBy === "age") {

                valueA =
                    Number(a.age) || 0;

                valueB =
                    Number(b.age) || 0;

            }


            // ==================================================
            // SORT BY PATIENT ID
            // ==================================================

            else if (sortBy === "id") {

                /*
                 * Convert ID to number when possible.
                 *
                 * Example:
                 *
                 * 1
                 * 2
                 * 10
                 *
                 * This prevents:
                 *
                 * 1
                 * 10
                 * 2
                 *
                 * from happening with string sorting.
                 */

                const numericA =
                    Number(a.patient_id || a.id);

                const numericB =
                    Number(b.patient_id || b.id);


                if (
                    !Number.isNaN(numericA) &&
                    !Number.isNaN(numericB)
                ) {

                    valueA = numericA;

                    valueB = numericB;

                }

                else {

                    valueA = String(
                        a.patient_id ||
                        a.id ||
                        ""
                    )
                        .toLowerCase();

                    valueB = String(
                        b.patient_id ||
                        b.id ||
                        ""
                    )
                        .toLowerCase();


                    const result =
                        valueA.localeCompare(
                            valueB,
                            undefined,
                            {
                                numeric: true
                            }
                        );


                    return sortOrder === "asc"
                        ? result
                        : -result;

                }

            }


            // ==================================================
            // DEFAULT: CREATED AT
            // ==================================================

            else {

                valueA = new Date(
                    a.created_at || 0
                ).getTime();


                valueB = new Date(
                    b.created_at || 0
                ).getTime();

            }


            // ==================================================
            // NUMBER SORT
            // ==================================================

            return sortOrder === "asc"

                ? valueA - valueB

                : valueB - valueA;

        }
    );


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="bg-white rounded-xl shadow p-6 mt-6">

                <h2 className="text-2xl font-bold mb-6">
                    Patient List
                </h2>


                <div className="space-y-3">

                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>

                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>

                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        Patient List
                    </h2>


                    <p className="text-sm text-gray-500 mt-1">
                        View and manage registered patients
                    </p>

                </div>


                {/* ==================================================
                    PATIENT COUNT
                ================================================== */}

                <div className="text-sm text-gray-500">

                    Showing:{" "}

                    <span className="font-semibold text-gray-900">

                        {filteredPatients.length}

                    </span>


                    {" "}of{" "}


                    <span className="font-semibold text-gray-900">

                        {patients.length}

                    </span>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">

                    {error}

                </div>

            )}


            {/* ==================================================
                NO PATIENTS
            ================================================== */}

            {patients.length === 0 ? (

                <div className="text-center py-12">

                    <div className="text-5xl mb-4">
                        👤
                    </div>


                    <h3 className="text-lg font-semibold text-gray-900">
                        No patients found
                    </h3>


                    <p className="text-gray-500 mt-1">
                        Add a patient to see them listed here.
                    </p>

                </div>

            ) : filteredPatients.length === 0 ? (

                /* ==================================================
                   NO SEARCH RESULTS
                ================================================== */

                <div className="text-center py-12">

                    <div className="text-5xl mb-4">
                        🔍
                    </div>


                    <h3 className="text-lg font-semibold text-gray-900">
                        No matching patients
                    </h3>


                    <p className="text-gray-500 mt-1">

                        No patient matches "{searchTerm}".

                    </p>

                </div>

            ) : (

                /* ==================================================
                   PATIENT TABLE
                ================================================== */

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b bg-gray-50">

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Patient ID
                                </th>


                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Name
                                </th>


                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Age
                                </th>


                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Gender
                                </th>


                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Ward
                                </th>


                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Bed
                                </th>


                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {sortedPatients.map(
                                (patient) => (

                                    <tr
                                        key={patient.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >


                                        {/* ==========================
                                            PATIENT ID
                                        ========================== */}

                                        <td className="p-3">

                                            <div className="font-medium text-blue-600">

                                                {patient.patient_id ||
                                                    patient.id ||
                                                    "—"}

                                            </div>

                                        </td>


                                        {/* ==========================
                                            NAME
                                        ========================== */}

                                        <td className="p-3">

                                            <div className="font-medium text-gray-900">

                                                {patient.patient_name ||
                                                    "—"}

                                            </div>

                                        </td>


                                        {/* ==========================
                                            AGE
                                        ========================== */}

                                        <td className="p-3 text-gray-700">

                                            {patient.age ?? "—"}

                                        </td>


                                        {/* ==========================
                                            GENDER
                                        ========================== */}

                                        <td className="p-3 text-gray-700">

                                            {patient.gender || "—"}

                                        </td>


                                        {/* ==========================
                                            WARD
                                        ========================== */}

                                        <td className="p-3 text-gray-700">

                                            {patient.ward || "—"}

                                        </td>


                                        {/* ==========================
                                            BED
                                        ========================== */}

                                        <td className="p-3 text-gray-700">

                                            {patient.bed_number || "—"}

                                        </td>


                                        {/* ==========================
                                            ACTIONS
                                        ========================== */}

                                        <td className="p-3">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewPatient(
                                                        patient.id
                                                    )
                                                }
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                            >
                                                View
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}


export default PatientList;