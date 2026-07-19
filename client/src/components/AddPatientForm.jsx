// ==========================================================
// ADD PATIENT FORM
// Used to register a new patient
// ==========================================================

// ==========================================================
// REACT HOOKS
// Used to store form data
// ==========================================================

import { useState } from "react";


function AddPatientForm() {

    // ==========================================================
    // FORM STATE
    // Stores all patient information entered by the user
    // ==========================================================
    
    const [patientData, setPatientData] = useState({

        patientName : "",
        age : "",
        gender : "",
        bloodGroup : "",
        phone : "",
        address : "",
        emergencyContact : "",

        doctor : "",
        ward : "",
        bedNumber : "",
        diagnosis : "",
        admissionDate : ""



    });

    // console.log(patientData);

    // ==========================================================
    // HANDLE INPUT CHANGES
    // Updates the corresponding field in the form state
    // ==========================================================

    const handleInputChange = (event) => {

        const {name, value} = event.target;

        setPatientData({

            ...patientData,

            [name] : value
        });
    };

    // ==========================================================
    // SAVE PATIENT
    // Handles form submission
    // ==========================================================

    const handleSubmit = (event) => {

        // Prevent page refresh
        event.preventDefault();

        // Display entered data (Temporary)
        console.log(patientData);

    };

    return (

        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 mt-6"
        >

            <h2 className="text-2xl font-bold">
                Add New Patient
            </h2>

            <p className="text-gray-500 mt-2">
                Fill in the patient's details below.
            </p>

            {/* ==========================================================
                FORM GRID
                All form fields will be placed inside this grid.
            ========================================================== */}

            <div className="grid grid-cols-2 gap-6 mt-6">

                {/* ==========================================================
                    PATIENT NAME
                ========================================================== */}

                <div className="mt-6">

                    <label className="block mb-2 font-medium">
                        Patient Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter patient's full name"

                        name="patientName"

                        value={patientData.patientName}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    
                    />

                </div>

                {/* ==========================================================
                    PATIENT AGE
                ========================================================== */}

                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Age
                    </label>

                    <input
                        type="number"
                        placeholder="Enter patient's age"

                        name="age"

                        value={patientData.age}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>
                
                {/* ==========================================================
                    PATIENT GENDER
                ========================================================== */}

                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Gender
                    </label>

                    <select

                        name="gender"

                        value={patientData.gender}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>

                </div>

                {/* ==========================================================
                    BLOOD GROUP
                ========================================================== */}

                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Blood Group
                    </label>

                    <select

                        name="bloodGroup"

                        value={patientData.bloodGroup}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Select Blood Group</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                    </select>

                </div>

                {/* ==========================================================
                    PHONE NUMBER
                ========================================================== */}

                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Phone Number
                    </label>

                    <input
                        type="tel"
                        placeholder="Enter patient's phone number"

                        name="phone"

                        value={patientData.phone}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* ==========================================================
                    ADDRESS
                ========================================================== */}

                <div className="mt-5 col-span-2">

                    <label className="block mb-2 font-medium">
                        Address
                    </label>

                    <textarea
                        rows="3"
                        placeholder="Enter patient's address"

                        name="address"

                        value={patientData.address}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>

                </div>

                {/* ==========================================================
                    EMERGENCY CONTACT
                ========================================================== */}

                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Emergency Contact
                    </label>

                    <input
                        type="tel"
                        placeholder="Enter emergency contact number"

                        name="emergencyContact"

                        value={patientData.emergencyContact}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* ==========================================================
                    ASSIGNED DOCTOR
                ========================================================== */}

                <div className="mt-5">

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

                {/* ==========================================================
                    ADMISSION DATE
                ========================================================== */}

                <div className="mt-5">

                    <label className="block mb-2 font-medium">
                        Admission Date
                    </label>

                    <input
                        type="date"
                        name="admissionDate"

                        value={patientData.admissionDate}

                        onChange={handleInputChange}

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>

                {/* ==========================================================
                    WARD
                ========================================================== */}

                <div className="mt-5">

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

                {/* ==========================================================
                    BED NUMBER
                ========================================================== */}

                <div className="mt-5">

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

                {/* ==========================================================
                    DIAGNOSIS
                ========================================================== */}

                <div className="mt-5 col-span-2">

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
                    ></textarea>

                </div>




            </div>

            {/* ==========================================================
                SAVE BUTTON
            ========================================================== */}

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