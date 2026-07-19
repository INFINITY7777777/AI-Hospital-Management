// React Hooks
import { useEffect } from "react";

// Used for page redirection
import { useNavigate } from "react-router-dom";

// Import Navbar Component
import Navbar from "../components/Navbar";

// Import Sidebar Component
import Sidebar from "../components/Sidebar";

// Import DashboardCard Component
import DashboardCard from "../components/DashboardCard";

function Dashboard() {

    // Used to redirect the User.
    const navigate = useNavigate();

    // ==========================================================
    // CHECK IF USER IS LOGGED IN
    // If there is no token, send the user back to Login
    // ==========================================================

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            navigate("/");
        }
    }, [navigate]);


    return (

        <div className="min-h-screen bg-gray-100">

            {/* ==========================================================
                Navbar
            ========================================================== */}

            <Navbar />

            <div className="flex">

                <Sidebar />

                <div className="flex-1 p-8">

                    <div className="grid grid-cols-4 gap-6">

                        <DashboardCard
                            title="Doctors"
                            value={25}
                        />

                        <DashboardCard
                            title="Patients"
                            value={142}
                        />

                        <DashboardCard
                            title="Appointments"
                            value={18}
                        />

                        <DashboardCard
                            title="Available Beds"
                            value={36}
                        />

                    </div>
                    
                </div>

            </div>
            

        </div>

    );

}

export default Dashboard;