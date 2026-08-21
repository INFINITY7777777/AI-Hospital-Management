// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";


// ==========================================================
// PATIENT STAY HISTORY
// ==========================================================

function PatientStayHistory({ patientId }) {

    // ======================================================
    // STAY HISTORY STATE
    // ======================================================

    const [stays, setStays] = useState([]);


    // ======================================================
    // LOADING
    // ======================================================

    const [loading, setLoading] = useState(Boolean(patientId));


    // ======================================================
    // ERROR
    // ======================================================

    const [error, setError] = useState("");


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (date) => {

        if (!date) {

            return "—";

        }

        return new Date(date).toLocaleDateString(

            "en-IN",

            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }

        );

    };


    // ======================================================
    // FETCH STAY HISTORY
    // ======================================================

    useEffect(() => {

        if (!patientId) {
            return;
        }

        const fetchStayHistory = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/patient-history/patient/${patientId}/stays`
                );

                setStays(
                    response.data.stays || []
                );

            }

            catch (error) {

                console.error(
                    "Error fetching patient stay history:",
                    error
                );

                console.error(
                    "Backend response:",
                    error.response?.data
                );

                setError(
                    error.response?.data?.error ||
                    "Failed to load stay history."
                );

            }

            finally {

                setLoading(false);

            }

        };

        fetchStayHistory();

    }, [patientId]);


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                <div className="animate-pulse">

                    <div className="h-6 bg-gray-200 rounded w-52 mb-6"></div>

                    <div className="space-y-4">

                        <div className="h-28 bg-gray-100 rounded-xl"></div>

                        <div className="h-28 bg-gray-100 rounded-xl"></div>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // ERROR
    // ======================================================

    if (error) {

        return (

            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">

                <h2 className="text-xl font-bold text-gray-900 mb-2">

                    Stay History

                </h2>


                <p className="text-red-600">

                    {error}

                </p>

            </div>

        );

    }


    // ======================================================
    // MAIN UI
    // ======================================================

    return (

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex items-center justify-between mb-6">

                <div>

                    <p className="text-sm text-blue-600 font-medium">

                        PATIENT RECORD

                    </p>


                    <h2 className="text-2xl font-bold text-gray-900 mt-1">

                        Stay History

                    </h2>


                    <p className="text-gray-500 mt-1">

                        Ward and bed assignment history

                    </p>

                </div>


                <span className="text-sm text-gray-500">

                    {stays.length} record
                    {stays.length !== 1 ? "s" : ""}

                </span>

            </div>


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {stays.length === 0 ? (

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">

                    <p className="text-gray-500">

                        No stay history found.

                    </p>

                </div>

            ) : (

                <div className="space-y-4">

                    {stays.map((stay) => (

                        <div
                            key={stay.id}
                            className="border border-gray-200 rounded-xl p-5"
                        >

                            {/* ==================================================
                                TOP ROW
                            ================================================== */}

                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                <div>

                                    <p className="text-sm text-gray-500">

                                        Ward

                                    </p>


                                    <p className="text-lg font-bold text-gray-900">

                                        {stay.ward || "—"}

                                    </p>

                                </div>


                                <span
                                    className={
                                        stay.status === "Active"

                                            ? "inline-flex w-fit px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold"

                                            : "inline-flex w-fit px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold"
                                    }
                                >

                                    {stay.status || "Unknown"}

                                </span>

                            </div>


                            {/* ==================================================
                                STAY DETAILS
                            ================================================== */}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">


                                {/* ==================================================
                                    BED
                                ================================================== */}

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">

                                        Bed

                                    </p>


                                    <p className="font-semibold text-gray-900">

                                        {stay.bed_number || "—"}

                                    </p>

                                </div>


                                {/* ==================================================
                                    START DATE
                                ================================================== */}

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">

                                        Start Date

                                    </p>


                                    <p className="font-semibold text-gray-900">

                                        {formatDate(
                                            stay.start_date
                                        )}

                                    </p>

                                </div>


                                {/* ==================================================
                                    END DATE
                                ================================================== */}

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">

                                        End Date

                                    </p>


                                    <p className="font-semibold text-gray-900">

                                        {formatDate(
                                            stay.end_date
                                        )}

                                    </p>

                                </div>


                                {/* ==================================================
                                    ADMISSION ID
                                ================================================== */}

                                <div>

                                    <p className="text-sm text-gray-500 mb-1">

                                        Admission ID

                                    </p>


                                    <p className="font-semibold text-gray-900">

                                        {stay.admission_id ?? "—"}

                                    </p>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default PatientStayHistory;