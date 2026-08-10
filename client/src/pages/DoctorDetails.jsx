import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function DoctorDetails() {

    // ==========================================================
    // GET DOCTOR ID FROM URL
    // ==========================================================

    const { id } = useParams();

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();

    // ==========================================================
    // DOCTOR DATA
    // ==========================================================

    const [doctor, setDoctor] = useState(null);

    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);

    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");

    // ==========================================================
    // DELETE LOADING STATE
    // ==========================================================

    const [deleting, setDeleting] = useState(false);

    // ==========================================================
    // FETCH DOCTOR
    // ==========================================================

    useEffect(() => {

        const fetchDoctor = async () => {

            try {

                setLoading(true);
                setError("");

                console.log(
                    "[DoctorDetails] Fetching doctor:",
                    id
                );

                // IMPORTANT:
                // Use api instead of axios.
                // JWT token is automatically attached.

                const response = await api.get(
                    `/doctors/${id}`
                );

                console.log(
                    "[DoctorDetails] Response:",
                    response.data
                );

                setDoctor(response.data.doctor);

            } catch (error) {

                console.error(
                    "[DoctorDetails] Error fetching doctor:",
                    error
                );

                console.error(
                    "[DoctorDetails] Status:",
                    error.response?.status
                );

                console.error(
                    "[DoctorDetails] Response:",
                    error.response?.data
                );

                // ==================================================
                // AUTHENTICATION ERROR
                // ==================================================

                if (error.response?.status === 401) {

                    setError(
                        "Authentication failed. Please login again."
                    );

                }

                // ==================================================
                // AUTHORIZATION ERROR
                // ==================================================

                else if (error.response?.status === 403) {

                    setError(
                        "You do not have permission to view this doctor."
                    );

                }

                // ==================================================
                // NOT FOUND
                // ==================================================

                else if (error.response?.status === 404) {

                    setError(
                        "Doctor not found."
                    );

                }

                // ==================================================
                // OTHER ERROR
                // ==================================================

                else {

                    setError(
                        error.response?.data?.error ||
                        "Failed to load doctor information."
                    );

                }

            } finally {

                setLoading(false);

            }

        };

        fetchDoctor();

    }, [id]);

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

        if (!confirmDelete) {

            return;

        }

        try {

            setDeleting(true);

            console.log(
                "[DoctorDetails] Deleting doctor:",
                id
            );

            // IMPORTANT:
            // Use api so JWT token is automatically attached.

            const response = await api.delete(
                `/doctors/${id}`
            );

            console.log(
                "[DoctorDetails] Delete response:",
                response.data
            );

            // ==================================================
            // SUCCESS
            // ==================================================

            alert(
                "Doctor deleted successfully."
            );

            // ==================================================
            // GO BACK TO DOCTOR LIST
            // ==================================================

            navigate("/doctors");

        } catch (error) {

            console.error(
                "[DoctorDetails] Error deleting doctor:",
                error
            );

            console.error(
                "[DoctorDetails] Status:",
                error.response?.status
            );

            console.error(
                "[DoctorDetails] Response:",
                error.response?.data
            );

            // ==================================================
            // AUTHENTICATION ERROR
            // ==================================================

            if (error.response?.status === 401) {

                alert(
                    "Authentication failed. Please login again."
                );

            }

            // ==================================================
            // AUTHORIZATION ERROR
            // ==================================================

            else if (error.response?.status === 403) {

                alert(
                    "You do not have permission to delete doctors."
                );

            }

            // ==================================================
            // NOT FOUND
            // ==================================================

            else if (error.response?.status === 404) {

                alert(
                    "Doctor not found."
                );

            }

            // ==================================================
            // OTHER ERROR
            // ==================================================

            else {

                alert(
                    error.response?.data?.error ||
                    "Failed to delete doctor."
                );

            }

        } finally {

            setDeleting(false);

        }

    };

    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-gray-500">
                    Loading doctor details...
                </p>

            </div>

        );

    }

    // ==========================================================
    // ERROR / DOCTOR NOT FOUND
    // ==========================================================

    if (!doctor) {

        return (

            <div className="p-6">

                <h2 className="text-2xl font-bold">

                    {error || "Doctor not found"}

                </h2>

                <button
                    onClick={() => navigate("/doctors")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    ← Back to Doctors
                </button>

            </div>

        );

    }

    // ==========================================================
    // DOCTOR DETAILS PAGE
    // ==========================================================

    return (

        <div className="p-6">

            {/* ==================================================
                BACK BUTTON
            ================================================== */}

            <button
                onClick={() => navigate("/doctors")}
                className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
                ← Back to Doctors
            </button>

            {/* ==================================================
                PAGE TITLE
            ================================================== */}

            <h1 className="text-3xl font-bold mb-6">

                Doctor Details

            </h1>

            {/* ==================================================
                DOCTOR CARD
            ================================================== */}

            <div className="bg-white rounded-xl shadow p-6">

                {/* ==================================================
                    DOCTOR NAME
                ================================================== */}

                <h2 className="text-2xl font-bold mb-6">

                    {doctor.doctor_name}

                </h2>

                {/* ==================================================
                    DOCTOR INFORMATION
                ================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* SPECIALIZATION */}

                    <div>

                        <p className="text-gray-500">
                            Specialization
                        </p>

                        <p className="font-semibold">

                            {doctor.specialization || "Not provided"}

                        </p>

                    </div>

                    {/* PHONE */}

                    <div>

                        <p className="text-gray-500">
                            Phone
                        </p>

                        <p className="font-semibold">

                            {doctor.phone || "Not provided"}

                        </p>

                    </div>

                    {/* EMAIL */}

                    <div>

                        <p className="text-gray-500">
                            Email
                        </p>

                        <p className="font-semibold">

                            {doctor.email || "Not provided"}

                        </p>

                    </div>

                    {/* DEPARTMENT */}

                    <div>

                        <p className="text-gray-500">
                            Department
                        </p>

                        <p className="font-semibold">

                            {doctor.department || "Not provided"}

                        </p>

                    </div>

                    {/* EXPERIENCE */}

                    <div>

                        <p className="text-gray-500">
                            Experience
                        </p>

                        <p className="font-semibold">

                            {doctor.experience !== null &&
                            doctor.experience !== undefined
                                ? `${doctor.experience} years`
                                : "Not provided"}

                        </p>

                    </div>

                </div>

                {/* ==================================================
                    ACTION BUTTONS
                ================================================== */}

                <div className="flex gap-4 mt-8">

                    {/* ==================================================
                        EDIT DOCTOR
                    ================================================== */}

                    <button
                        onClick={() =>
                            navigate(`/doctors/${doctor.id}/edit`)
                        }
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Edit Doctor
                    </button>

                    {/* ==================================================
                        DELETE DOCTOR
                    ================================================== */}

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                    >

                        {deleting
                            ? "Deleting..."
                            : "Delete Doctor"}

                    </button>

                </div>

            </div>

        </div>

    );

}

export default DoctorDetails;