import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function PatientDetails() {

    // Get patient ID from URL
    const { id } = useParams();

    // Store patient information
    const [patient, setPatient] = useState(null);

    // Loading state
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    // ==========================================================
    // FETCH PATIENT DETAILS
    // ==========================================================

    useEffect(() => {

        const fetchPatient = async () => {

            try {

                const response = await axios.get(
                    `http://localhost:5000/api/patients/${id}`
                );

                setPatient(response.data.patient);

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
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="p-6">
                Loading patient details...
            </div>
        );

    }


    // ==========================================================
    // PATIENT NOT FOUND
    // ==========================================================

    if (!patient) {

        return (
            <div className="p-6">
                Patient not found.
            </div>
        );

    }


    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            <button
                onClick={() => navigate("/patients")}
                calssName="mb-6 bg-gray-700 text-white px-5 py-2 rounded-1g font-semivold transition">
                    ← Back to Patients
                </button>


            <h1 className="text-3xl font-bold mb-6">
                Patient Details
            </h1>


            <div className="grid grid-cols-2 gap-6">

                <div>
                    <p className="text-gray-500">
                        Patient Name
                    </p>

                    <p className="font-semibold">
                        {patient.patient_name}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Age
                    </p>

                    <p className="font-semibold">
                        {patient.age}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Gender
                    </p>

                    <p className="font-semibold">
                        {patient.gender}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Blood Group
                    </p>

                    <p className="font-semibold">
                        {patient.blood_group}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Phone
                    </p>

                    <p className="font-semibold">
                        {patient.phone}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Emergency Contact
                    </p>

                    <p className="font-semibold">
                        {patient.emergency_contact}
                    </p>
                </div>


                <div className="col-span-2">

                    <p className="text-gray-500">
                        Address
                    </p>

                    <p className="font-semibold">
                        {patient.address}
                    </p>

                </div>


                <div>
                    <p className="text-gray-500">
                        Doctor
                    </p>

                    <p className="font-semibold">
                        {patient.doctor}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Ward
                    </p>

                    <p className="font-semibold">
                        {patient.ward}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Bed Number
                    </p>

                    <p className="font-semibold">
                        {patient.bed_number}
                    </p>
                </div>


                <div>
                    <p className="text-gray-500">
                        Admission Date
                    </p>

                    <p className="font-semibold">
                        {patient.admission_date}
                    </p>
                </div>


                <div className="col-span-2">

                    <p className="text-gray-500">
                        Diagnosis
                    </p>

                    <p className="font-semibold">
                        {patient.diagnosis}
                    </p>

                </div>

            </div>

            <button
                onClick={() => navigate(`/patients/${patient.id}/edit`)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
                Edit Patient
            </button>

        </div>

    );

}


export default PatientDetails;