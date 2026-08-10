// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// API CLIENT
// ==========================================================

import api from "../services/api";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { Link, useNavigate } from "react-router-dom";

// ==========================================================
// DOCTOR LIST COMPONENT
// ==========================================================

function DoctorList({ refreshDoctors }) {

    // ==========================================================
    // DOCTOR STATE
    // ==========================================================

    const [doctors, setDoctors] = useState([]);

    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);

    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();

    // ==========================================================
    // FETCH DOCTORS
    // ==========================================================

    useEffect(() => {

        let isMounted = true;

        // ======================================================
        // FETCH FUNCTION
        // ======================================================

        const fetchDoctors = async () => {

            try {

                // ==================================================
                // START LOADING
                // ==================================================

                if (isMounted) {

                    setLoading(true);
                    setError("");

                }

                // ==================================================
                // API REQUEST
                // ==================================================
                //
                // IMPORTANT:
                // Use "api" instead of "axios".
                //
                // api.js automatically adds:
                //
                // Authorization: Bearer <token>
                //
                // ==================================================

                const response = await api.get(
                    "/doctors"
                );

                // ==================================================
                // DEBUG
                // ==================================================

                console.log(
                    "[DoctorList] Doctors response:",
                    response.data
                );

                // ==================================================
                // STORE DOCTORS
                // ==================================================

                if (isMounted) {

                    setDoctors(
                        response.data.doctors || []
                    );

                }

            }

            catch (error) {

                // ==================================================
                // DEBUG
                // ==================================================

                console.error(
                    "[DoctorList] Error fetching doctors:",
                    error
                );

                console.error(
                    "[DoctorList] Status:",
                    error.response?.status
                );

                console.error(
                    "[DoctorList] Response:",
                    error.response?.data
                );

                // ==================================================
                // UNAUTHORIZED
                // ==================================================

                if (
                    error.response?.status === 401
                ) {

                    localStorage.removeItem("token");

                    if (isMounted) {

                        setError(
                            "Your session has expired. Please login again."
                        );

                    }

                    // ==================================================
                    // REDIRECT TO LOGIN
                    // ==================================================

                    navigate("/");

                    return;

                }

                // ==================================================
                // FORBIDDEN
                // ==================================================

                if (
                    error.response?.status === 403
                ) {

                    if (isMounted) {

                        setError(
                            "You do not have permission to view doctors."
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

                        "Failed to load doctors."

                    );

                }

            }

            finally {

                // ==================================================
                // STOP LOADING
                // ==================================================

                if (isMounted) {

                    setLoading(false);

                }

            }

        };

        // ======================================================
        // RUN FETCH
        // ======================================================

        fetchDoctors();

        // ======================================================
        // CLEANUP
        // ======================================================

        return () => {

            isMounted = false;

        };

    }, [refreshDoctors, navigate]);

    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="bg-white rounded-xl shadow p-6 mt-6">

                <h2 className="text-2xl font-bold mb-6">
                    Doctor List
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
    // MAIN UI
    // ==========================================================

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        Doctor List
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        View and manage registered doctors
                    </p>

                </div>

                <div className="text-sm text-gray-500">

                    Total Doctors:{" "}

                    <span className="font-semibold text-gray-900">

                        {doctors.length}

                    </span>

                </div>

            </div>

            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">

                    {error}

                </div>

            )}

            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {doctors.length === 0 ? (

                <div className="text-center py-12">

                    <div className="text-5xl mb-4">
                        🩺
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                        No doctors found
                    </h3>

                    <p className="text-gray-500 mt-1">
                        Add a doctor to see them listed here.
                    </p>

                </div>

            ) : (

                /* ==================================================
                   DOCTOR TABLE
                ================================================== */

                <div className="overflow-x-auto">

                    <table className="w-full">

                        {/* ==================================================
                            TABLE HEADER
                        ================================================== */}

                        <thead>

                            <tr className="border-b bg-gray-50">

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Name
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Specialization
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Phone
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Department
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Experience
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        {/* ==================================================
                            TABLE BODY
                        ================================================== */}

                        <tbody>

                            {doctors.map((doctor) => (

                                <tr
                                    key={doctor.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >

                                    {/* ==================================================
                                        NAME
                                    ================================================== */}

                                    <td className="p-3">

                                        <Link
                                            to={`/doctors/${doctor.id}`}
                                            className="text-blue-600 font-semibold hover:underline"
                                        >

                                            {doctor.doctor_name || "—"}

                                        </Link>

                                    </td>

                                    {/* ==================================================
                                        SPECIALIZATION
                                    ================================================== */}

                                    <td className="p-3 text-gray-700">

                                        {doctor.specialization || "—"}

                                    </td>

                                    {/* ==================================================
                                        PHONE
                                    ================================================== */}

                                    <td className="p-3 text-gray-700">

                                        {doctor.phone || "—"}

                                    </td>

                                    {/* ==================================================
                                        DEPARTMENT
                                    ================================================== */}

                                    <td className="p-3 text-gray-700">

                                        {doctor.department || "—"}

                                    </td>

                                    {/* ==================================================
                                        EXPERIENCE
                                    ================================================== */}

                                    <td className="p-3 text-gray-700">

                                        {doctor.experience !== null &&
                                        doctor.experience !== undefined
                                            ? `${doctor.experience} years`
                                            : "—"}

                                    </td>

                                    {/* ==================================================
                                        ACTIONS
                                    ================================================== */}

                                    <td className="p-3">

                                        <Link
                                            to={`/doctors/${doctor.id}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition inline-block"
                                        >
                                            View
                                        </Link>

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

// ==========================================================
// EXPORT
// ==========================================================

export default DoctorList;