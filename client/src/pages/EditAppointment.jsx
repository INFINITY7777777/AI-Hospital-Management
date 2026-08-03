import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditAppointment() {

    // ==========================================================
    // GET APPOINTMENT ID FROM URL
    // ==========================================================

    const { id } = useParams();


    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // PATIENTS STATE
    // ==========================================================

    const [patients, setPatients] = useState([]);


    // ==========================================================
    // DOCTORS STATE
    // ==========================================================

    const [doctors, setDoctors] = useState([]);


    // ==========================================================
    // FORM STATE
    // ==========================================================

    const [formData, setFormData] = useState({

        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        status: ""

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
    // FETCH APPOINTMENT, PATIENTS AND DOCTORS
    // ==========================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                const [
                    appointmentResponse,
                    patientsResponse,
                    doctorsResponse
                ] = await Promise.all([

                    axios.get(
                        `http://localhost:5000/api/appointments/${id}`
                    ),

                    axios.get(
                        "http://localhost:5000/api/patients"
                    ),

                    axios.get(
                        "http://localhost:5000/api/doctors"
                    )

                ]);


                // ==========================================================
                // GET APPOINTMENT
                // ==========================================================

                const appointment =
                    appointmentResponse.data.appointment;


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


                // ==========================================================
                // SET FORM DATA
                // ==========================================================

                setFormData({

                    patientId:
                        appointment.patient_id,

                    doctorId:
                        appointment.doctor_id,

                    appointmentDate:
                        appointment.appointment_date,

                    appointmentTime:
                        appointment.appointment_time,

                    reason:
                        appointment.reason || "",

                    status:
                        appointment.status || "Scheduled"

                });

            } catch (error) {

                console.error(
                    "Error loading appointment:",
                    error
                );


                setError(

                    error.response?.data?.error ||
                    "Failed to load appointment"

                );

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, [id]);


    // ==========================================================
    // HANDLE INPUT CHANGE
    // ==========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData(
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


        setError("");

        setSubmitting(true);


        try {

            // ==========================================================
            // UPDATE APPOINTMENT
            // ==========================================================

            await axios.put(

                `http://localhost:5000/api/appointments/${id}`,

                {

                    patientId:
                        Number(formData.patientId),

                    doctorId:
                        Number(formData.doctorId),

                    appointmentDate:
                        formData.appointmentDate,

                    appointmentTime:
                        formData.appointmentTime,

                    reason:
                        formData.reason,

                    status:
                        formData.status

                }

            );


            // ==========================================================
            // GO BACK TO APPOINTMENT DETAILS
            // ==========================================================

            navigate(
                `/appointments/${id}`
            );

        } catch (error) {

            console.error(
                "FULL UPDATE ERROR:",
                error
            );

            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            setError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to update appointment"
            );

        } finally {

            setSubmitting(false);

        }

    };


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="p-6">

                <p className="text-gray-500">

                    Loading appointment...

                </p>

            </div>

        );

    }


    // ==========================================================
    // ERROR SCREEN
    // ==========================================================

    if (error) {

        return (

            <div className="p-6">

                <div className="bg-red-100 text-red-700 p-4 rounded-lg">

                    {error}

                </div>


                <button
                    onClick={() =>
                        navigate(`/appointments/${id}`)
                    }
                    className="mt-4 px-5 py-2 bg-gray-200 rounded-lg"
                >

                    Back to Appointment

                </button>

            </div>

        );

    }


    // ==========================================================
    // EDIT APPOINTMENT FORM
    // ==========================================================

    return (

        <div className="p-6">


            {/* ==========================================================
                PAGE TITLE
            ========================================================== */}

            <h1 className="text-3xl font-bold mb-6">

                Edit Appointment

            </h1>


            {/* ==========================================================
                FORM CARD
            ========================================================== */}

            <div className="bg-white rounded-xl shadow p-6">


                <form onSubmit={handleSubmit}>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        {/* ==========================================================
                            PATIENT
                        ========================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Patient

                            </label>


                            <select
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-3"
                            >

                                <option value="">

                                    Select patient

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

                                Doctor

                            </label>


                            <select
                                name="doctorId"
                                value={formData.doctorId}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-3"
                            >

                                <option value="">

                                    Select doctor

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
                            DATE
                        ========================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Appointment Date

                            </label>


                            <input
                                type="date"
                                name="appointmentDate"
                                value={
                                    formData.appointmentDate
                                }
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        {/* ==========================================================
                            TIME
                        ========================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Appointment Time

                            </label>


                            <input
                                type="time"
                                name="appointmentTime"
                                value={
                                    formData.appointmentTime
                                }
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-3"
                            />

                        </div>


                        {/* ==========================================================
                            STATUS
                        ========================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Status

                            </label>


                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-3"
                            >

                                <option value="Scheduled">
                                    Scheduled
                                </option>

                                <option value="Confirmed">
                                    Confirmed
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </div>


                        {/* ==========================================================
                            REASON
                        ========================================================== */}

                        <div className="md:col-span-2">

                            <label className="block mb-2 font-medium">

                                Reason

                            </label>


                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                className="w-full border rounded-lg p-3"
                            />

                        </div>

                    </div>


                    {/* ==========================================================
                        BUTTONS
                    ========================================================== */}

                    <div className="flex gap-4 mt-6">


                        {/* UPDATE BUTTON */}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >

                            {submitting
                                ? "Updating..."
                                : "Update Appointment"
                            }

                        </button>


                        {/* CANCEL BUTTON */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/appointments/${id}`
                                )
                            }
                            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >

                            Cancel

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default EditAppointment;