import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function AppointmentList({ refreshAppointments }) {

    const navigate = useNavigate();

    // ==========================================================
    // APPOINTMENT STATE
    // Stores all appointments
    // ==========================================================

    const [appointments, setAppointments] = useState([]);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);

    


    // ==========================================================
    // FETCH APPOINTMENTS
    // ==========================================================

    useEffect(() => {

        const loadAppointments = async () => {

            try {

                const response = await axios.get(
                    "http://localhost:5000/api/appointments"
                );

                setAppointments(
                    response.data.appointments
                );

            } catch (error) {

                console.error(
                    "Error fetching appointments:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };

        loadAppointments();

    }, [refreshAppointments]);


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-gray-500">
                    Loading appointments...
                </p>

            </div>

        );

    }


    // ==========================================================
    // APPOINTMENT LIST
    // ==========================================================

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-6">
                Appointment List
            </h2>


            {/* ==========================================================
                NO APPOINTMENTS
            ========================================================== */}

            {appointments.length === 0 ? (

                <p className="text-gray-500">
                    No appointments found.
                </p>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="text-left p-3">
                                    Patient
                                </th>

                                <th className="text-left p-3">
                                    Doctor
                                </th>

                                <th className="text-left p-3">
                                    Specialization
                                </th>

                                <th className="text-left p-3">
                                    Date
                                </th>

                                <th className="text-left p-3">
                                    Time
                                </th>

                                <th className="text-left p-3">
                                    Reason
                                </th>

                                <th className="text-left p-3">
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {appointments.map((appointment) => (

                                <tr
                                    key={appointment.id}
                                    onClick={() =>
                                        navigate(`/appointments/${appointment.id}`)
                                    }
                                    className="border-b hover:bg-gray-50 cursor-pointer"
                                >

                                    {/* PATIENT */}

                                    <td className="p-3">
                                        {appointment.patient_name}
                                    </td>


                                    {/* DOCTOR */}

                                    <td className="p-3">
                                        {appointment.doctor_name}
                                    </td>


                                    {/* SPECIALIZATION */}

                                    <td className="p-3">
                                        {appointment.specialization}
                                    </td>


                                    {/* DATE */}

                                    <td className="p-3">
                                        {appointment.appointment_date}
                                    </td>


                                    {/* TIME */}

                                    <td className="p-3">
                                        {appointment.appointment_time}
                                    </td>


                                    {/* REASON */}

                                    <td className="p-3">
                                        {appointment.reason || "N/A"}
                                    </td>


                                    {/* STATUS */}

                                    <td className="p-3">
                                        {appointment.status}
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