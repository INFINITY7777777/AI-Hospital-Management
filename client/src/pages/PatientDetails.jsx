// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import {
    useParams,
    useNavigate
} from "react-router-dom";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

import DigitalPatientCard from "../components/DigitalPatientCard";

import ClinicalNotes from "../components/ClinicalNotes";

import PatientMedicalHistory from "../components/PatientMedicalHistory";


// ==========================================================
// PATIENT DETAILS
// ==========================================================

function PatientDetails() {

    // ======================================================
    // GET PATIENT ID
    // ======================================================

    const { id } = useParams();


    // ======================================================
    // NAVIGATION
    // ======================================================

    const navigate = useNavigate();


    // ======================================================
    // PATIENT STATE
    // ======================================================

    const [patient, setPatient] = useState(null);


    // ======================================================
    // LOADING
    // ======================================================

    const [loading, setLoading] = useState(true);


    // ======================================================
    // ERROR
    // ======================================================

    const [error, setError] = useState("");


    // ======================================================
    // DELETE LOADING
    // ======================================================

    const [deleting, setDeleting] = useState(false);


    // ======================================================
    // FETCH PATIENT
    // ======================================================

    useEffect(() => {

        const fetchPatient = async () => {

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
                // GET PATIENT
                // ==================================================

                const response = await api.get(
                    `/patients/${id}`
                );


                setPatient(
                    response.data.patient
                );

            }

            catch (error) {

                console.error(
                    "Error fetching patient:",
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

                    setError(
                        "You do not have permission to view this patient."
                    );

                    return;

                }


                // ==================================================
                // NOT FOUND
                // ==================================================

                if (error.response?.status === 404) {

                    setError(
                        "Patient not found."
                    );

                    return;

                }


                // ==================================================
                // GENERAL ERROR
                // ==================================================

                setError(

                    error.response?.data?.error ||
                    "Failed to load patient details."

                );

            }

            finally {

                setLoading(false);

            }

        };


        if (id) {

            fetchPatient();

        }

    }, [id, navigate]);


    // ======================================================
    // DELETE PATIENT
    // ======================================================

    const handleDeletePatient = async () => {

        const confirmed = window.confirm(

            "Are you sure you want to delete this patient?"

        );


        if (!confirmed) {

            return;

        }


        try {

            setDeleting(true);


            const token = localStorage.getItem("token");


            if (!token) {

                navigate("/");

                return;

            }


            // ==================================================
            // DELETE
            // ==================================================

            await api.delete(
                `/patients/${patient.id}`
            );


            // ==================================================
            // BACK TO PATIENT LIST
            // ==================================================

            navigate("/patients");

        }

        catch (error) {

            console.error(
                "Error deleting patient:",
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

                alert(
                    "Only an admin can delete patients."
                );

                return;

            }


            // ==================================================
            // OTHER ERROR
            // ==================================================

            alert(

                error.response?.data?.error ||
                "Failed to delete patient."

            );

        }

        finally {

            setDeleting(false);

        }

    };



    // ======================================================
    // LOADING SCREEN
    // ======================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-50 p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                        <div className="animate-pulse">

                            <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>

                            <div className="h-9 bg-gray-200 rounded w-72 mb-8"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {[1, 2, 3, 4, 5, 6].map((item) => (

                                    <div
                                        key={item}
                                        className="h-16 bg-gray-100 rounded-lg"
                                    ></div>

                                ))}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // ERROR SCREEN
    // ======================================================

    if (error) {

    return (

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-5xl mx-auto">

                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8">

                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        Unable to Load Patient
                    </h1>

                    <p className="text-red-600 mb-6">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/patients")
                        }
                        className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                    >
                        ← Back to Patients
                    </button>

                </div>

            </div>

        </div>

    );

}


    // ======================================================
    // PATIENT NOT FOUND
    // ======================================================

    if (!patient) {

        return (

            <div className="min-h-screen bg-gray-50 p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="bg-white rounded-2xl shadow-sm p-8">

                        <p className="text-gray-500 mb-5">
                            Patient not found.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/patients")
                            }
                            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold"
                        >
                            ← Back to Patients
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // MAIN UI
    // ======================================================

    return (

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-5xl mx-auto">

                {/* ==================================================
                    BACK BUTTON
                ================================================== */}

                <button
                    onClick={() =>
                        navigate("/patients")
                    }
                    className="mb-6 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                >
                    ← Back to Patients
                </button>


                {/* ==================================================
                    DIGITAL PATIENT CARD
                ================================================== */}

                <div className="mb-8">

                    <DigitalPatientCard
                        patient={patient}
                    />

                </div>

                 {/* ======================================================
                    PATIENT MEDICAL HISTORY
                ====================================================== */}

                <PatientMedicalHistory
                    patientId={patient.id}
                />

                {/* ======================================================
                    CLINICAL NOTES
                ====================================================== */}

                <div className="mt-8">

                    <ClinicalNotes
                        patientId={patient.id}
                    />

                </div>


                {/* ==================================================
                    ACTION BUTTONS
                ================================================== */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    <div className="flex flex-wrap gap-3">

                        {/* ==================================================
                            EDIT PATIENT
                        ================================================== */}

                        <button
                            onClick={() =>
                                navigate(
                                    `/patients/${patient.id}/edit`
                                )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                        >
                            Edit Patient
                        </button>


                        {/* ==================================================
                            DELETE PATIENT
                        ================================================== */}

                        <button
                            onClick={handleDeletePatient}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition"
                        >

                            {deleting
                                ? "Deleting..."
                                : "Delete Patient"
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default PatientDetails;