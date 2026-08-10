// ==========================================================
// REACT
// ==========================================================

import { useState } from "react";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";


// ==========================================================
// ADD PATIENT FORM
// ==========================================================

function AddPatientForm({ onPatientAdded }) {

    // ======================================================
    // FORM STATE
    // ======================================================

    const [patientData, setPatientData] = useState({

        patientName: "",
        age: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        address: "",
        emergencyContact: "",
        doctor: "",
        ward: "",
        bedNumber: "",
        diagnosis: "",
        admissionDate: ""

    });


    // ======================================================
    // HANDLE INPUT CHANGE
    // ======================================================

    const handleInputChange = (event) => {

        const { name, value } = event.target;

        setPatientData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };


    // ======================================================
    // HANDLE FORM SUBMIT
    // ======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ==================================================
        // CHECK TOKEN
        // ==================================================

        const token = localStorage.getItem("token");

        if (!token) {

            alert(
                "You are not logged in. Please login again."
            );

            return;

        }


        try {

            // ==================================================
            // SEND DATA TO BACKEND
            // ==================================================

            const response = await api.post(
                "/patients",
                patientData
            );


            console.log(
                "Patient added successfully:",
                response.data
            );


            // ==================================================
            // SUCCESS MESSAGE
            // ==================================================

            alert(
                "Patient added successfully!"
            );


            // ==================================================
            // CLEAR FORM
            // ==================================================

            setPatientData({

                patientName: "",
                age: "",
                gender: "",
                bloodGroup: "",
                phone: "",
                address: "",
                emergencyContact: "",
                doctor: "",
                ward: "",
                bedNumber: "",
                diagnosis: "",
                admissionDate: ""

            });


            // ==================================================
            // REFRESH PATIENT LIST
            // ==================================================

            if (onPatientAdded) {

                onPatientAdded();

            }

        }

        catch (error) {

            console.error(
                "Error adding patient:",
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

                alert(
                    "Your session has expired. Please login again."
                );

                return;

            }


            // ==================================================
            // FORBIDDEN
            // ==================================================

            if (error.response?.status === 403) {

                alert(
                    "You do not have permission to add patients."
                );

                return;

            }


            // ==================================================
            // OTHER ERROR
            // ==================================================

            alert(

                error.response?.data?.error ||
                "Failed to add patient."

            );

        }

    };


    // ======================================================
    // UI
    // ======================================================

    return (

        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 mt-6"
        >

            {/* ==================================================
                TITLE
            ================================================== */}

            <h2 className="text-2xl font-bold text-gray-900">
                Add New Patient
            </h2>


            <p className="text-gray-500 mt-2">
                Fill in the patient's details below.
            </p>


            {/* ==================================================
                FORM GRID
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">


                {/* PATIENT NAME */}

                <div>

                    <label className="block mb-2 font-medium">
                        Patient Name
                    </label>

                    <input
                        type="text"
                        name="patientName"
                        placeholder="Enter patient's full name"
                        value={patientData.patientName}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* AGE */}

                <div>

                    <label className="block mb-2 font-medium">
                        Age
                    </label>

                    <input
                        type="number"
                        name="age"
                        placeholder="Enter patient's age"
                        value={patientData.age}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* GENDER */}

                <div>

                    <label className="block mb-2 font-medium">
                        Gender
                    </label>

                    <select
                        name="gender"
                        value={patientData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                        <option value="">
                            Select Gender
                        </option>

                        <option value="Male">
                            Male
                        </option>

                        <option value="Female">
                            Female
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>

                </div>


                {/* BLOOD GROUP */}

                <div>

                    <label className="block mb-2 font-medium">
                        Blood Group
                    </label>

                    <select
                        name="bloodGroup"
                        value={patientData.bloodGroup}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >

                        <option value="">
                            Select Blood Group
                        </option>

                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>

                    </select>

                </div>


                {/* PHONE */}

                <div>

                    <label className="block mb-2 font-medium">
                        Phone Number
                    </label>

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Enter patient's phone number"
                        value={patientData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* EMERGENCY CONTACT */}

                <div>

                    <label className="block mb-2 font-medium">
                        Emergency Contact
                    </label>

                    <input
                        type="tel"
                        name="emergencyContact"
                        placeholder="Enter emergency contact number"
                        value={patientData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ADDRESS */}

                <div className="md:col-span-2">

                    <label className="block mb-2 font-medium">
                        Address
                    </label>

                    <textarea
                        rows="3"
                        name="address"
                        placeholder="Enter patient's address"
                        value={patientData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* DOCTOR */}

                <div>

                    <label className="block mb-2 font-medium">
                        Assigned Doctor
                    </label>

                    <input
                        type="text"
                        name="doctor"
                        placeholder="Enter doctor's name"
                        value={patientData.doctor}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* ADMISSION DATE */}

                <div>

                    <label className="block mb-2 font-medium">
                        Admission Date
                    </label>

                    <input
                        type="date"
                        name="admissionDate"
                        value={patientData.admissionDate}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* WARD */}

                <div>

                    <label className="block mb-2 font-medium">
                        Ward
                    </label>

                    <input
                        type="text"
                        name="ward"
                        placeholder="Enter ward"
                        value={patientData.ward}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* BED NUMBER */}

                <div>

                    <label className="block mb-2 font-medium">
                        Bed Number
                    </label>

                    <input
                        type="text"
                        name="bedNumber"
                        placeholder="Enter bed number"
                        value={patientData.bedNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>


                {/* DIAGNOSIS */}

                <div className="md:col-span-2">

                    <label className="block mb-2 font-medium">
                        Diagnosis
                    </label>

                    <textarea
                        rows="4"
                        name="diagnosis"
                        placeholder="Enter diagnosis"
                        value={patientData.diagnosis}
                        onChange={handleInputChange}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                    Save Patient
                </button>

            </div>

        </form>

    );

}

export default AddPatientForm;