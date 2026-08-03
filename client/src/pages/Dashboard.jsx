// ==========================================================
// REACT HOOKS
// ==========================================================

import { useEffect, useState } from "react";


// ==========================================================
// AXIOS
// Used to communicate with backend API
// ==========================================================

import axios from "axios";


// ==========================================================
// REACT ROUTER
// Used for page redirection
// ==========================================================

import { useNavigate } from "react-router-dom";


// ==========================================================
// IMPORT NAVBAR
// ==========================================================

import Navbar from "../components/Navbar";


// ==========================================================
// IMPORT SIDEBAR
// ==========================================================

import Sidebar from "../components/Sidebar";


// ==========================================================
// IMPORT DASHBOARD CARD
// ==========================================================

import DashboardCard from "../components/DashboardCard";


// ==========================================================
// DASHBOARD COMPONENT
// ==========================================================

function Dashboard() {


    // ==========================================================
    // NAVIGATION
    // Used to redirect the user
    // ==========================================================

    const navigate = useNavigate();


    // ==========================================================
    // DASHBOARD STATISTICS
    // Stores data received from backend
    // ==========================================================

    const [statistics, setStatistics] = useState({

        totalPatients: 0,

        totalDoctors: 0,

        totalAppointments: 0,

        todayAppointments: 0,

        upcomingAppointments: 0

    });


    // ==========================================================
    // TODAY'S APPOINTMENTS
    // Stores today's appointment list
    // ==========================================================

    const [todayAppointments, setTodayAppointments] = useState([]);

    // ==========================================================
    // UPCOMING APPOINTMENTS
    // ==========================================================

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);


    // ==========================================================
    // LOADING STATE
    // ==========================================================

    const [loading, setLoading] = useState(true);


    // ==========================================================
    // ERROR STATE
    // ==========================================================

    const [error, setError] = useState("");


    // ==========================================================
    // CHECK LOGIN + FETCH DASHBOARD DATA
    // ==========================================================

    useEffect(() => {

        // ==========================================================
        // CHECK IF USER IS LOGGED IN
        // ==========================================================

        const token = localStorage.getItem("token");


        if (!token) {

            navigate("/");

            return;

        }


        // ==========================================================
        // FETCH DASHBOARD DATA
        // ==========================================================

        const fetchDashboardData = async () => {

            try {

                // ==========================================================
                // GET DASHBOARD STATISTICS
                // ==========================================================

                const statisticsResponse = await axios.get(

                    "http://localhost:5000/api/dashboard/stats"

                );


                // ==========================================================
                // STORE DASHBOARD STATISTICS
                // ==========================================================

                setStatistics(

                    statisticsResponse.data.statistics

                );


                // ==========================================================
                // GET TODAY'S APPOINTMENTS
                // ==========================================================

                const todayResponse = await axios.get(

                    "http://localhost:5000/api/dashboard/today-appointments"

                );


                // ==========================================================
                // STORE TODAY'S APPOINTMENTS
                // ==========================================================

                setTodayAppointments(

                    todayResponse.data.appointments

                );

                // ==========================================================
                // GET UPCOMING APPOINTMENTS
                // ==========================================================

                const upcomingResponse = await axios.get(

                "http://localhost:5000/api/dashboard/upcoming-appointments"

                );


                // ==========================================================
                // STORE UPCOMING APPOINTMENTS
                // ==========================================================

                setUpcomingAppointments(

                upcomingResponse.data.appointments

                );

            }


            catch (error) {

                console.error(

                    "Error fetching dashboard data:",

                    error

                );


                setError(

                    error.response?.data?.error ||

                    "Failed to load dashboard data"

                );

            }


            finally {

                setLoading(false);

            }

        };


        // ==========================================================
        // CALL FUNCTION
        // ==========================================================

        fetchDashboardData();


    }, [navigate]);


    // ==========================================================
    // LOADING SCREEN
    // ==========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex">

                    <Sidebar />

                    <div className="flex-1 p-8">

                        <p className="text-gray-500">

                            Loading dashboard...

                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================================
    // DASHBOARD
    // ==========================================================

    return (

        <div className="min-h-screen bg-gray-100">


            {/* ==========================================================
                NAVBAR
            ========================================================== */}

            <Navbar />


            <div className="flex">


                {/* ==========================================================
                    SIDEBAR
                ========================================================== */}

                <Sidebar />


                <div className="flex-1 p-8">


                    {/* ==========================================================
                        PAGE TITLE
                    ========================================================== */}

                    <h1 className="text-3xl font-bold mb-6">

                        Hospital Dashboard

                    </h1>


                    {/* ==========================================================
                        ERROR MESSAGE
                    ========================================================== */}

                    {error && (

                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">

                            {error}

                        </div>

                    )}


                    {/* ==========================================================
                        DASHBOARD CARDS
                    ========================================================== */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">


                        {/* ==========================================================
                            TOTAL DOCTORS
                        ========================================================== */}

                        <DashboardCard

                            title="Doctors"

                            value={

                                statistics.totalDoctors

                            }

                            onClick={() =>

                                navigate("/doctors")

                            }

                        />


                        {/* ==========================================================
                            TOTAL PATIENTS
                        ========================================================== */}

                        <DashboardCard

                            title="Patients"

                            value={

                                statistics.totalPatients

                            }

                            onClick={() =>

                                navigate("/patients")

                            }

                        />


                        {/* ==========================================================
                            TOTAL APPOINTMENTS
                        ========================================================== */}

                        <DashboardCard

                            title="Appointments"

                            value={

                                statistics.totalAppointments

                            }

                            onClick={() =>

                                navigate("/appointments")

                            }

                        />


                        {/* ==========================================================
                            TODAY'S APPOINTMENTS
                        ========================================================== */}

                        <DashboardCard

                            title="Today's Appointments"

                            value={

                                statistics.todayAppointments

                            }

                        />


                        {/* ==========================================================
                            UPCOMING APPOINTMENTS
                        ========================================================== */}

                        <DashboardCard

                            title="Upcoming Appointments"

                            value={

                                statistics.upcomingAppointments

                            }

                        />

                    </div>


                    {/* ==========================================================
                        TODAY'S APPOINTMENTS TABLE
                    ========================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mt-8">


                        {/* ==========================================================
                            TABLE TITLE
                        ========================================================== */}

                        <h2 className="text-2xl font-bold mb-6">

                            Today's Appointments

                        </h2>


                        {/* ==========================================================
                            NO APPOINTMENTS
                        ========================================================== */}

                        {todayAppointments.length === 0 ? (

                            <p className="text-gray-500">

                                No appointments scheduled for today.

                            </p>

                        ) : (


                            /* ==========================================================
                               APPOINTMENT TABLE
                            ========================================================== */

                            <div className="overflow-x-auto">

                                <table className="w-full">


                                    {/* ==========================================================
                                        TABLE HEADER
                                    ========================================================== */}

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


                                    {/* ==========================================================
                                        TABLE BODY
                                    ========================================================== */}

                                    <tbody>

                                        {todayAppointments.map(

                                            (appointment) => (

                                                <tr

                                                    key={appointment.id}

                                                    className="border-b hover:bg-gray-50"

                                                >


                                                    {/* ==========================================================
                                                        PATIENT
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.patient_name}

                                                    </td>


                                                    {/* ==========================================================
                                                        DOCTOR
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.doctor_name}

                                                    </td>


                                                    {/* ==========================================================
                                                        SPECIALIZATION
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.specialization}

                                                    </td>


                                                    {/* ==========================================================
                                                        TIME
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.appointment_time}

                                                    </td>


                                                    {/* ==========================================================
                                                        REASON
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.reason || "N/A"}

                                                    </td>


                                                    {/* ==========================================================
                                                        STATUS
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.status}

                                                    </td>


                                                </tr>

                                            )

                                        )}

                                    </tbody>


                                </table>

                            </div>

                        )}

                    </div>

                    {/* ==========================================================
                        UPCOMING APPOINTMENTS
                    ========================================================== */}

                    <div className="bg-white rounded-xl shadow p-6 mt-8">


                        {/* ==========================================================
                            TABLE TITLE
                        ========================================================== */}

                        <h2 className="text-2xl font-bold mb-6">

                            Upcoming Appointments

                        </h2>


                        {/* ==========================================================
                            NO APPOINTMENTS
                        ========================================================== */}

                        {upcomingAppointments.length === 0 ? (

                            <p className="text-gray-500">

                                No upcoming appointments scheduled.

                            </p>

                        ) : (


                            /* ==========================================================
                            APPOINTMENT TABLE
                            ========================================================== */

                            <div className="overflow-x-auto">

                                <table className="w-full">


                                    {/* ==========================================================
                                        TABLE HEADER
                                    ========================================================== */}

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


                                    {/* ==========================================================
                                        TABLE BODY
                                    ========================================================== */}

                                    <tbody>

                                        {upcomingAppointments.map(

                                            (appointment) => (

                                                <tr

                                                    key={appointment.id}

                                                    className="border-b hover:bg-gray-50"

                                                >


                                                    {/* ==========================================================
                                                        PATIENT
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.patient_name}

                                                    </td>


                                                    {/* ==========================================================
                                                        DOCTOR
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.doctor_name}

                                                    </td>


                                                    {/* ==========================================================
                                                        SPECIALIZATION
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.specialization}

                                                    </td>


                                                    {/* ==========================================================
                                                        DATE
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.appointment_date}

                                                    </td>


                                                    {/* ==========================================================
                                                        TIME
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.appointment_time}

                                                    </td>


                                                    {/* ==========================================================
                                                        REASON
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.reason || "N/A"}

                                                    </td>


                                                    {/* ==========================================================
                                                        STATUS
                                                    ========================================================== */}

                                                    <td className="p-3">

                                                        {appointment.status}

                                                    </td>


                                                </tr>

                                            )

                                        )}

                                    </tbody>


                                </table>

                            </div>

                        )}

                    </div>


                </div>

            </div>

        </div>

    );

}


// ==========================================================
// EXPORT DASHBOARD
// ==========================================================

export default Dashboard;