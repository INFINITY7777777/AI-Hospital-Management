import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function DoctorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    // ==========================================================
    // DELETE DOCTOR
    // ==========================================================

    const handleDelete = async () => {

        // ==========================================================
        // CONFIRM DELETE
        // ==========================================================

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this doctor?"
        );


        // ==========================================================
        // STOP IF USER CANCELS
        // ==========================================================

        if (!confirmDelete) {

            return;

        }


        try {

            // ==========================================================
            // DELETE DOCTOR FROM DATABASE
            // ==========================================================

            await axios.delete(
                `http://localhost:5000/api/doctors/${id}`
            );


            // ==========================================================
            // SHOW SUCCESS MESSAGE
            // ==========================================================

            alert(
                "Doctor deleted successfully"
            );


            // ==========================================================
            // GO BACK TO DOCTOR LIST
            // ==========================================================

            navigate("/doctors");

        } catch (error) {

            console.error(
                "Error deleting doctor:",
                error
            );


            // ==========================================================
            // SHOW ERROR MESSAGE
            // ==========================================================

            alert(
                "Failed to delete doctor"
            );

        }

    };

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/doctors/${id}`
                );

                setDoctor(response.data.doctor);
            } catch (error) {
                console.error("Error fetching doctor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-gray-500">
                    Loading doctor details...
                </p>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold">
                    Doctor not found
                </h2>

                <button
                    onClick={() => navigate("/doctors")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Doctors
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">

            <button
                onClick={() => navigate("/doctors")}
                className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
                ← Back to Doctors
            </button>

            <h1 className="text-3xl font-bold mb-6">
                Doctor Details
            </h1>

            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-2xl font-bold mb-6">
                    {doctor.doctor_name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <p className="text-gray-500">
                            Specialization
                        </p>

                        <p className="font-semibold">
                            {doctor.specialization}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">
                            Phone
                        </p>

                        <p className="font-semibold">
                            {doctor.phone}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">
                            Email
                        </p>

                        <p className="font-semibold">
                            {doctor.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">
                            Department
                        </p>

                        <p className="font-semibold">
                            {doctor.department}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500">
                            Experience
                        </p>

                        <p className="font-semibold">
                            {doctor.experience} years
                        </p>
                    </div>

                </div>


                 {/* ==========================================================
                    ACTION BUTTONS
                ========================================================== */}

                <div className="flex gap-4 mt-8">

                    {/* ==========================================================
                        EDIT DOCTOR
                    ========================================================== */}

                    <button
                        onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Edit Doctor
                    </button>


                    {/* ==========================================================
                        DELETE DOCTOR
                    ========================================================== */}

                    <button
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete Doctor
                    </button>

                </div>

            </div>



        </div>
    );
};

export default DoctorDetails;
