import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditDoctor() {

    // ==========================================================
    // GET DOCTOR ID FROM URL
    // ==========================================================

    const { id } = useParams();

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();

    // ==========================================================
    // DOCTOR FORM DATA
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
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);

    // ==========================================================
    // SAVING STATE
    // ==========================================================

    const [saving, setSaving] = useState(false);

    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");

    // ==========================================================
    // FETCH DOCTOR
    // ==========================================================

    useEffect(() => {

        const loadDoctor = async () => {

            try {

                setError("");

                console.log(
                    "[EditDoctor] Fetching doctor:",
                    id
                );

                // IMPORTANT:
                // Use api instead of axios.
                // api automatically adds JWT token.

                const response = await api.get(
                    `/doctors/${id}`
                );

                console.log(
                    "[EditDoctor] Doctor response:",
                    response.data
                );

                const doctor = response.data.doctor;

                if (!doctor) {

                    setError(
                        "Doctor information was not found."
                    );

                    return;

                }

                // ==================================================
                // CONVERT DATABASE COLUMN NAMES
                // TO FRONTEND STATE NAMES
                // ==================================================

                setDoctorData({

                    doctorName:
                        doctor.doctor_name || "",

                    specialization:
                        doctor.specialization || "",

                    phone:
                        doctor.phone || "",

                    email:
                        doctor.email || "",

                    department:
                        doctor.department || "",

                    experience:
                        doctor.experience ?? ""

                });

            } catch (error) {

                console.error(
                    "[EditDoctor] Error fetching doctor:",
                    error
                );

                console.error(
                    "[EditDoctor] Status:",
                    error.response?.status
                );

                console.error(
                    "[EditDoctor] Response:",
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
                        "You do not have permission to edit doctors."
                    );

                }

                // ==================================================
                // DOCTOR NOT FOUND
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

        loadDoctor();

    }, [id]);

    // ==========================================================
    // HANDLE INPUT CHANGE
    // ==========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setDoctorData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };

    // ==========================================================
    // UPDATE DOCTOR
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);

        setError("");

        try {

            console.log(
                "[EditDoctor] Updating doctor:",
                id
            );

            console.log(
                "[EditDoctor] Data:",
                doctorData
            );

            // ==================================================
            // UPDATE DOCTOR
            // ==================================================
            // IMPORTANT:
            // Use api.put so JWT token is automatically added.

            const response = await api.put(

                `/doctors/${id}`,

                doctorData

            );

            console.log(
                "[EditDoctor] Update successful:",
                response.data
            );

            // ==================================================
            // SUCCESS MESSAGE
            // ==================================================

            alert(
                "Doctor updated successfully."
            );

            // ==================================================
            // GO BACK TO DOCTOR DETAILS
            // ==================================================

            navigate(`/doctors/${id}`);

        } catch (error) {

            console.error(
                "[EditDoctor] Error updating doctor:",
                error
            );

            console.error(
                "[EditDoctor] Status:",
                error.response?.status
            );

            console.error(
                "[EditDoctor] Response:",
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
                    "You do not have permission to update doctors."
                );

            }

            // ==================================================
            // DOCTOR NOT FOUND
            // ==================================================

            else if (error.response?.status === 404) {

                setError(
                    "Doctor not found."
                );

            }

            // ==================================================
            // OTHER BACKEND ERROR
            // ==================================================

            else {

                setError(

                    error.response?.data?.error ||

                    "Failed to update doctor."

                );

            }

        } finally {

            setSaving(false);

        }

    };

    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-gray-500">

                    Loading doctor information...

                </p>

            </div>

        );

    }

    // ==========================================================
    // EDIT DOCTOR PAGE
    // ==========================================================

    return (

        <div className="p-6">

            {/* ==================================================
                PAGE TITLE
            ================================================== */}

            <h1 className="text-3xl font-bold mb-6">

                Edit Doctor

            </h1>

            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (

                <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">

                    {error}

                </div>

            )}

            {/* ==================================================
                EDIT FORM
            ================================================== */}

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow p-6"
            >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ==================================================
                        DOCTOR NAME
                    ================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Doctor Name

                        </label>

                        <input
                            type="text"
                            name="doctorName"
                            value={doctorData.doctorName}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* ==================================================
                        SPECIALIZATION
                    ================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Specialization

                        </label>

                        <input
                            type="text"
                            name="specialization"
                            value={doctorData.specialization}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* ==================================================
                        PHONE
                    ================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Phone

                        </label>

                        <input
                            type="tel"
                            name="phone"
                            value={doctorData.phone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* ==================================================
                        EMAIL
                    ================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Email

                        </label>

                        <input
                            type="email"
                            name="email"
                            value={doctorData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* ==================================================
                        DEPARTMENT
                    ================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Department

                        </label>

                        <input
                            type="text"
                            name="department"
                            value={doctorData.department}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* ==================================================
                        EXPERIENCE
                    ================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Experience (Years)

                        </label>

                        <input
                            type="number"
                            name="experience"
                            value={doctorData.experience}
                            onChange={handleChange}
                            min="0"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                </div>

                {/* ==================================================
                    BUTTONS
                ================================================== */}

                <div className="flex gap-4 mt-8">

                    {/* ==================================================
                        UPDATE BUTTON
                    ================================================== */}

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >

                        {saving
                            ? "Updating..."
                            : "Update Doctor"
                        }

                    </button>

                    {/* ==================================================
                        CANCEL BUTTON
                    ================================================== */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/doctors/${id}`)
                        }
                        className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >

                        Cancel

                    </button>

                </div>

            </form>

        </div>

    );

}

export default EditDoctor;