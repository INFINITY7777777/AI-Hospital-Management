// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import {
    useNavigate,
    useParams
} from "react-router-dom";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";


// ==========================================================
// EDIT PATIENT
// ==========================================================

function EditPatient() {

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
    // LOADING
    // ======================================================

    const [loading, setLoading] = useState(true);


    // ======================================================
    // UPDATING
    // ======================================================

    const [updating, setUpdating] = useState(false);


    // ======================================================
    // SUCCESS MESSAGE
    // ======================================================

    const [message, setMessage] = useState("");


    // ======================================================
    // ERROR MESSAGE
    // ======================================================

    const [errorMessage, setErrorMessage] = useState("");


    // ======================================================
    // FETCH PATIENT
    // ======================================================

    useEffect(() => {

        const fetchPatient = async () => {

            try {

                setLoading(true);

                setErrorMessage("");


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


                const patient = response.data.patient;


                // ==================================================
                // DATABASE → FRONTEND
                // ==================================================

                setPatientData({

                    patientName:
                        patient.patient_name || "",

                    age:
                        patient.age ?? "",

                    gender:
                        patient.gender || "",

                    bloodGroup:
                        patient.blood_group || "",

                    phone:
                        patient.phone || "",

                    address:
                        patient.address || "",

                    emergencyContact:
                        patient.emergency_contact || "",

                    doctor:
                        patient.doctor || "",

                    ward:
                        patient.ward || "",

                    bedNumber:
                        patient.bed_number || "",

                    diagnosis:
                        patient.diagnosis || "",

                    admissionDate:
                        patient.admission_date
                            ? String(
                                patient.admission_date
                            ).split("T")[0]
                            : ""

                });

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


                if (error.response?.status === 401) {

                    localStorage.removeItem("token");

                    navigate("/");

                    return;

                }


                if (error.response?.status === 403) {

                    setErrorMessage(
                        "You do not have permission to edit this patient."
                    );

                    return;

                }


                if (error.response?.status === 404) {

                    setErrorMessage(
                        "Patient not found."
                    );

                    return;

                }


                setErrorMessage(

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
    // HANDLE INPUT
    // ======================================================

    const handleInputChange = (event) => {

        const { name, value } = event.target;

        setPatientData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };


    // ======================================================
    // UPDATE PATIENT
    // ======================================================

    const handleUpdatePatient = async (event) => {

        event.preventDefault();


        setMessage("");

        setErrorMessage("");

        setUpdating(true);


        try {

            // ==================================================
            // UPDATE
            // ==================================================

            const response = await api.put(

                `/patients/${id}`,

                patientData

            );


            console.log(
                "Patient updated successfully:",
                response.data
            );


            // ==================================================
            // SUCCESS
            // ==================================================

            setMessage(
                "Patient updated successfully."
            );


            // ==================================================
            // GO TO DETAILS
            // ==================================================

            setTimeout(() => {

                navigate(
                    `/patients/${id}`
                );

            }, 1000);

        }

        catch (error) {

            console.error(
                "Error updating patient:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );


            if (error.response?.status === 401) {

                localStorage.removeItem("token");

                navigate("/");

                return;

            }


            if (error.response?.status === 403) {

                setErrorMessage(
                    "You do not have permission to update this patient."
                );

                return;

            }


            if (error.response?.status === 404) {

                setErrorMessage(
                    "Patient not found."
                );

                return;

            }


            setErrorMessage(

                error.response?.data?.error ||
                "Failed to update patient."

            );

        }

        finally {

            setUpdating(false);

        }

    };


    // ======================================================
    // LOADING SCREEN
    // ======================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-50 p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="bg-white rounded-2xl shadow-sm p-8">

                        <p className="text-gray-500">
                            Loading patient details...
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-5xl mx-auto">


                {/* BACK BUTTON */}

                <button
                    onClick={() =>
                        navigate(`/patients/${id}`)
                    }
                    disabled={updating}
                    className="mb-6 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold transition"
                >
                    ← Back to Patient Details
                </button>


                {/* TITLE */}

                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Patient
                </h1>

                <p className="text-gray-500 mt-2">
                    Update the patient's information below.
                </p>


                {/* ERROR */}

                {errorMessage && (

                    <div className="mt-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">

                        {errorMessage}

                    </div>

                )}


                {/* SUCCESS */}

                {message && (

                    <div className="mt-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">

                        {message}

                    </div>

                )}


                {/* FORM */}

                <form
                    onSubmit={handleUpdatePatient}
                    className="bg-white rounded-xl shadow p-6 mt-6"
                >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        {/* NAME */}

                        <div>

                            <label className="block mb-2 font-medium">
                                Patient Name
                            </label>

                            <input
                                type="text"
                                name="patientName"
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
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
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
                                value={patientData.address}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>


                        {/* DOCTOR */}

                        <div>

                            <label className="block mb-2 font-medium">
                                Doctor
                            </label>

                            <input
                                type="text"
                                name="doctor"
                                value={patientData.doctor}
                                onChange={handleInputChange}
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
                                value={patientData.ward}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>


                        {/* BED */}

                        <div>

                            <label className="block mb-2 font-medium">
                                Bed Number
                            </label>

                            <input
                                type="text"
                                name="bedNumber"
                                value={patientData.bedNumber}
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


                        {/* DIAGNOSIS */}

                        <div className="md:col-span-2">

                            <label className="block mb-2 font-medium">
                                Diagnosis
                            </label>

                            <textarea
                                rows="4"
                                name="diagnosis"
                                value={patientData.diagnosis}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                    </div>


                    {/* BUTTONS */}

                    <div className="mt-8 flex justify-end gap-4">


                        {/* CANCEL */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/patients/${id}`)
                            }
                            disabled={updating}
                            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition"
                        >
                            Cancel
                        </button>


                        {/* UPDATE */}

                        <button
                            type="submit"
                            disabled={updating}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition"
                        >

                            {updating
                                ? "Updating..."
                                : "Update Patient"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default EditPatient;