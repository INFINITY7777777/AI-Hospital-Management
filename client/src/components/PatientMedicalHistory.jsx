// ==========================================================
// PATIENT MEDICAL HISTORY
// Displays admissions, appointments and clinical notes
// belonging to a patient
// ==========================================================

import { useEffect, useState } from "react";


// ==========================================================
// API
// ==========================================================

import api from "../services/api";


// ==========================================================
// COMPONENT
// ==========================================================

function PatientMedicalHistory({ patientId }) {

    // ======================================================
    // HISTORY STATE
    // ======================================================

    const [history, setHistory] = useState({

        admissions: [],
        appointments: [],
        clinicalNotes: []

    });


    // ======================================================
    // LOADING
    // ======================================================

    const [loading, setLoading] = useState(true);


    // ======================================================
    // ERROR
    // ======================================================

    const [error, setError] = useState("");


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (date) => {

        if (!date) {

            return "—";

        }

        return new Date(date).toLocaleDateString(

            "en-IN",

            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }

        );

    };


    // ======================================================
    // FORMAT TIME
    // ======================================================

    const formatTime = (time) => {

        if (!time) {

            return "—";

        }

        return time.substring(0, 5);

    };


    // ======================================================
    // FETCH MEDICAL HISTORY
    // ======================================================

    useEffect(() => {

        if (!patientId) {

            return;

        }


        const fetchMedicalHistory = async () => {

            try {

                setLoading(true);

                setError("");


                // ==================================================
                // API REQUEST
                // ==================================================

                const response = await api.get(

                    `/patient-history/patient/${patientId}`

                );


                // ==================================================
                // SAVE HISTORY
                // ==================================================

                setHistory({

                    admissions:
                        response.data.admissions || [],

                    appointments:
                        response.data.appointments || [],

                    clinicalNotes:
                        response.data.clinicalNotes || []

                });

            }

            catch (error) {

                console.error(

                    "Error fetching medical history:",

                    error

                );


                console.error(

                    "Backend response:",

                    error.response?.data

                );


                // ==================================================
                // ERROR MESSAGE
                // ==================================================

                setError(

                    error.response?.data?.error ||

                    "Failed to load medical history."

                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchMedicalHistory();

    }, [patientId]);


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">

                <div className="animate-pulse">

                    <div className="h-6 bg-gray-200 rounded w-52 mb-6"></div>

                    <div className="space-y-4">

                        <div className="h-24 bg-gray-100 rounded-lg"></div>

                        <div className="h-24 bg-gray-100 rounded-lg"></div>

                        <div className="h-24 bg-gray-100 rounded-lg"></div>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // ERROR
    // ==========================================================

    if (error) {

        return (

            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 mt-8">

                <h2 className="text-xl font-bold text-gray-900 mb-2">

                    Medical History

                </h2>

                <p className="text-red-600">

                    {error}

                </p>

            </div>

        );

    }


    // ==========================================================
    // MAIN UI
    // ==========================================================

    return (

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-8">

                <p className="text-sm text-blue-600 font-medium">

                    PATIENT RECORD

                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">

                    Medical History

                </h2>

                <p className="text-gray-500 mt-1">

                    Previous admissions, appointments and clinical notes

                </p>

            </div>


            {/* ==================================================
                ADMISSIONS
            ================================================== */}

            <section className="mb-10">

                <div className="flex items-center justify-between mb-5">

                    <h3 className="text-lg font-bold text-gray-900">

                        Admissions

                    </h3>

                    <span className="text-sm text-gray-500">

                        {history.admissions.length} record
                        {history.admissions.length !== 1 ? "s" : ""}

                    </span>

                </div>


                {history.admissions.length === 0 ? (

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

                        <p className="text-gray-500">

                            No admission history found.

                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {history.admissions.map((admission) => (

                            <div
                                key={admission.id}
                                className="border border-gray-200 rounded-xl p-5"
                            >

                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                    <div>

                                        <p className="text-sm text-gray-500">

                                            Admission Date

                                        </p>

                                        <p className="font-bold text-gray-900">

                                            {formatDate(
                                                admission.admission_date
                                            )}

                                        </p>

                                    </div>


                                    <span className="inline-flex w-fit px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">

                                        {admission.status || "Unknown"}

                                    </span>

                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                                    <div>

                                        <p className="text-sm text-gray-500 mb-1">

                                            Admission Reason

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {admission.admission_reason || "—"}

                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-sm text-gray-500 mb-1">

                                            Diagnosis

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {admission.diagnosis || "—"}

                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-sm text-gray-500 mb-1">

                                            Bed ID

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {admission.bed_id ?? "—"}

                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-sm text-gray-500 mb-1">

                                            Discharge Date

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {formatDate(
                                                admission.discharge_date
                                            )}

                                        </p>

                                    </div>

                                </div>


                                {admission.discharge_reason && (

                                    <div className="mt-5 pt-5 border-t">

                                        <p className="text-sm text-gray-500 mb-1">

                                            Discharge Reason

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {admission.discharge_reason}

                                        </p>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* ==================================================
                APPOINTMENTS
            ================================================== */}

            <section className="border-t pt-8 mb-10">

                <div className="flex items-center justify-between mb-5">

                    <h3 className="text-lg font-bold text-gray-900">

                        Appointments

                    </h3>

                    <span className="text-sm text-gray-500">

                        {history.appointments.length} record
                        {history.appointments.length !== 1 ? "s" : ""}

                    </span>

                </div>


                {history.appointments.length === 0 ? (

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

                        <p className="text-gray-500">

                            No appointment history found.

                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {history.appointments.map((appointment) => (

                            <div
                                key={appointment.id}
                                className="border border-gray-200 rounded-xl p-5"
                            >

                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                    <div>

                                        <p className="text-sm text-gray-500">

                                            Appointment

                                        </p>

                                        <p className="font-bold text-gray-900">

                                            {formatDate(
                                                appointment.appointment_date
                                            )}

                                            {" • "}

                                            {formatTime(
                                                appointment.appointment_time
                                            )}

                                        </p>

                                    </div>


                                    <span className="inline-flex w-fit px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">

                                        {appointment.status || "Unknown"}

                                    </span>

                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                                    <div>

                                        <p className="text-sm text-gray-500 mb-1">

                                            Doctor ID

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {appointment.doctor_id ?? "—"}

                                        </p>

                                    </div>


                                    <div>

                                        <p className="text-sm text-gray-500 mb-1">

                                            Reason

                                        </p>

                                        <p className="font-semibold text-gray-900">

                                            {appointment.reason || "—"}

                                        </p>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* ==================================================
                CLINICAL NOTES
            ================================================== */}

            <section className="border-t pt-8">

                <div className="flex items-center justify-between mb-5">

                    <h3 className="text-lg font-bold text-gray-900">

                        Clinical Notes

                    </h3>

                    <span className="text-sm text-gray-500">

                        {history.clinicalNotes.length} record
                        {history.clinicalNotes.length !== 1 ? "s" : ""}

                    </span>

                </div>


                {history.clinicalNotes.length === 0 ? (

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

                        <p className="text-gray-500">

                            No clinical notes found.

                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {history.clinicalNotes.map((note) => (

                            <div
                                key={note.id}
                                className="border border-gray-200 rounded-xl p-5"
                            >

                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                                    <div>

                                        <p className="text-sm text-blue-600 font-medium">

                                            {note.note_type || "General"}

                                        </p>

                                        <h4 className="text-lg font-bold text-gray-900">

                                            {note.title || "Clinical Note"}

                                        </h4>

                                    </div>


                                    <p className="text-sm text-gray-500">

                                        {formatDate(note.created_at)}

                                    </p>

                                </div>


                                <div className="mt-4">

                                    <p className="text-gray-700 whitespace-pre-wrap">

                                        {note.content}

                                    </p>

                                </div>


                                <div className="mt-5 pt-4 border-t">

                                    <p className="text-sm text-gray-500">

                                        Written by{" "}

                                        <span className="font-semibold text-gray-700">

                                            {note.author_name || "Unknown"}

                                        </span>

                                        {" • "}

                                        {note.author_role || "Unknown role"}

                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default PatientMedicalHistory;