import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function AppointmentList({ refreshAppointments }) {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let isMounted = true;

        const loadAppointments = async () => {

            const token = localStorage.getItem("token");

            // ==========================================================
            // CHECK LOGIN
            // ==========================================================

            if (!token) {

                navigate("/");

                return;

            }

            try {

                if (isMounted) {

                    setLoading(true);
                    setError("");

                }

                // ==========================================================
                // FETCH APPOINTMENTS
                // ==========================================================

                const response = await axios.get(
                    "http://localhost:5000/api/appointments",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (isMounted) {

                    setAppointments(
                        response.data.appointments || []
                    );

                }

            } catch (error) {

                console.error(
                    "Error fetching appointments:",
                    error
                );

                // ==========================================================
                // UNAUTHORIZED
                // ==========================================================

                if (error.response?.status === 401) {

                    localStorage.removeItem("token");

                    navigate("/");

                    return;

                }

                // ==========================================================
                // GENERAL ERROR
                // ==========================================================

                if (isMounted) {

                    setError(
                        error.response?.data?.error ||
                        "Failed to load appointments."
                    );

                }

            } finally {

                if (isMounted) {

                    setLoading(false);

                }

            }

        };

        loadAppointments();

        return () => {

            isMounted = false;

        };

    }, [refreshAppointments, navigate]);


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="bg-white rounded-xl shadow p-6 mt-6">

                <h2 className="text-2xl font-bold mb-6">
                    Appointment List
                </h2>

                <div className="space-y-3">

                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>

                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>

                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>

                </div>

            </div>

        );

    }


    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            {/* ==========================================================
                HEADER
            ========================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                <div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        Appointment List
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        View and manage patient appointments
                    </p>

                </div>

                <div className="text-sm text-gray-500">

                    Total Appointments:{" "}

                    <span className="font-semibold text-gray-900">
                        {appointments.length}
                    </span>

                </div>

            </div>


            {/* ==========================================================
                ERROR
            ========================================================== */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">

                    {error}

                </div>

            )}


            {/* ==========================================================
                EMPTY STATE
            ========================================================== */}

            {appointments.length === 0 ? (

                <div className="text-center py-12">

                    <div className="text-5xl mb-4">
                        📅
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                        No appointments found
                    </h3>

                    <p className="text-gray-500 mt-1">
                        Create an appointment to see it listed here.
                    </p>

                </div>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b bg-gray-50">

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Patient
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Doctor
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Specialization
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Date
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Time
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Reason
                                </th>

                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {appointments.map((appointment) => (

                                <tr
                                    key={appointment.id}
                                    onClick={() =>
                                        navigate(
                                            `/appointments/${appointment.id}`
                                        )
                                    }
                                    className="border-b hover:bg-gray-50 cursor-pointer"
                                >

                                    <td className="p-3">
                                        {appointment.patient_name || "—"}
                                    </td>

                                    <td className="p-3">
                                        {appointment.doctor_name || "—"}
                                    </td>

                                    <td className="p-3">
                                        {appointment.specialization || "—"}
                                    </td>

                                    <td className="p-3">
                                        {appointment.appointment_date || "—"}
                                    </td>

                                    <td className="p-3">
                                        {appointment.appointment_time || "—"}
                                    </td>

                                    <td className="p-3">
                                        {appointment.reason || "N/A"}
                                    </td>

                                    <td className="p-3">

                                        <span className="font-medium">
                                            {appointment.status || "Scheduled"}
                                        </span>

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

export default AppointmentList;