// ==========================================================
// NAVBAR COMPONENT
// Displays the application title, notification bell, and logout option.
// ==========================================================

// Used to redirect the user
import { useNavigate } from "react-router-dom";

// Used for real-time notification alerts
import NotificationBell from "./NotificationBell";


function Navbar() {

    // Use for page navigation
    const navigate = useNavigate(); 


    // ==========================================================
    // LOGOUT FUNCTION
    // Removes JWT token and redirects to Login
    // ==========================================================

    const handleLogout = () => {

        // Removes the stored Token
        localStorage.removeItem("token");

        // Redirects to the Login Page
        navigate("/");

    };


    return (

        <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow">

            {/* Application Title */}
            <h1 className="text-2xl font-bold">
                🏥 Hospital Management System
            </h1>


            {/* Right Container: Notifications & Actions */}
            <div className="flex items-center gap-6">

                {/* Notification Bell Component */}
                <NotificationBell />


                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
                >
                    Logout
                </button>

            </div>

        </nav>

    );

}

export default Navbar;