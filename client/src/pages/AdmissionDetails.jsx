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

import { useNavigate, useParams } from "react-router-dom";

// ==========================================================
// NAVBAR
// ==========================================================

import Navbar from "../components/Navbar";

// ==========================================================
// SIDEBAR
// ==========================================================

import Sidebar from "../components/Sidebar";


// ==========================================================
// ADMISSION DETAILS
// ==========================================================

function AdmissionDetails() {

    // ==========================================================
    // GET ADMISSION ID FROM URL
    // ==========================================================

    const { id } = useParams();


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // ADMISSION STATE
    // ==========================================================

    const [admission, setAdmission] = useState(null);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // DISCHARGE REASON
    // ==========================================================

    const [dischargeReason, setDischargeReason] = useState("");


    // ==========================================================
    // DISCHARGE LOADING
    // ==========================================================

    const [discharging, setDischarging] = useState(false);


    // ==========================================================
    // FETCH ADMISSION
    // ==========================================================

    useEffect(() => {

        const loadAdmission = async () => {

            try {

                setLoading(true);

                setError("");


                const response = await axios.get(

                    `http://localhost:5000/api/admissions/${id}`

                );


                setAdmission(

                    response.data.admission

                );

            }

            catch (error) {

                console.error(

                    "Error fetching admission:",

                    error

                );


                setError(

                    error.response?.data?.error ||

                    "Failed to fetch admission"

                );

            }

            finally {

                setLoading(false);

            }

        };


        loadAdmission();

    }, [id]);


    // ==========================================================
    // DISCHARGE PATIENT
    // ==========================================================

    const handleDischarge = async () => {

        // ==========================================================
        // CONFIRMATION
        // ==========================================================

        const confirmDischarge = window.confirm(

            "Are you sure you want to discharge this patient?"

        );


        if (!confirmDischarge) {

            return;

        }


        try {

            setDischarging(true);

            setError("");


            // ======================================================
            // DISCHARGE API
            // ======================================================

            await axios.put(

                `http://localhost:5000/api/admissions/${id}/discharge`,

                {

                    dischargeDate:
                        new Date().toISOString().split("T")[0],

                    dischargeReason:
                        dischargeReason

                }

            );


            // ======================================================
            // SUCCESS
            // ======================================================

            alert(

                "Patient discharged successfully"

            );


            // ======================================================
            // RETURN TO ADMISSIONS
            // ======================================================

            navigate("/admissions");

        }

        catch (error) {

            console.error(

                "Error discharging patient:",

                error

            );


            setError(

                error.response?.data?.error ||

                "Failed to discharge patient"

            );

        }

        finally {

            setDischarging(false);

        }

    };


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

                            Loading admission details...

                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // ERROR / NOT FOUND
    // ==========================================================

    if (error && !admission) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>


                        <button

                            onClick={() =>
                                navigate("/admissions")
                            }

                            className="bg-gray-600 text-white px-5 py-2 rounded-lg"

                        >

                            Back to Admissions

                        </button>

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

                                Admission Details

                            </h1>

                            <p className="text-gray-500">

                                View patient admission information

                            </p>

                        </div>


                        <button

                            onClick={() =>
                                navigate("/admissions")
                            }

                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"

                        >

                            Back to Admissions

                        </button>

                    </div>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        PATIENT INFORMATION
                    ================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mb-6">

                        <h2 className="text-xl font-bold mb-5">

                            Patient Information

                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            <div>

                                <p className="text-gray-500">

                                    Patient Name

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.patient_name}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Phone

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.phone || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Age

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.age || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Gender

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.gender || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Blood Group

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.blood_group || "—"}

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        BED INFORMATION
                    ================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mb-6">

                        <h2 className="text-xl font-bold mb-5">

                            Bed Information

                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                            <div>

                                <p className="text-gray-500">

                                    Bed Number

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.bed_number || "Not Assigned"}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Ward

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.ward || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Bed Type

                                </p>

                                <p className="text-lg font-semibold">

                                    {admission.bed_type || "—"}

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        ADMISSION INFORMATION
                    ================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mb-6">

                        <h2 className="text-xl font-bold mb-5">

                            Admission Information

                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                            <div>

                                <p className="text-gray-500">

                                    Admission Date

                                </p>

                                <p className="text-lg font-semibold">

                                    {new Date(

                                        admission.admission_date

                                    ).toLocaleDateString()}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Status

                                </p>

                                <span

                                    className={

                                        admission.status === "Admitted"

                                            ? "inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold"

                                            : "inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold"

                                    }

                                >

                                    {admission.status}

                                </span>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Admission Reason

                                </p>

                                <p className="text-lg">

                                    {admission.admission_reason || "—"}

                                </p>

                            </div>


                            <div>

                                <p className="text-gray-500">

                                    Diagnosis

                                </p>

                                <p className="text-lg">

                                    {admission.diagnosis || "—"}

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        DISCHARGE SECTION
                    ================================================== */}

                    {admission.status !== "Discharged" && (

                        <div className="bg-white rounded-xl shadow p-6">

                            <h2 className="text-xl font-bold mb-5">

                                Discharge Patient

                            </h2>


                            <div className="mb-5">

                                <label className="block font-semibold mb-2">

                                    Discharge Reason

                                </label>


                                <textarea

                                    value={
                                        dischargeReason
                                    }

                                    onChange={(event) =>

                                        setDischargeReason(

                                            event.target.value

                                        )

                                    }

                                    placeholder="Enter discharge reason"

                                    rows="4"

                                    className="w-full border border-gray-300 rounded-lg p-3"

                                />

                            </div>


                            <button

                                onClick={handleDischarge}

                                disabled={discharging}

                                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"

                            >

                                {discharging

                                    ? "Discharging..."

                                    : "Discharge Patient"

                                }

                            </button>

                        </div>

                    )}


                    {/* ==================================================
                        DISCHARGED INFORMATION
                    ================================================== */}

                    {admission.status === "Discharged" && (

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">

                            <h2 className="text-xl font-bold mb-4">

                                Discharge Information

                            </h2>


                            <p className="mb-2">

                                <strong>Discharge Date:</strong>{" "}

                                {admission.discharge_date

                                    ? new Date(

                                        admission.discharge_date

                                    ).toLocaleDateString()

                                    : "—"

                                }

                            </p>


                            <p>

                                <strong>Reason:</strong>{" "}

                                {admission.discharge_reason || "—"}

                            </p>

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

export default AdmissionDetails;