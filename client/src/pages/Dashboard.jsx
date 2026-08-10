// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// AXIOS
// ==========================================================

import axios from "axios";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";

// ==========================================================
// COMPONENTS
// ==========================================================

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

// ==========================================================
// DASHBOARD COMPONENT
// ==========================================================

function Dashboard() {

    // ==========================================================
    // NAVIGATION
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // DASHBOARD STATISTICS
    // ==========================================================

    const [statistics, setStatistics] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        totalAdmissions: 0,
        activeAdmissions: 0,
        occupiedBeds: 0,
        availableBeds: 0
    });


    // ==========================================================
    // TODAY'S APPOINTMENTS
    // ==========================================================

    const [todayAppointments, setTodayAppointments] = useState([]);


    // ==========================================================
    // UPCOMING APPOINTMENTS
    // ==========================================================

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);


    // ==========================================================
    // LOADING
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // FETCH DASHBOARD DATA
    // ==========================================================

    useEffect(() => {

        // ------------------------------------------------------
        // GET JWT TOKEN
        // ------------------------------------------------------

        const token = localStorage.getItem("token");


        // ------------------------------------------------------
        // IF USER IS NOT LOGGED IN
        // ------------------------------------------------------

        if (!token) {

            navigate("/");

            return;

        }


        // ------------------------------------------------------
        // AXIOS CONFIGURATION
        // ------------------------------------------------------

        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };


        // ------------------------------------------------------
        // FETCH DATA
        // ------------------------------------------------------

        const fetchDashboardData = async () => {

            try {

                setLoading(true);
                setError("");


                // ==================================================
                // 1. DASHBOARD STATISTICS
                // ==================================================

                const statisticsResponse = await axios.get(
                    "http://localhost:5000/api/dashboard/stats",
                    axiosConfig
                );


                console.log(
                    "Dashboard statistics:",
                    statisticsResponse.data
                );


                setStatistics(
                    statisticsResponse.data.statistics || {
                        totalPatients: 0,
                        totalDoctors: 0,
                        totalAppointments: 0,
                        todayAppointments: 0,
                        upcomingAppointments: 0,
                        totalAdmissions: 0,
                        activeAdmissions: 0,
                        occupiedBeds: 0,
                        availableBeds: 0
                    }
                );


                // ==================================================
                // 2. TODAY'S APPOINTMENTS
                // ==================================================

                const todayResponse = await axios.get(
                    "http://localhost:5000/api/dashboard/today-appointments",
                    axiosConfig
                );


                console.log(
                    "Today's appointments:",
                    todayResponse.data
                );


                setTodayAppointments(
                    todayResponse.data.appointments || []
                );


                // ==================================================
                // 3. UPCOMING APPOINTMENTS
                // ==================================================

                const upcomingResponse = await axios.get(
                    "http://localhost:5000/api/dashboard/upcoming-appointments",
                    axiosConfig
                );


                console.log(
                    "Upcoming appointments:",
                    upcomingResponse.data
                );


                setUpcomingAppointments(
                    upcomingResponse.data.appointments || []
                );

            }

            catch (error) {

                console.error(
                    "Dashboard API error:",
                    error
                );


                // ==================================================
                // AUTHENTICATION ERROR
                // ==================================================

                if (error.response?.status === 401) {

                    localStorage.removeItem("token");

                    navigate("/");

                    return;

                }


                // ==================================================
                // PERMISSION ERROR
                // ==================================================

                if (error.response?.status === 403) {

                    setError(
                        error.response?.data?.error ||
                        error.response?.data?.message ||
                        "You do not have permission to access the dashboard."
                    );

                    return;

                }


                // ==================================================
                // OTHER SERVER ERROR
                // ==================================================

                setError(
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Failed to load dashboard data."
                );

            }

            finally {

                setLoading(false);

            }

        };


        // ------------------------------------------------------
        // RUN API REQUEST
        // ------------------------------------------------------

        fetchDashboardData();

    }, [navigate]);


    // ==========================================================
    // FORMAT DATE
    // ==========================================================

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


    // ==========================================================
    // FORMAT STATUS
    // ==========================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Confirmed":
                return "bg-green-100 text-green-700";

            case "Completed":
                return "bg-blue-100 text-blue-700";

            case "Cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-yellow-100 text-yellow-700";

        }

    };


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-50">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <main className="flex-1 p-6 md:p-8">

                        <div className="animate-pulse">

                            <div className="h-8 bg-gray-200 rounded w-64 mb-3"></div>

                            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>


                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                                {[1, 2, 3, 4].map((item) => (

                                    <div
                                        key={item}
                                        className="h-32 bg-white rounded-2xl border border-gray-100"
                                    ></div>

                                ))}

                            </div>

                        </div>

                    </main>

                </div>

            </div>

        );

    }


    // ==========================================================
    // MAIN DASHBOARD
    // ==========================================================

    return (

        <div className="min-h-screen bg-gray-50">

            {/* ==================================================
                NAVBAR
            ================================================== */}

            <Navbar />


            <div className="flex">


                {/* ==================================================
                    SIDEBAR
                ================================================== */}

                <Sidebar />


                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <main className="flex-1 p-6 md:p-8">


                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                        <div>

                            <p className="text-sm font-medium text-blue-600 mb-1">

                                Hospital Management System

                            </p>

                            <h1 className="text-3xl font-bold text-gray-900">

                                Dashboard

                            </h1>

                            <p className="text-gray-500 mt-1">

                                Overview of hospital activities and operations

                            </p>

                        </div>


                        {/* ==================================================
                            NEW APPOINTMENT
                        ================================================== */}

                        <button
                            onClick={() => navigate("/appointments/add")}
                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-5
                                py-3
                                rounded-xl
                                font-medium
                                transition
                                shadow-sm
                            "
                        >

                            + New Appointment

                        </button>

                    </div>


                    {/* ==================================================
                        ERROR MESSAGE
                    ================================================== */}

                    {error && (

                        <div className="
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                            p-4
                            rounded-xl
                            mb-6
                        ">

                            {error}

                        </div>

                    )}


                    {/* ==================================================
                        PRIMARY STATISTICS
                    ================================================== */}

                    <div className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-4
                        gap-5
                        mb-6
                    ">


                        {/* ==================================================
                            PATIENTS
                        ================================================== */}

                        <DashboardCard
                            title="Total Patients"
                            value={statistics.totalPatients}
                            subtitle="Registered patients"

                            icon={

                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-8a4 4 0 110 8 4 4 0 010-8zm5 4a3 3 0 100-6"
                                    />

                                </svg>

                            }

                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"

                            onClick={() => navigate("/patients")}
                        />


                        {/* ==================================================
                            DOCTORS
                        ================================================== */}

                        <DashboardCard
                            title="Total Doctors"
                            value={statistics.totalDoctors}
                            subtitle="Medical professionals"

                            icon={

                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5.121 17.804A9 9 0 1118.879 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />

                                </svg>

                            }

                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"

                            onClick={() => navigate("/doctors")}
                        />


                        {/* ==================================================
                            APPOINTMENTS
                        ================================================== */}

                        <DashboardCard
                            title="Appointments"
                            value={statistics.totalAppointments}
                            subtitle={`${statistics.todayAppointments} scheduled today`}

                            icon={

                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />

                                </svg>

                            }

                            iconBg="bg-green-100"
                            iconColor="text-green-600"

                            onClick={() => navigate("/appointments")}
                        />


                        {/* ==================================================
                            ACTIVE ADMISSIONS
                        ================================================== */}

                        <DashboardCard
                            title="Active Admissions"
                            value={statistics.activeAdmissions}
                            subtitle={`${statistics.totalAdmissions} total admissions`}

                            icon={

                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 14c1.49-1.49 2-3.5 2-5a7 7 0 10-14 0c0 1.5.51 3.51 2 5l-1 5h12l-1-5z"
                                    />

                                </svg>

                            }

                            iconBg="bg-orange-100"
                            iconColor="text-orange-600"

                            onClick={() => navigate("/admissions")}
                        />

                    </div>


                    {/* ==================================================
                        HOSPITAL STATUS
                    ================================================== */}

                    <div className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-4
                        gap-5
                        mb-8
                    ">


                        {/* OCCUPIED BEDS */}

                        <DashboardCard
                            title="Occupied Beds"
                            value={statistics.occupiedBeds}
                            subtitle="Currently occupied"

                            icon={
                                <span className="text-2xl">
                                    🛏️
                                </span>
                            }

                            iconBg="bg-red-100"
                            iconColor="text-red-600"

                            onClick={() => navigate("/beds")}
                        />


                        {/* AVAILABLE BEDS */}

                        <DashboardCard
                            title="Available Beds"
                            value={statistics.availableBeds}
                            subtitle="Ready for admission"

                            icon={
                                <span className="text-2xl">
                                    ➕
                                </span>
                            }

                            iconBg="bg-emerald-100"
                            iconColor="text-emerald-600"

                            onClick={() => navigate("/beds")}
                        />


                        {/* TODAY */}

                        <DashboardCard
                            title="Today's Appointments"
                            value={statistics.todayAppointments}
                            subtitle="Appointments scheduled today"

                            icon={
                                <span className="text-2xl">
                                    ⏰
                                </span>
                            }

                            iconBg="bg-cyan-100"
                            iconColor="text-cyan-600"

                            onClick={() => navigate("/appointments")}
                        />


                        {/* UPCOMING */}

                        <DashboardCard
                            title="Upcoming"
                            value={statistics.upcomingAppointments}
                            subtitle="Future appointments"

                            icon={
                                <span className="text-2xl">
                                    ⚡
                                </span>
                            }

                            iconBg="bg-indigo-100"
                            iconColor="text-indigo-600"

                            onClick={() => navigate("/appointments")}
                        />

                    </div>


                    {/* ==================================================
                        TODAY'S APPOINTMENTS
                    ================================================== */}

                    <section className="
                        bg-white
                        rounded-2xl
                        border
                        border-gray-100
                        shadow-sm
                        mb-8
                        overflow-hidden
                    ">

                        <div className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                            p-6
                            border-b
                        ">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">

                                    Today's Appointments

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    Patients scheduled for today

                                </p>

                            </div>


                            <button
                                onClick={() => navigate("/appointments")}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >

                                View All →

                            </button>

                        </div>


                        {todayAppointments.length === 0 ? (

                            <div className="p-10 text-center">

                                <div className="text-4xl mb-3">
                                    📅
                                </div>

                                <p className="text-gray-500">

                                    No appointments scheduled for today.

                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="bg-gray-50 text-gray-500 text-sm">

                                            <th className="text-left p-4 font-medium">
                                                Patient
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Doctor
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Specialization
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Time
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Reason
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {todayAppointments.map((appointment) => (

                                            <tr
                                                key={appointment.id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="p-4">

                                                    <div className="font-medium text-gray-900">

                                                        {appointment.patient_name || "—"}

                                                    </div>

                                                </td>


                                                <td className="p-4 text-gray-700">

                                                    {appointment.doctor_name || "—"}

                                                </td>


                                                <td className="p-4 text-gray-600">

                                                    {appointment.specialization || "—"}

                                                </td>


                                                <td className="p-4 text-gray-700">

                                                    {appointment.appointment_time || "—"}

                                                </td>


                                                <td className="p-4 text-gray-600">

                                                    {appointment.reason || "N/A"}

                                                </td>


                                                <td className="p-4">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            text-xs
                                                            font-semibold
                                                            ${getStatusClass(
                                                                appointment.status
                                                            )}
                                                        `}
                                                    >

                                                        {appointment.status || "Pending"}

                                                    </span>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>


                    {/* ==================================================
                        UPCOMING APPOINTMENTS
                    ================================================== */}

                    <section className="
                        bg-white
                        rounded-2xl
                        border
                        border-gray-100
                        shadow-sm
                        mb-8
                        overflow-hidden
                    ">

                        <div className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                            p-6
                            border-b
                        ">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">

                                    Upcoming Appointments

                                </h2>

                                <p className="text-sm text-gray-500 mt-1">

                                    Next scheduled appointments

                                </p>

                            </div>


                            <button
                                onClick={() => navigate("/appointments")}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >

                                View All →

                            </button>

                        </div>


                        {upcomingAppointments.length === 0 ? (

                            <div className="p-10 text-center">

                                <div className="text-4xl mb-3">
                                    📆
                                </div>

                                <p className="text-gray-500">

                                    No upcoming appointments scheduled.

                                </p>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="bg-gray-50 text-gray-500 text-sm">

                                            <th className="text-left p-4 font-medium">
                                                Patient
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Doctor
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Specialization
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Date
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Time
                                            </th>

                                            <th className="text-left p-4 font-medium">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {upcomingAppointments.map((appointment) => (

                                            <tr
                                                key={appointment.id}
                                                className="border-t hover:bg-gray-50 transition"
                                            >

                                                <td className="p-4">

                                                    <span className="font-medium text-gray-900">

                                                        {appointment.patient_name || "—"}

                                                    </span>

                                                </td>


                                                <td className="p-4 text-gray-700">

                                                    {appointment.doctor_name || "—"}

                                                </td>


                                                <td className="p-4 text-gray-600">

                                                    {appointment.specialization || "—"}

                                                </td>


                                                <td className="p-4 text-gray-700">

                                                    {formatDate(
                                                        appointment.appointment_date
                                                    )}

                                                </td>


                                                <td className="p-4 text-gray-700">

                                                    {appointment.appointment_time || "—"}

                                                </td>


                                                <td className="p-4">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            text-xs
                                                            font-semibold
                                                            ${getStatusClass(
                                                                appointment.status
                                                            )}
                                                        `}
                                                    >

                                                        {appointment.status || "Pending"}

                                                    </span>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>


                    {/* ==================================================
                        QUICK ACTIONS
                    ================================================== */}

                    <section>

                        <div className="mb-4">

                            <h2 className="text-xl font-bold text-gray-900">

                                Quick Actions

                            </h2>

                            <p className="text-sm text-gray-500">

                                Quickly access common hospital operations

                            </p>

                        </div>


                        <div className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-4
                            gap-4
                        ">


                            {/* ==================================================
                                ADD PATIENT
                            ================================================== */}

                            <button
                                onClick={() => navigate("/patients/add")}
                                className="
                                    bg-white
                                    border
                                    border-gray-100
                                    rounded-2xl
                                    p-5
                                    text-left
                                    shadow-sm
                                    hover:shadow-md
                                    hover:-translate-y-1
                                    transition
                                "
                            >

                                <div className="text-2xl mb-3">
                                    👤
                                </div>

                                <h3 className="font-semibold text-gray-900">

                                    Add Patient

                                </h3>

                                <p className="text-sm text-gray-500 mt-1">

                                    Register a new patient

                                </p>

                            </button>


                            {/* ==================================================
                                ADD DOCTOR
                            ================================================== */}

                            <button
                                onClick={() => navigate("/doctors/add")}
                                className="
                                    bg-white
                                    border
                                    border-gray-100
                                    rounded-2xl
                                    p-5
                                    text-left
                                    shadow-sm
                                    hover:shadow-md
                                    hover:-translate-y-1
                                    transition
                                "
                            >

                                <div className="text-2xl mb-3">
                                    🩺
                                </div>

                                <h3 className="font-semibold text-gray-900">

                                    Add Doctor

                                </h3>

                                <p className="text-sm text-gray-500 mt-1">

                                    Register a doctor

                                </p>

                            </button>


                            {/* ==================================================
                                BOOK APPOINTMENT
                            ================================================== */}

                            <button
                                onClick={() => navigate("/appointments/add")}
                                className="
                                    bg-white
                                    border
                                    border-gray-100
                                    rounded-2xl
                                    p-5
                                    text-left
                                    shadow-sm
                                    hover:shadow-md
                                    hover:-translate-y-1
                                    transition
                                "
                            >

                                <div className="text-2xl mb-3">
                                    📅
                                </div>

                                <h3 className="font-semibold text-gray-900">

                                    Book Appointment

                                </h3>

                                <p className="text-sm text-gray-500 mt-1">

                                    Schedule a patient visit

                                </p>

                            </button>


                            {/* ==================================================
                                ADD ADMISSION
                            ================================================== */}

                            <button
                                onClick={() => navigate("/admissions/add")}
                                className="
                                    bg-white
                                    border
                                    border-gray-100
                                    rounded-2xl
                                    p-5
                                    text-left
                                    shadow-sm
                                    hover:shadow-md
                                    hover:-translate-y-1
                                    transition
                                "
                            >

                                <div className="text-2xl mb-3">
                                    🏥
                                </div>

                                <h3 className="font-semibold text-gray-900">

                                    Add Admission

                                </h3>

                                <p className="text-sm text-gray-500 mt-1">

                                    Admit a patient

                                </p>

                            </button>

                        </div>

                    </section>

                </main>

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT
// ==========================================================

export default Dashboard;