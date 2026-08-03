import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function DoctorList({ refreshDoctors }) {

    // ==========================================================
    // DOCTOR STATE
    // Stores the list of doctors received from the backend
    // ==========================================================

    const [doctors, setDoctors] = useState([]);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // FETCH DOCTORS
    // Gets all doctors from the backend API
    // ==========================================================

    const fetchDoctors = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/doctors"
            );

            setDoctors(response.data.doctors);

        } catch (error) {

            console.error(
                "Error fetching doctors:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // RUN WHEN COMPONENT LOADS
    // OR WHEN refreshDoctors CHANGES
    // ==========================================================

    useEffect(() => {

        const loadDoctors = async () => {

            await fetchDoctors();

        };

        loadDoctors();

    }, [refreshDoctors]);


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-gray-500">
                    Loading doctors...
                </p>

            </div>

        );

    }


    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-6">
                Doctor List
            </h2>


            {/* ==========================================================
                NO DOCTORS
            ========================================================== */}

            {doctors.length === 0 ? (

                <p className="text-gray-500">
                    No doctors found.
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
                                    Specialization
                                </th>

                                <th className="text-left p-3">
                                    Phone
                                </th>

                                <th className="text-left p-3">
                                    Department
                                </th>

                                <th className="text-left p-3">
                                    Experience
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {doctors.map((doctor) => (

                                <tr
                                    key={doctor.id}
                                    className="border-b hover:bg-gray-50"
                                >

                                    <td className="p-3">

                                        <Link
                                            to={`/doctors/${doctor.id}`}
                                            className="text-blue-600 font-semibold hover:underline"
                                        >
                                            {doctor.doctor_name}
                                        </Link>

                                    </td>

                                    <td className="p-3">
                                        {doctor.specialization}
                                    </td>

                                    <td className="p-3">
                                        {doctor.phone}
                                    </td>

                                    <td className="p-3">
                                        {doctor.department}
                                    </td>

                                    <td className="p-3">
                                        {doctor.experience} years
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

export default DoctorList;