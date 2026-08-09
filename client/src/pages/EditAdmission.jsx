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
// EDIT ADMISSION
// ==========================================================

function EditAdmission() {

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
    // FORM STATE
    // ==========================================================

    const [admissionDate, setAdmissionDate] = useState("");

    const [admissionReason, setAdmissionReason] = useState("");

    const [diagnosis, setDiagnosis] = useState("");

    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);

    // ==========================================================
    // SAVING STATE
    // ==========================================================

    const [saving, setSaving] = useState(false);

    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");

    // ==========================================================
    // LOAD ADMISSION
    // ==========================================================

    useEffect(() => {

        const loadAdmission = async () => {

            try {

                setLoading(true);

                setError("");

                const response = await axios.get(
                    `http://localhost:5000/api/admissions/${id}`
                );

                const data = response.data.admission;

                setAdmission(data);

                // ==================================================
                // SET FORM VALUES
                // ==================================================

                setAdmissionDate(
                    data.admission_date
                        ? new Date(data.admission_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                );

                setAdmissionReason(
                    data.admission_reason || ""
                );

                setDiagnosis(
                    data.diagnosis || ""
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
    // UPDATE ADMISSION
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        // ==========================================================
        // BASIC VALIDATION
        // ==========================================================

        if (!admissionDate) {

            setError(
                "Admission date is required"
            );

            return;

        }

        try {

            setSaving(true);

            setError("");

            // ======================================================
            // UPDATE API
            // ======================================================

            await axios.put(

                `http://localhost:5000/api/admissions/${id}`,

                {
                    admissionDate,
                    admissionReason,
                    diagnosis
                }

            );

            // ======================================================
            // SUCCESS
            // ======================================================

            alert(
                "Admission updated successfully"
            );

            // ======================================================
            // RETURN TO DETAILS
            // ======================================================

            navigate(`/admissions/${id}`);

        }

        catch (error) {

            console.error(
                "Error updating admission:",
                error
            );

            setError(
                error.response?.data?.error ||
                "Failed to update admission"
            );

        }

        finally {

            setSaving(false);

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

                            Loading admission...

                        </p>

                    </div>

                </div>

            </div>

        );

    }

    // ==========================================================
    // ERROR / NOT FOUND
    // ==========================================================

    if (!admission) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error || "Admission not found"}

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

                                Edit Admission

                            </h1>

                            <p className="text-gray-500">

                                Update admission information

                            </p>

                        </div>

                        <button

                            onClick={() =>
                                navigate(`/admissions/${id}`)
                            }

                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"

                        >

                            Cancel

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
                        PATIENT INFORMATION
                    ================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mb-6">

                        <h2 className="text-xl font-bold mb-5">

                            Patient

                        </h2>

                        <p className="text-gray-500">

                            Patient Name

                        </p>

                        <p className="text-lg font-semibold">

                            {admission.patient_name}

                        </p>

                    </div>

                    {/* ==================================================
                        EDIT FORM
                    ================================================== */}

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-xl shadow p-6"
                    >

                        <h2 className="text-xl font-bold mb-5">

                            Admission Information

                        </h2>

                        {/* ==================================================
                            ADMISSION DATE
                        ================================================== */}

                        <div className="mb-5">

                            <label className="block font-semibold mb-2">

                                Admission Date

                            </label>

                            <input

                                type="date"

                                value={admissionDate}

                                onChange={(event) =>
                                    setAdmissionDate(
                                        event.target.value
                                    )
                                }

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />

                        </div>

                        {/* ==================================================
                            ADMISSION REASON
                        ================================================== */}

                        <div className="mb-5">

                            <label className="block font-semibold mb-2">

                                Admission Reason

                            </label>

                            <textarea

                                value={admissionReason}

                                onChange={(event) =>
                                    setAdmissionReason(
                                        event.target.value
                                    )
                                }

                                placeholder="Enter admission reason"

                                rows="4"

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />

                        </div>

                        {/* ==================================================
                            DIAGNOSIS
                        ================================================== */}

                        <div className="mb-6">

                            <label className="block font-semibold mb-2">

                                Diagnosis

                            </label>

                            <textarea

                                value={diagnosis}

                                onChange={(event) =>
                                    setDiagnosis(
                                        event.target.value
                                    )
                                }

                                placeholder="Enter diagnosis"

                                rows="4"

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />

                        </div>

                        {/* ==================================================
                            BUTTONS
                        ================================================== */}

                        <div className="flex gap-4">

                            <button

                                type="submit"

                                disabled={saving}

                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"

                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"
                                }

                            </button>

                            <button

                                type="button"

                                onClick={() =>
                                    navigate(`/admissions/${id}`)
                                }

                                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"

                            >

                                Cancel

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

}

// ==========================================================
// EXPORT
// ==========================================================

export default EditAdmission;