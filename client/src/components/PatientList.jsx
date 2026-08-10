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

function PatientList({ refreshPatients }) {

    const [patients, setPatients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const navigate = useNavigate();


    // ======================================================
    // VIEW PATIENT
    // ======================================================

    const handleViewPatient = (patientId) => {

        navigate(`/patients/${patientId}`);

    };


    // ======================================================
    // FETCH PATIENTS
    // ======================================================

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

                const response = await api.get(
                    "/patients"
                );


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


        return () => {

            isMounted = false;

        };

    }, [refreshPatients, navigate]);


    // ======================================================
    // LOADING
    // ======================================================

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


    // ======================================================
    // UI
    // ======================================================

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        Patient List
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        View and manage registered patients
                    </p>

                </div>

                <div className="text-sm text-gray-500">

                    Total Patients:{" "}

                    <span className="font-semibold text-gray-900">
                        {patients.length}
                    </span>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">

                    {error}

                </div>

            )}


            {/* EMPTY */}

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

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b bg-gray-50">

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
                                    Doctor
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

                            {patients.map((patient) => (

                                <tr
                                    key={patient.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >

                                    <td className="p-3">

                                        <div className="font-medium text-gray-900">
                                            {patient.patient_name || "—"}
                                        </div>

                                    </td>


                                    <td className="p-3 text-gray-700">
                                        {patient.age ?? "—"}
                                    </td>


                                    <td className="p-3 text-gray-700">
                                        {patient.gender || "—"}
                                    </td>


                                    <td className="p-3 text-gray-700">
                                        {patient.doctor || "—"}
                                    </td>


                                    <td className="p-3 text-gray-700">
                                        {patient.ward || "—"}
                                    </td>


                                    <td className="p-3 text-gray-700">
                                        {patient.bed_number || "—"}
                                    </td>


                                    <td className="p-3">

                                        <button
                                            onClick={() =>
                                                handleViewPatient(patient.id)
                                            }
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                        >
                                            View
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default PatientList;