import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";


function EditPatient() {

    // ==========================================================
    // GET PATIENT ID FROM URL
    // ==========================================================

    const { id } = useParams();


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // PATIENT DATA
    // ==========================================================

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


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // FETCH PATIENT
    // ==========================================================

    useEffect(() => {

        const fetchPatient = async () => {

            try {

                const response = await axios.get(
                    `http://localhost:5000/api/patients/${id}`
                );

                const patient = response.data.patient;


                // Convert database column names
                // into frontend state names

                setPatientData({

                    patientName: patient.patient_name || "",
                    age: patient.age || "",
                    gender: patient.gender || "",
                    bloodGroup: patient.blood_group || "",
                    phone: patient.phone || "",
                    address: patient.address || "",
                    emergencyContact: patient.emergency_contact || "",
                    doctor: patient.doctor || "",
                    ward: patient.ward || "",
                    bedNumber: patient.bed_number || "",
                    diagnosis: patient.diagnosis || "",
                    admissionDate: patient.admission_date || ""

                });

            } catch (error) {

                console.error(
                    "Error fetching patient:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchPatient();

    }, [id]);


    // ==========================================================
    // HANDLE INPUT CHANGE
    // ==========================================================

    const handleInputChange = (event) => {

        const { name, value } = event.target;

        setPatientData({

            ...patientData,

            [name]: value

        });

    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="p-8">

                <p className="text-gray-500">
                    Loading patient details...
                </p>

            </div>

        );

    }


    return (

        <div className="p-8">

            {/* ==========================================================
                BACK BUTTON
            ========================================================== */}

            <button
                onClick={() => navigate(`/patients/${id}`)}
                className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
                ← Back to Patient Details
            </button>


            {/* ==========================================================
                PAGE TITLE
            ========================================================== */}

            <h1 className="text-3xl font-bold">
                Edit Patient
            </h1>


            {/* ==========================================================
                EDIT FORM
            ========================================================== */}

            <div className="bg-white rounded-xl shadow p-6 mt-6">

                <div className="grid grid-cols-2 gap-6">


                    {/* PATIENT NAME */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Patient Name
                        </label>

                        <input
                            type="text"
                            name="patientName"
                            value={patientData.patientName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    {/* ADDRESS */}

                    <div className="col-span-2">

                        <label className="block mb-2 font-medium">
                            Address
                        </label>

                        <textarea
                            rows="3"
                            name="address"
                            value={patientData.address}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            value={patientData.bedNumber}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    {/* DIAGNOSIS */}

                    <div className="col-span-2">

                        <label className="block mb-2 font-medium">
                            Diagnosis
                        </label>

                        <textarea
                            rows="4"
                            name="diagnosis"
                            value={patientData.diagnosis}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>

                </div>


                {/* ==========================================================
                    UPDATE BUTTON
                ========================================================== */}

                <div className="mt-8 flex justify-end">

                    <button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                    >
                        Update Patient
                    </button>

                </div>

            </div>

        </div>

    );

}


export default EditPatient;