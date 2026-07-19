// ==========================================================
// NAVBAR COMPONENT
// Displays the application title and logged-in user.
// ==========================================================

// Used to redirect the user
import { useNavigate } from "react-router-dom";

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

            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
            >
                Logout
            </button>

        </nav>

    );

}

export default Navbar;