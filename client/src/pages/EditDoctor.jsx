import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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
    // Gets existing doctor data
    // ==========================================================

    useEffect(() => {

        const loadDoctor = async () => {

            try {

                const response = await axios.get(
                    `http://localhost:5000/api/doctors/${id}`
                );

                const doctor = response.data.doctor;

                setDoctorData({

                    doctorName: doctor.doctor_name || "",
                    specialization: doctor.specialization || "",
                    phone: doctor.phone || "",
                    email: doctor.email || "",
                    department: doctor.department || "",
                    experience: doctor.experience || ""

                });

            } catch (error) {

                console.error(
                    "Error fetching doctor:",
                    error
                );

                setError(
                    "Failed to load doctor information."
                );

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

            await axios.put(
                `http://localhost:5000/api/doctors/${id}`,
                doctorData
            );


            // ==========================================================
            // GO BACK TO DOCTOR DETAILS
            // ==========================================================

            navigate(`/doctors/${id}`);

        } catch (error) {

            console.error(
                "Error updating doctor:",
                error
            );

            setError(
                "Failed to update doctor."
            );

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
    // EDIT DOCTOR FORM
    // ==========================================================

    return (

        <div className="p-6">

            {/* ==========================================================
                PAGE TITLE
            ========================================================== */}

            <h1 className="text-3xl font-bold mb-6">
                Edit Doctor
            </h1>


            {/* ==========================================================
                ERROR MESSAGE
            ========================================================== */}

            {error && (

                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">

                    {error}

                </div>

            )}


            {/* ==========================================================
                FORM
            ========================================================== */}

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow p-6"
            >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


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
                            value={doctorData.doctorName}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
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
                            value={doctorData.specialization}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>


                    {/* ==========================================================
                        PHONE
                    ========================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Phone
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={doctorData.phone}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>


                    {/* ==========================================================
                        EMAIL
                    ========================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={doctorData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-3"
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
                            value={doctorData.department}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
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
                            value={doctorData.experience}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                </div>


                {/* ==========================================================
                    BUTTONS
                ========================================================== */}

                <div className="flex gap-4 mt-8">

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >

                        {saving
                            ? "Saving..."
                            : "Update Doctor"
                        }

                    </button>


                    <button
                        type="button"
                        onClick={() => navigate(`/doctors/${id}`)}
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