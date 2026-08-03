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
    // Stores all doctor information entered by the user
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
    // HANDLE INPUT CHANGES
    // Updates the corresponding field in form state
    // ==========================================================

    const handleInputChange = (event) => {

        const { name, value } = event.target;

        setDoctorData({

            ...doctorData,

            [name]: value

        });

    };


    // ==========================================================
    // HANDLE FORM SUBMISSION
    // Sends doctor data to backend
    // ==========================================================

    const handleSubmit = async (event) => {

        // Prevent page refresh
        event.preventDefault();


        try {

            // ==========================================================
            // SEND DATA TO BACKEND
            // ==========================================================

            const response = await axios.post(
                "http://localhost:5000/api/doctors",
                doctorData
            );


            // ==========================================================
            // DISPLAY SUCCESS MESSAGE
            // ==========================================================

            console.log(
                "Doctor added successfully:",
                response.data
            );


            // ==========================================================
            // CLEAR FORM
            // ==========================================================

            setDoctorData({

                doctorName: "",
                specialization: "",
                phone: "",
                email: "",
                department: "",
                experience: ""

            });


            // ==========================================================
            // REFRESH DOCTOR LIST
            // ==========================================================

            if (refreshDoctors) {

                refreshDoctors();

            }

        }


        // ==========================================================
        // ERROR HANDLING
        // ==========================================================

        catch (error) {

            console.error(
                "Error adding doctor:",
                error
            );

        }

    };


    return (

        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6 mt-6"
        >

            {/* ==========================================================
                FORM TITLE
            ========================================================== */}

            <h2 className="text-2xl font-bold">
                Add New Doctor
            </h2>


            <p className="text-gray-500 mt-2">
                Fill in the doctor's details below.
            </p>


            {/* ==========================================================
                FORM GRID
            ========================================================== */}

            <div className="grid grid-cols-2 gap-6 mt-6">


                {/* ==========================================================
                    DOCTOR NAME
                ========================================================== */}

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

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />

                </div>


                {/* ==========================================================
                    SPECIALIZATION
                ========================================================== */}

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

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />

                </div>


                {/* ==========================================================
                    PHONE NUMBER
                ========================================================== */}

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


                {/* ==========================================================
                    EMAIL
                ========================================================== */}

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


                {/* ==========================================================
                    DEPARTMENT
                ========================================================== */}

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

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />

                </div>


                {/* ==========================================================
                    EXPERIENCE
                ========================================================== */}

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

                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />

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
                    Save Doctor
                </button>

            </div>

        </form>

    );

}


export default AddDoctorForm;