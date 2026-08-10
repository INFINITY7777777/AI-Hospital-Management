import { useEffect, useState } from "react";
import axios from "axios";

function AddAppointmentForm({ refreshAppointments }) {

    // ==========================================================
    // PATIENTS
    // ==========================================================

    const [patients, setPatients] = useState([]);

    // ==========================================================
    // DOCTORS
    // ==========================================================

    const [doctors, setDoctors] = useState([]);

    // ==========================================================
    // FORM DATA
    // ==========================================================

    const [appointmentData, setAppointmentData] = useState({

        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""

    });

    // ==========================================================
    // LOADING
    // ==========================================================

    const [loading, setLoading] = useState(true);

    // ==========================================================
    // SUBMITTING
    // ==========================================================

    const [submitting, setSubmitting] = useState(false);

    // ==========================================================
    // ERROR
    // ==========================================================

    const [error, setError] = useState("");

    // ==========================================================
    // SUCCESS
    // ==========================================================

    const [success, setSuccess] = useState("");


    // ==========================================================
    // LOAD PATIENTS + DOCTORS
    // ==========================================================

    useEffect(() => {

        const loadData = async () => {

            const token = localStorage.getItem("token");

            if (!token) {

                setError("You are not logged in.");

                setLoading(false);

                return;

            }

            try {

                const config = {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                };


                const [
                    patientsResponse,
                    doctorsResponse
                ] = await Promise.all([

                    axios.get(
                        "http://localhost:5000/api/patients",
                        config
                    ),

                    axios.get(
                        "http://localhost:5000/api/doctors",
                        config
                    )

                ]);


                setPatients(
                    patientsResponse.data.patients || []
                );


                setDoctors(
                    doctorsResponse.data.doctors || []
                );

            } catch (error) {

                console.error(
                    "Error loading patients and doctors:",
                    error
                );

                setError(

                    error.response?.data?.error ||
                    "Failed to load patients or doctors."

                );

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, []);


    // ==========================================================
    // INPUT CHANGE
    // ==========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setAppointmentData(
            (previousData) => ({

                ...previousData,

                [name]: value

            })
        );

    };


    // ==========================================================
    // SUBMIT
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess("");

        setSubmitting(true);


        const token = localStorage.getItem("token");


        if (!token) {

            setError("You are not logged in.");

            setSubmitting(false);

            return;

        }


        try {

            await axios.post(

                "http://localhost:5000/api/appointments",

                {

                    patientId: Number(
                        appointmentData.patientId
                    ),

                    doctorId: Number(
                        appointmentData.doctorId
                    ),

                    appointmentDate:
                        appointmentData.appointmentDate,

                    appointmentTime:
                        appointmentData.appointmentTime,

                    reason:
                        appointmentData.reason

                },

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );


            // ==========================================================
            // SUCCESS
            // ==========================================================

            setSuccess(
                "Appointment created successfully!"
            );


            // ==========================================================
            // RESET FORM
            // ==========================================================

            setAppointmentData({

                patientId: "",
                doctorId: "",
                appointmentDate: "",
                appointmentTime: "",
                reason: ""

            });


            // ==========================================================
            // REFRESH LIST
            // ==========================================================

            if (refreshAppointments) {

                refreshAppointments();

            }

        } catch (error) {

            console.error(
                "Error creating appointment:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            setError(

                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to create appointment."

            );

        } finally {

            setSubmitting(false);

        }

    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="bg-white rounded-xl shadow p-6 mt-6">

                <p className="text-gray-500">
                    Loading patients and doctors...
                </p>

            </div>

        );

    }


    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-6">
                Create Appointment
            </h2>


            {/* ==========================================================
                ERROR
            ========================================================== */}

            {error && (

                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">

                    {error}

                </div>

            )}


            {/* ==========================================================
                SUCCESS
            ========================================================== */}

            {success && (

                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">

                    {success}

                </div>

            )}


            <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    {/* PATIENT */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Select Patient
                        </label>

                        <select
                            name="patientId"
                            value={appointmentData.patientId}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        >

                            <option value="">
                                Select a patient
                            </option>

                            {patients.map((patient) => (

                                <option
                                    key={patient.id}
                                    value={patient.id}
                                >
                                    {patient.patient_name}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* DOCTOR */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Select Doctor
                        </label>

                        <select
                            name="doctorId"
                            value={appointmentData.doctorId}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        >

                            <option value="">
                                Select a doctor
                            </option>

                            {doctors.map((doctor) => (

                                <option
                                    key={doctor.id}
                                    value={doctor.id}
                                >

                                    {doctor.doctor_name}

                                    {doctor.specialization
                                        ? ` - ${doctor.specialization}`
                                        : ""
                                    }

                                </option>

                            ))}

                        </select>

                    </div>


                    {/* DATE */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Appointment Date
                        </label>

                        <input
                            type="date"
                            name="appointmentDate"
                            value={appointmentData.appointmentDate}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>


                    {/* TIME */}

                    <div>

                        <label className="block mb-2 font-medium">
                            Appointment Time
                        </label>

                        <input
                            type="time"
                            name="appointmentTime"
                            value={appointmentData.appointmentTime}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>


                    {/* REASON */}

                    <div className="md:col-span-2">

                        <label className="block mb-2 font-medium">
                            Reason for Appointment
                        </label>

                        <textarea
                            name="reason"
                            value={appointmentData.reason}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter reason for appointment"
                            className="w-full border rounded-lg p-3"
                        />

                    </div>

                </div>


                {/* BUTTON */}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >

                    {submitting
                        ? "Creating Appointment..."
                        : "Create Appointment"
                    }

                </button>

            </form>

        </div>

    );

}

export default AddAppointmentForm;