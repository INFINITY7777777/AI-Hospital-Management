import { useEffect, useState } from "react";
import axios from "axios";

function AddAppointmentForm({ refreshAppointments }) {

    // ==========================================================
    // PATIENT STATE
    // Stores all patients
    // ==========================================================

    const [patients, setPatients] = useState([]);


    // ==========================================================
    // DOCTOR STATE
    // Stores all doctors
    // ==========================================================

    const [doctors, setDoctors] = useState([]);


    // ==========================================================
    // FORM STATE
    // Stores appointment form data
    // ==========================================================

    const [appointmentData, setAppointmentData] = useState({

        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""

    });


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // SUBMITTING STATE
    // ==========================================================

    const [submitting, setSubmitting] = useState(false);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // SUCCESS STATE
    // ==========================================================

    const [success, setSuccess] = useState("");


    // ==========================================================
    // FETCH PATIENTS AND DOCTORS
    // ==========================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                const [
                    patientsResponse,
                    doctorsResponse
                ] = await Promise.all([

                    axios.get(
                        "http://localhost:5000/api/patients"
                    ),

                    axios.get(
                        "http://localhost:5000/api/doctors"
                    )

                ]);


                // ==========================================================
                // STORE PATIENTS
                // ==========================================================

                setPatients(
                    patientsResponse.data.patients
                );


                // ==========================================================
                // STORE DOCTORS
                // ==========================================================

                setDoctors(
                    doctorsResponse.data.doctors
                );

            } catch (error) {

                console.error(
                    "Error loading patients and doctors:",
                    error
                );

                setError(
                    "Failed to load patients or doctors."
                );

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, []);


    // ==========================================================
    // HANDLE INPUT CHANGE
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
    // HANDLE FORM SUBMIT
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ==========================================================
        // RESET MESSAGES
        // ==========================================================

        setError("");

        setSuccess("");


        // ==========================================================
        // START SUBMITTING
        // ==========================================================

        setSubmitting(true);


        try {

            // ==========================================================
            // SEND APPOINTMENT TO BACKEND
            // ==========================================================

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
                }
            );


            // ==========================================================
            // SUCCESS MESSAGE
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
            // REFRESH APPOINTMENT LIST
            // ==========================================================

            if (refreshAppointments) {

                refreshAppointments();

            }

        } catch (error) {

            console.error(
                "Error creating appointment:",
                error
            );


            // ==========================================================
            // ERROR MESSAGE
            // ==========================================================

            setError(

                error.response?.data?.error ||
                "Failed to create appointment."

            );

        } finally {

            // ==========================================================
            // STOP SUBMITTING
            // ==========================================================

            setSubmitting(false);

        }

    };


    // ==========================================================
    // LOADING SCREEN
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


    // ==========================================================
    // APPOINTMENT FORM
    // ==========================================================

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-6">

            <h2 className="text-2xl font-bold mb-6">

                Create Appointment

            </h2>


            {/* ==========================================================
                ERROR MESSAGE
            ========================================================== */}

            {error && (

                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">

                    {error}

                </div>

            )}


            {/* ==========================================================
                SUCCESS MESSAGE
            ========================================================== */}

            {success && (

                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">

                    {success}

                </div>

            )}


            {/* ==========================================================
                FORM
            ========================================================== */}

            <form onSubmit={handleSubmit}>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    {/* ==========================================================
                        PATIENT
                    ========================================================== */}

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


                    {/* ==========================================================
                        DOCTOR
                    ========================================================== */}

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


                    {/* ==========================================================
                        APPOINTMENT DATE
                    ========================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Appointment Date

                        </label>


                        <input
                            type="date"
                            name="appointmentDate"
                            value={
                                appointmentData.appointmentDate
                            }
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>


                    {/* ==========================================================
                        APPOINTMENT TIME
                    ========================================================== */}

                    <div>

                        <label className="block mb-2 font-medium">

                            Appointment Time

                        </label>


                        <input
                            type="time"
                            name="appointmentTime"
                            value={
                                appointmentData.appointmentTime
                            }
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg p-3"
                        />

                    </div>


                    {/* ==========================================================
                        REASON
                    ========================================================== */}

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


                {/* ==========================================================
                    SUBMIT BUTTON
                ========================================================== */}

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