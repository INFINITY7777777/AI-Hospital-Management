import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AppointmentDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [deleting, setDeleting] = useState(false);


    // ==========================================================
    // FETCH APPOINTMENT
    // ==========================================================

    useEffect(() => {

        const fetchAppointment = async () => {

            const token = localStorage.getItem("token");

            if (!token) {

                navigate("/");

                return;

            }

            try {

                const response = await axios.get(

                    `http://localhost:5000/api/appointments/${id}`,

                    {

                        headers: {

                            Authorization: `Bearer ${token}`

                        }

                    }

                );


                setAppointment(
                    response.data.appointment
                );

            } catch (error) {

                console.error(
                    "Error fetching appointment:",
                    error
                );


                if (error.response?.status === 401) {

                    localStorage.removeItem("token");

                    navigate("/");

                    return;

                }


                setError(

                    error.response?.data?.error ||
                    "Failed to fetch appointment"

                );

            } finally {

                setLoading(false);

            }

        };


        fetchAppointment();

    }, [id, navigate]);


    // ==========================================================
    // DELETE APPOINTMENT
    // ==========================================================

    const handleDelete = async () => {

        const confirmed = window.confirm(

            "Are you sure you want to delete this appointment?"

        );


        if (!confirmed) {

            return;

        }


        const token = localStorage.getItem("token");


        if (!token) {

            navigate("/");

            return;

        }


        try {

            setDeleting(true);


            await axios.delete(

                `http://localhost:5000/api/appointments/${id}`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );


            alert(
                "Appointment deleted successfully."
            );


            navigate("/appointments");

        } catch (error) {

            console.error(
                "Error deleting appointment:",
                error
            );


            setError(

                error.response?.data?.error ||
                "Failed to delete appointment"

            );

            setDeleting(false);

        }

    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-gray-500">
                    Loading appointment details...
                </p>

            </div>

        );

    }


    // ==========================================================
    // ERROR
    // ==========================================================

    if (error) {

        return (

            <div className="p-6">

                <div className="bg-red-100 text-red-700 p-4 rounded-lg">

                    {error}

                </div>


                <button
                    onClick={() =>
                        navigate("/appointments")
                    }
                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Appointments
                </button>

            </div>

        );

    }


    // ==========================================================
    // NOT FOUND
    // ==========================================================

    if (!appointment) {

        return (

            <div className="p-6">

                <p className="text-gray-500">
                    Appointment not found.
                </p>

            </div>

        );

    }


    return (

        <div className="p-6">


            {/* ==========================================================
                BUTTONS
            ========================================================== */}

            <div className="flex gap-4 mb-6">

                <button
                    onClick={() =>
                        navigate("/appointments")
                    }
                    className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    ← Back to Appointments
                </button>


                <button
                    onClick={() =>
                        navigate(
                            `/appointments/${appointment.id}/edit`
                        )
                    }
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Edit Appointment
                </button>


                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >

                    {deleting
                        ? "Deleting..."
                        : "Delete Appointment"
                    }

                </button>

            </div>


            <h1 className="text-3xl font-bold mb-6">
                Appointment Details
            </h1>


            <div className="bg-white rounded-xl shadow p-6">


                {/* ==========================================================
                    APPOINTMENT
                ========================================================== */}

                <h2 className="text-xl font-bold mb-4">
                    Appointment Information
                </h2>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <p className="text-gray-500">
                            Appointment ID
                        </p>

                        <p className="font-semibold">
                            {appointment.id}
                        </p>
                    </div>


                    <div>
                        <p className="text-gray-500">
                            Date
                        </p>

                        <p className="font-semibold">
                            {appointment.appointment_date}
                        </p>
                    </div>


                    <div>
                        <p className="text-gray-500">
                            Time
                        </p>

                        <p className="font-semibold">
                            {appointment.appointment_time}
                        </p>
                    </div>


                    <div>
                        <p className="text-gray-500">
                            Status
                        </p>

                        <p className="font-semibold">
                            {appointment.status || "Scheduled"}
                        </p>
                    </div>


                    <div className="md:col-span-2">

                        <p className="text-gray-500">
                            Reason
                        </p>

                        <p className="font-semibold">
                            {appointment.reason || "N/A"}
                        </p>

                    </div>

                </div>


                {/* ==========================================================
                    PATIENT
                ========================================================== */}

                <div className="border-t mt-8 pt-6">

                    <h2 className="text-xl font-bold mb-4">
                        Patient Information
                    </h2>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <p className="text-gray-500">
                                Patient Name
                            </p>

                            <p className="font-semibold">
                                {appointment.patient_name || "N/A"}
                            </p>
                        </div>


                        <div>
                            <p className="text-gray-500">
                                Age
                            </p>

                            <p className="font-semibold">
                                {appointment.age || "N/A"}
                            </p>
                        </div>


                        <div>
                            <p className="text-gray-500">
                                Gender
                            </p>

                            <p className="font-semibold">
                                {appointment.gender || "N/A"}
                            </p>
                        </div>


                        <div>
                            <p className="text-gray-500">
                                Phone
                            </p>

                            <p className="font-semibold">
                                {appointment.phone || "N/A"}
                            </p>
                        </div>

                    </div>

                </div>


                {/* ==========================================================
                    DOCTOR
                ========================================================== */}

                <div className="border-t mt-8 pt-6">

                    <h2 className="text-xl font-bold mb-4">
                        Doctor Information
                    </h2>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <p className="text-gray-500">
                                Doctor Name
                            </p>

                            <p className="font-semibold">
                                {appointment.doctor_name || "N/A"}
                            </p>
                        </div>


                        <div>
                            <p className="text-gray-500">
                                Specialization
                            </p>

                            <p className="font-semibold">
                                {appointment.specialization || "N/A"}
                            </p>
                        </div>


                        <div>
                            <p className="text-gray-500">
                                Department
                            </p>

                            <p className="font-semibold">
                                {appointment.department || "N/A"}
                            </p>
                        </div>


                        <div>
                            <p className="text-gray-500">
                                Phone
                            </p>

                            <p className="font-semibold">
                                {appointment.doctor_phone || "N/A"}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AppointmentDetails;