// ==========================================================
// NAVBAR COMPONENT
// ==========================================================

import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();

  // Retrieve and safely parse user session data
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Normalize role string handling (strips spaces and converts to lowercase)
  const role = user.role ? String(user.role).toLowerCase().trim() : "";
  
  // Resolve user display name from multiple possible keys
  const displayName = user.full_name || user.name || user.username || "";

  // ==========================================================
  // LOGOUT FUNCTION
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow">
      {/* Title & Navigation */}
      <div className="flex items-center gap-8">
        <h1 
          className="text-2xl font-bold cursor-pointer select-none" 
          onClick={() => navigate("/dashboard")}
        >
          🏥 Hospital Management System
        </h1>

        {/* Display link for admin access regardless of string casing */}
        {role === "admin" && (
          <Link
            to="/users"
            className="bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-lg text-sm font-medium transition border border-blue-600"
          >
            User Management
          </Link>
        )}
      </div>

      {/* Right Container */}
      <div className="flex items-center gap-6">
        {/* User Badge */}
        {displayName && (
          <span className="text-xs bg-blue-800 border border-blue-600 px-3 py-1 rounded-full capitalize">
            {displayName} ({role})
          </span>
        )}

        {/* Notifications */}
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