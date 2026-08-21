// ==========================================================
// SIDEBAR COMPONENT
// Displays navigation links for the Hospital Management System
// ==========================================================

import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg min-h-screen p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-6">Menu</h2>

      <ul className="space-y-4">
        <li>
          <Link
            to="/dashboard"
            className="block hover:text-blue-600 transition"
          >
            🏠 Dashboard
          </Link>
        </li>

        <li>
          <Link to="/doctors" className="block hover:text-blue-600 transition">
            👨‍⚕️ Doctors
          </Link>
        </li>

        <li>
          <Link
            to="/patients"
            className="block hover:text-blue-600 transition"
          >
            🧑 Patients
          </Link>
        </li>

        <li>
          <Link
            to="/appointments"
            className="block hover:text-blue-600 transition"
          >
            📅 Appointments
          </Link>
        </li>

        <li className="cursor-pointer hover:text-blue-600 transition">
          💊 Pharmacy
        </li>

        <li>
          <Link
            to="/beds"
            className="block hover:text-blue-600 transition"
          >
            🛏 Beds
          </Link>
        </li>

        <li>
          <Link
            to="/admissions"
            className="block hover:text-blue-600 transition"
          >
            😷 Admissions
          </Link>
        </li>

        <li className="cursor-pointer hover:text-blue-600 transition">
          ⚙️ Settings
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;