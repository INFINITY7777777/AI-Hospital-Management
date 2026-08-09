// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// AXIOS
// ==========================================================

import axios from "axios";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";

// ==========================================================
// NAVBAR
// ==========================================================

import Navbar from "../components/Navbar";

// ==========================================================
// SIDEBAR
// ==========================================================

import Sidebar from "../components/Sidebar";


// ==========================================================
// ADMISSIONS COMPONENT
// ==========================================================

function Admissions() {

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // ADMISSIONS STATE
    // ==========================================================

    const [admissions, setAdmissions] = useState([]);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // FETCH ADMISSIONS
    // ==========================================================

    // Do NOT keep fetchAdmissions here


    // ==========================================================
    // LOAD ADMISSIONS
    // ==========================================================

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {

            navigate("/");

            return;

        }


        const loadAdmissions = async () => {

            try {

                setLoading(true);

                setError("");


                const response = await axios.get(
                    "http://localhost:5000/api/admissions"
                );


                setAdmissions(
                    response.data.admissions || []
                );

            }

            catch (error) {

                console.error(
                    "Error fetching admissions:",
                    error
                );


                setError(

                    error.response?.data?.error ||

                    "Failed to fetch admissions"

                );

            }

            finally {

                setLoading(false);

            }

        };


        loadAdmissions();

    }, [navigate]);


    // ==========================================================
    // INITIAL FETCH
    // ==========================================================

    useEffect(() => {

        const token = localStorage.getItem("token");

        // ==========================================================
        // CHECK LOGIN
        // ==========================================================

        if (!token) {

            navigate("/");

            return;

        }


        // ==========================================================
        // LOAD ADMISSIONS
        // ==========================================================

        const loadAdmissions = async () => {

            try {

                setLoading(true);

                setError("");


                const response = await axios.get(
                    "http://localhost:5000/api/admissions"
                );


                setAdmissions(
                    response.data.admissions || []
                );

            }

            catch (error) {

                console.error(
                    "Error fetching admissions:",
                    error
                );


                setError(

                    error.response?.data?.error ||

                    "Failed to fetch admissions"

                );

            }

            finally {

                setLoading(false);

            }

        };


        loadAdmissions();

    }, [navigate]);


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <p className="text-gray-500">

                            Loading admissions...

                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // MAIN UI
    // ==========================================================

    return (

        <div className="min-h-screen bg-gray-100">

            {/* ==================================================
                NAVBAR
            ================================================== */}

            <Navbar />


            <div className="flex">

                {/* ==================================================
                    SIDEBAR
                ================================================== */}

                <Sidebar />


                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <div className="flex-1 p-8">


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="flex justify-between items-center mb-6">

                        <div>

                            <h1 className="text-3xl font-bold">

                                Admissions

                            </h1>

                            <p className="text-gray-500 mt-1">

                                Manage patient hospital admissions

                            </p>

                        </div>


                        {/* ==================================================
                            ADD ADMISSION BUTTON
                        ================================================== */}

                        <button

                            onClick={() =>
                                navigate("/admissions/add")
                            }

                            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"

                        >

                            + Add Admission

                        </button>

                    </div>


                    {/* ==================================================
                        ERROR MESSAGE
                    ================================================== */}

                    {error && (

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        NO ADMISSIONS
                    ================================================== */}

                    {admissions.length === 0 ? (

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">

                                No admissions found.

                            </p>

                        </div>

                    ) : (


                        /* ==================================================
                           ADMISSIONS TABLE
                        ================================================== */

                        <div className="bg-white rounded-xl shadow overflow-x-auto">

                            <table className="w-full">


                                {/* ==================================================
                                    TABLE HEADER
                                ================================================== */}

                                <thead>

                                    <tr className="border-b bg-gray-50">

                                        <th className="text-left p-4">

                                            Patient

                                        </th>


                                        <th className="text-left p-4">

                                            Bed

                                        </th>


                                        <th className="text-left p-4">

                                            Admission Date

                                        </th>


                                        <th className="text-left p-4">

                                            Reason

                                        </th>


                                        <th className="text-left p-4">

                                            Diagnosis

                                        </th>


                                        <th className="text-left p-4">

                                            Status

                                        </th>


                                        <th className="text-left p-4">

                                            Actions

                                        </th>

                                    </tr>

                                </thead>


                                {/* ==================================================
                                    TABLE BODY
                                ================================================== */}

                                <tbody>

                                    {admissions.map((admission) => (

                                        <tr

                                            key={admission.id}

                                            className="border-b hover:bg-gray-50"

                                        >

                                            {/* ==================================================
                                                PATIENT
                                            ================================================== */}

                                            <td className="p-4 font-medium">

                                                {admission.patient_name || "—"}

                                            </td>


                                            {/* ==================================================
                                                BED
                                            ================================================== */}

                                            <td className="p-4">

                                                {admission.bed_number ||

                                                    "Not Assigned"

                                                }

                                            </td>


                                            {/* ==================================================
                                                ADMISSION DATE
                                            ================================================== */}

                                            <td className="p-4">

                                                {admission.admission_date

                                                    ? new Date(
                                                        admission.admission_date
                                                    ).toLocaleDateString()

                                                    : "—"

                                                }

                                            </td>


                                            {/* ==================================================
                                                REASON
                                            ================================================== */}

                                            <td className="p-4">

                                                {admission.admission_reason ||

                                                    "—"

                                                }

                                            </td>


                                            {/* ==================================================
                                                DIAGNOSIS
                                            ================================================== */}

                                            <td className="p-4">

                                                {admission.diagnosis ||

                                                    "—"

                                                }

                                            </td>


                                            {/* ==================================================
                                                STATUS
                                            ================================================== */}

                                            <td className="p-4">

                                                <span
                                                    className={
                                                        admission.status === "Admitted"

                                                            ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"

                                                            : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                                    }
                                                >

                                                    {admission.status}

                                                </span>

                                            </td>


                                            {/* ==================================================
                                                ACTIONS
                                            ================================================== */}

                                            <td className="p-4">

                                                <button

                                                    onClick={() =>

                                                        navigate(

                                                            `/admissions/${admission.id}`

                                                        )

                                                    }

                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"

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

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default Admissions;