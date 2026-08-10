// ==========================================================
// ADD DOCTOR FORM
// Used to register a new doctor
// ==========================================================

import { useState } from "react";
import axios from "axios";

// ==========================================================
// ADD DOCTOR FORM COMPONENT
// ==========================================================

function AddDoctorForm({ refreshDoctors }) {

    // ==========================================================
    // FORM STATE
    // ==========================================================

    const [doctorData, setDoctorData] = useState({

        doctorName: "",
        specialization: "",
        phone: "",
        email: "",
        department: "",
        experience: ""

    });


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [saving, setSaving] = useState(false);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // SUCCESS STATE
    // ==========================================================

    const [success, setSuccess] = useState("");


    // ==========================================================
    // HANDLE INPUT CHANGES
    // ==========================================================

    const handleInputChange = (event) => {

        const { name, value } = event.target;

        setDoctorData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };


    // ==========================================================
    // HANDLE FORM SUBMISSION
    // ==========================================================

    const handleSubmit = async (event) => {

        // Prevent browser refresh
        event.preventDefault();


        // Clear previous messages

        setError("");

        setSuccess("");


        // ======================================================
        // GET JWT TOKEN
        // ======================================================

        const token = localStorage.getItem("token");


        // ======================================================
        // CHECK LOGIN
        // ======================================================

        if (!token) {

            setError(
                "Authentication token not found. Please login again."
            );

            return;

        }


        // ======================================================
        // START SAVING
        // ======================================================

        setSaving(true);


        try {

            // ==================================================
            // SEND DOCTOR DATA TO BACKEND
            // ==================================================

            const response = await axios.post(

                "http://localhost:5000/api/doctors",

                doctorData,

                {
                    headers: {

                        Authorization: `Bearer ${token}`,

                        "Content-Type": "application/json"

                    }

                }

            );


            // ==================================================
            // SUCCESS
            // ==================================================

            console.log(
                "Doctor added successfully:",
                response.data
            );


            setSuccess(
                "Doctor added successfully!"
            );


            // ==================================================
            // CLEAR FORM
            // ==================================================

            setDoctorData({

                doctorName: "",
                specialization: "",
                phone: "",
                email: "",
                department: "",
                experience: ""

            });


            // ==================================================
            // REFRESH DOCTOR LIST
            // ==================================================

            if (refreshDoctors) {

                refreshDoctors();

            }

        }


        // ======================================================
        // ERROR HANDLING
        // ======================================================

        catch (error) {

            console.error(
                "Error adding doctor:",
                error
            );


            // ==================================================
            // UNAUTHORIZED
            // ==================================================

            if (error.response?.status === 401) {

                setError(
                    "Your login session is invalid or expired. Please login again."
                );

                return;

            }


            // ==================================================
            // FORBIDDEN
            // ==================================================

            if (error.response?.status === 403) {

                setError(
                    "You do not have permission to add a doctor. Only administrators can add doctors."
                );

                return;

            }


            // ==================================================
            // OTHER BACKEND ERROR
            // ==================================================

            setError(

                error.response?.data?.error ||

                "Failed to add doctor."

            );

        }


        // ======================================================
        // STOP SAVING
        // ======================================================

        finally {

            setSaving(false);

        }

    };


    // ==========================================================
    // UI
    // ==========================================================

    return (

        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 mt-6"
        >

            {/* ==================================================
                FORM TITLE
            ================================================== */}

            <h2 className="text-2xl font-bold">

                Add New Doctor

            </h2>


            <p className="text-gray-500 mt-2">

                Fill in the doctor's details below.

            </p>


            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (

                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">

                    {error}

                </div>

            )}


            {/* ==================================================
                SUCCESS MESSAGE
            ================================================== */}

            {success && (

                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">

                    {success}

                </div>

            )}


            {/* ==================================================
                FORM GRID
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">


                {/* ==================================================
                    DOCTOR NAME
                ================================================== */}

                <div>

                    <label className="block mb-2 font-medium">

                        Doctor Name

                    </label>

                    <input
                        type="text"
                        name="doctorName"
                        placeholder="Enter doctor's full name"
                        value={doctorData.doctorName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    SPECIALIZATION
                ================================================== */}

                <div>

                    <label className="block mb-2 font-medium">

                        Specialization

                    </label>

                    <input
                        type="text"
                        name="specialization"
                        placeholder="e.g. Cardiologist"
                        value={doctorData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    PHONE NUMBER
                ================================================== */}

                <div>

                    <label className="block mb-2 font-medium">

                        Phone Number

                    </label>

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={doctorData.phone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    EMAIL
                ================================================== */}

                <div>

                    <label className="block mb-2 font-medium">

                        Email Address

                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={doctorData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    DEPARTMENT
                ================================================== */}

                <div>

                    <label className="block mb-2 font-medium">

                        Department

                    </label>

                    <input
                        type="text"
                        name="department"
                        placeholder="Enter department"
                        value={doctorData.department}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ==================================================
                    EXPERIENCE
                ================================================== */}

                <div>

                    <label className="block mb-2 font-medium">

                        Experience

                    </label>

                    <input
                        type="number"
                        name="experience"
                        placeholder="Years of experience"
                        value={doctorData.experience}
                        onChange={handleInputChange}
                        min="0"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

            </div>


            {/* ==================================================
                SAVE BUTTON
            ================================================== */}

            <div className="mt-8 flex justify-end">

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >

                    {saving
                        ? "Saving..."
                        : "Save Doctor"
                    }

                </button>

            </div>

        </form>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default AddDoctorForm;