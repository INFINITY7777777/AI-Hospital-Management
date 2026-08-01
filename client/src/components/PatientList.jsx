import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PatientList({ refreshPatients }) {

    // ==========================================================
    // PATIENT STATE
    // Stores the list of patients received from the backend
    // ==========================================================

    const [patients, setPatients] = useState([]);

    // ==========================================================
    // LOADING STATE
    // Shows loading message while fetching patients
    // ==========================================================

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const handleViewPatient = (patientid) => {
        navigate(`/patients/${patientid}`);
    };
    // ==========================================================
    // FETCH PATIENTS
    // Gets all patients from the backend API
    // ==========================================================

    useEffect(() => {

    let isMounted = true;

    const fetchPatients = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/patients"
            );

            if (isMounted) {

                setPatients(response.data.patients);

            }

        } catch (error) {

            console.error("Error fetching patients:", error);

        } finally {

            if (isMounted) {

                setLoading(false);

            }

        }

    };

    fetchPatients();

    return () => {

        isMounted = false;

    };

}, [refreshPatients]);


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (
            <div className="p-6">
                <p className="text-gray-500">
                    Loading patients...
                </p>
            </div>
        );

    }


    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-6">
                Patient List
            </h2>

            {patients.length === 0 ? (

                <p className="text-gray-500">
                    No patients found.
                </p>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="text-left p-3">
                                    Name
                                </th>

                                <th className="text-left p-3">
                                    Age
                                </th>

                                <th className="text-left p-3">
                                    Gender
                                </th>

                                <th className="text-left p-3">
                                    Doctor
                                </th>

                                <th className="text-left p-3">
                                    Ward
                                </th>

                                <th className="text-left p-3">
                                    Bed
                                </th>

                                <th className="test-left p-3">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {patients.map((patient) => (

                                <tr
                                    key={patient.id}
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="p-3">
                                        {patient.patient_name}
                                    </td>

                                    <td className="p-3">
                                        {patient.age}
                                    </td>

                                    <td className="p-3">
                                        {patient.gender}
                                    </td>

                                    <td className="p-3">
                                        {patient.doctor}
                                    </td>

                                    <td className="p-3">
                                        {patient.ward}
                                    </td>

                                    <td className="p-3">
                                        {patient.bed_number}
                                    </td>

                                    <td className="p-3">

                                        <button
                                            onClick={() => handleViewPatient(patient.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-1g">
                                                View
                                            </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default PatientList;