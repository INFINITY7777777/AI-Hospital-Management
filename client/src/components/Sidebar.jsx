// ==========================================================
// SIDEBAR COMPONENT
// Displays navigation links for the Hospital Management System
// ==========================================================


import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <div className="w-64 bg-white shadow-lg min-h-screen p-6">

            <h2 className="text-xl font-bold text-blue-700 mb-6">
                Menu
            </h2>

            <ul className="space-y-4">

                <li className="cursor-pointer hover:text-blue-600">
                    🏠 Dashboard
                </li>

                <li> 
                    <Link
                        to="/doctors"
                        className="hover:text-blue-600"
                    >
                        👨‍⚕️ Doctors
                    </Link>
                </li>
                <li>

                    <Link
                        to="/patients"
                        className="hover:text-blue-600"
                    >
                        🧑 Patients
                    </Link>

                </li>

                <li className="cursor-pointer hover:text-blue-600">
                    <Link to="/appointments">
                        📅 Appointments
                    </Link>
                </li>

                <li className="cursor-pointer hover:text-blue-600">
                    💊 Pharmacy
                    
                </li>

                <li className="cursor-pointer hover:text-blue-600">
                    🛏 Beds
                </li>

                <li className="cursor-pointer hover:text-blue-600">
                    ⚙️ Settings
                </li>

            </ul>

        </div>

    );

}

export default Sidebar;