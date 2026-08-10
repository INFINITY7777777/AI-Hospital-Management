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
        status: "Scheduled"

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
    // LOAD APPOINTMENT + PATIENTS + DOCTORS
    // ==========================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);
                setError("");


                // ==================================================
                // GET JWT TOKEN
                // ==================================================

                const token = localStorage.getItem("token");


                // ==================================================
                // CHECK LOGIN
                // ==================================================

                if (!token) {

                    navigate("/");

                    return;

                }


                // ==================================================
                // AUTHORIZATION HEADER
                // ==================================================

                const config = {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                };


                // ==================================================
                // FETCH ALL REQUIRED DATA
                // ==================================================

                const [
                    appointmentResponse,
                    patientsResponse,
                    doctorsResponse
                ] = await Promise.all([

                    axios.get(
                        `http://localhost:5000/api/appointments/${id}`,
                        config
                    ),

                    axios.get(
                        "http://localhost:5000/api/patients",
                        config
                    ),

                    axios.get(
                        "http://localhost:5000/api/doctors",
                        config
                    )

                ]);


                // ==================================================
                // GET APPOINTMENT
                // ==================================================

                const appointment =
                    appointmentResponse.data.appointment;


                // ==================================================
                // CHECK APPOINTMENT
                // ==================================================

                if (!appointment) {

                    setError("Appointment not found.");

                    return;

                }


                // ==================================================
                // STORE PATIENTS
                // ==================================================

                setPatients(

                    patientsResponse.data.patients || []

                );


                // ==================================================
                // STORE DOCTORS
                // ==================================================

                setDoctors(

                    doctorsResponse.data.doctors || []

                );


                // ==================================================
                // SET EXISTING APPOINTMENT DATA
                // ==================================================

                setFormData({

                    patientId:
                        appointment.patient_id || "",

                    doctorId:
                        appointment.doctor_id || "",

                    appointmentDate:
                        appointment.appointment_date || "",

                    appointmentTime:
                        appointment.appointment_time
                            ? appointment.appointment_time.substring(0, 5)
                            : "",

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


                // ==================================================
                // UNAUTHORIZED
                // ==================================================

                if (error.response?.status === 401) {

                    localStorage.removeItem("token");

                    navigate("/");

                    return;

                }


                // ==================================================
                // FORBIDDEN
                // ==================================================

                if (error.response?.status === 403) {

                    setError(
                        "You do not have permission to edit this appointment."
                    );

                    return;

                }


                // ==================================================
                // GENERAL ERROR
                // ==================================================

                setError(

                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Failed to load appointment."

                );

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, [id, navigate]);


    // ==========================================================
    // HANDLE INPUT CHANGE
    // ==========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };


    // ==========================================================
    // HANDLE FORM SUBMIT
    // ==========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ==========================================================
        // RESET ERROR
        // ==========================================================

        setError("");


        // ==========================================================
        // START SUBMITTING
        // ==========================================================

        setSubmitting(true);


        try {

            // ==========================================================
            // GET JWT TOKEN
            // ==========================================================

            const token = localStorage.getItem("token");


            // ==========================================================
            // CHECK LOGIN
            // ==========================================================

            if (!token) {

                navigate("/");

                return;

            }


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

                },

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            // ==========================================================
            // SUCCESS
            // ==========================================================

            alert(
                "Appointment updated successfully!"
            );


            // ==========================================================
            // GO BACK TO DETAILS
            // ==========================================================

            navigate(
                `/appointments/${id}`
            );

        } catch (error) {

            console.error(
                "Error updating appointment:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            console.error(
                "Status:",
                error.response?.status
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
            // FORBIDDEN
            // ==========================================================

            if (error.response?.status === 403) {

                setError(
                    "You do not have permission to update this appointment."
                );

                return;

            }


            // ==========================================================
            // GENERAL ERROR
            // ==========================================================

            setError(

                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to update appointment."

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

                <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg">

                    {error}

                </div>


                <button

                    onClick={() =>
                        navigate(`/appointments/${id}`)
                    }

                    className="mt-4 px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"

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


                        {/* ==================================================
                            PATIENT
                        ================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Patient

                            </label>


                            <select

                                name="patientId"

                                value={formData.patientId}

                                onChange={handleChange}

                                required

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

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


                        {/* ==================================================
                            DOCTOR
                        ================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Doctor

                            </label>


                            <select

                                name="doctorId"

                                value={formData.doctorId}

                                onChange={handleChange}

                                required

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

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


                        {/* ==================================================
                            DATE
                        ================================================== */}

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

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />

                        </div>


                        {/* ==================================================
                            TIME
                        ================================================== */}

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

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />

                        </div>


                        {/* ==================================================
                            STATUS
                        ================================================== */}

                        <div>

                            <label className="block mb-2 font-medium">

                                Status

                            </label>


                            <select

                                name="status"

                                value={formData.status}

                                onChange={handleChange}

                                required

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

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


                        {/* ==================================================
                            REASON
                        ================================================== */}

                        <div className="md:col-span-2">

                            <label className="block mb-2 font-medium">

                                Reason

                            </label>


                            <textarea

                                name="reason"

                                value={formData.reason}

                                onChange={handleChange}

                                rows="4"

                                placeholder="Enter reason for appointment"

                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />

                        </div>

                    </div>


                    {/* ==================================================
                        BUTTONS
                    ================================================== */}

                    <div className="flex gap-4 mt-8">


                        {/* UPDATE */}

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


                        {/* CANCEL */}

                        <button

                            type="button"

                            onClick={() =>
                                navigate(`/appointments/${id}`)
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