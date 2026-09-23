// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// AXIOS / API SERVICE
// ==========================================================

import api from "../services/api";

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
// ADD ADMISSION FORM COMPONENT
// ==========================================================

function AddAdmissionForm() {

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // PATIENTS STATE
    // ==========================================================

    const [patients, setPatients] = useState([]);


    // ==========================================================
    // AVAILABLE BEDS STATE
    // ==========================================================

    const [beds, setBeds] = useState([]);


    // ==========================================================
    // FORM DATA STATE
    // ==========================================================

    const [formData, setFormData] = useState({

        patientId: "",

        bedId: "",

        admissionDate: "",

        admissionReason: "",

        diagnosis: ""

    });


    // ==========================================================
    // LOADING STATES
    // ==========================================================

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // FETCH PATIENTS AND BEDS
    // Checks for token before making authenticated requests
    // ==========================================================

    useEffect(() => {

        const token = localStorage.getItem("token");

        // Redirect to login if token doesn't exist
        if (!token) {

            navigate("/");

            return;

        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const loadData = async () => {

            try {

                setLoading(true);

                setError("");


                // ==================================================
                // FETCH PATIENTS
                // ==================================================

                const patientsResponse = await api.get(
                    "/patients",
                    config
                );


                setPatients(
                    patientsResponse.data.patients || []
                );


                // ==================================================
                // FETCH BEDS
                // ==================================================

                const bedsResponse = await api.get(
                    "/beds",
                    config
                );


                // ==================================================
                // ONLY SHOW AVAILABLE BEDS
                // ==================================================

                const availableBeds = (
                    bedsResponse.data.beds || []
                ).filter(

                    (bed) => bed.status === "Available"

                );


                setBeds(availableBeds);

            }

            catch (error) {

                console.error(
                    "Error loading admission data:",
                    error
                );


                setError(

                    error.response?.data?.error ||

                    "Failed to load patients and beds"

                );

            }

            finally {

                setLoading(false);

            }

        };


        loadData();

    }, [navigate]);


    // ==========================================================
    // HANDLE INPUT CHANGE
    // ==========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;


        setFormData((prevData) => ({

            ...prevData,

            [name]: value

        }));

    };


    // ==========================================================
    // SUBMIT ADMISSION
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ==========================================================
        // BASIC VALIDATION
        // ==========================================================

        if (!formData.patientId) {

            alert("Please select a patient");

            return;

        }


        if (!formData.admissionDate) {

            alert("Please select an admission date");

            return;

        }


        try {

            setSubmitting(true);

            setError("");

            const token = localStorage.getItem("token");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // ======================================================
            // CREATE ADMISSION API CALL
            // ======================================================

            await api.post(

                "/admissions",

                {
                    patientId: Number(formData.patientId),

                    bedId: formData.bedId
                        ? Number(formData.bedId)
                        : null,

                    admissionDate:
                        formData.admissionDate,

                    admissionReason:
                        formData.admissionReason,

                    diagnosis:
                        formData.diagnosis
                },

                config

            );


            // ======================================================
            // SUCCESS
            // ======================================================

            alert(
                "Patient admitted successfully"
            );


            // ======================================================
            // REDIRECT TO ADMISSIONS LIST
            // ======================================================

            navigate("/admissions");

        }

        catch (error) {

            console.error(
                "Error creating admission:",
                error
            );


            setError(

                error.response?.data?.error ||

                "Failed to create admission"

            );

        }

        finally {

            setSubmitting(false);

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

                            Loading admission form...

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

                                Add Admission

                            </h1>

                            <p className="text-gray-500">

                                Admit a patient to the hospital

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
                        ERROR ALERT
                    ================================================== */}

                    {error && (

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        FORM
                    ================================================== */}

                    <form

                        onSubmit={handleSubmit}

                        className="bg-white rounded-xl shadow p-6 max-w-4xl"

                    >


                        {/* ==================================================
                            PATIENT SELECTION
                        ================================================== */}

                        <div className="mb-5">

                            <label className="block font-semibold mb-2">

                                Select Patient

                            </label>


                            <select

                                name="patientId"

                                value={
                                    formData.patientId
                                }

                                onChange={handleChange}

                                className="w-full border border-gray-300 rounded-lg p-3"

                            >

                                <option value="">

                                    Select a patient

                                </option>


                                {patients.map(

                                    (patient) => (

                                        <option

                                            key={patient.id}

                                            value={patient.id}

                                        >

                                            {patient.patient_name}

                                        </option>

                                    )

                                )}

                            </select>

                        </div>


                        {/* ==================================================
                            BED SELECTION
                        ================================================== */}

                        <div className="mb-5">

                            <label className="block font-semibold mb-2">

                                Select Bed

                            </label>


                            <select

                                name="bedId"

                                value={
                                    formData.bedId
                                }

                                onChange={handleChange}

                                className="w-full border border-gray-300 rounded-lg p-3"

                            >

                                <option value="">

                                    No Bed / Assign Later

                                </option>


                                {beds.map(

                                    (bed) => (

                                        <option

                                            key={bed.id}

                                            value={bed.id}

                                        >

                                            {bed.bed_number}
                                            {" - "}
                                            {bed.ward}
                                            {" - "}
                                            {bed.bed_type}

                                        </option>

                                    )

                                )}

                            </select>


                            {beds.length === 0 && (

                                <p className="text-red-500 text-sm mt-2">

                                    No available beds currently.

                                </p>

                            )}

                        </div>


                        {/* ==================================================
                            ADMISSION DATE
                        ================================================== */}

                        <div className="mb-5">

                            <label className="block font-semibold mb-2">

                                Admission Date

                            </label>


                            <input

                                type="date"

                                name="admissionDate"

                                value={
                                    formData.admissionDate
                                }

                                onChange={handleChange}

                                className="w-full border border-gray-300 rounded-lg p-3"

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

                                name="admissionReason"

                                value={
                                    formData.admissionReason
                                }

                                onChange={handleChange}

                                placeholder="Enter reason for admission"

                                rows="4"

                                className="w-full border border-gray-300 rounded-lg p-3"

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

                                name="diagnosis"

                                value={
                                    formData.diagnosis
                                }

                                onChange={handleChange}

                                placeholder="Enter diagnosis"

                                rows="4"

                                className="w-full border border-gray-300 rounded-lg p-3"

                            />

                        </div>


                        {/* ==================================================
                            BUTTONS
                        ================================================== */}

                        <div className="flex gap-3">

                            <button

                                type="submit"

                                disabled={submitting}

                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"

                            >

                                {submitting

                                    ? "Admitting Patient..."

                                    : "Admit Patient"

                                }

                            </button>


                            <button

                                type="button"

                                onClick={() =>
                                    navigate("/admissions")
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

export default AddAdmissionForm;