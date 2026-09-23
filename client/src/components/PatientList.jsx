// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate } from "react-router-dom";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

// ==========================================================
// PATIENT LIST
// ==========================================================

// ==========================================================
// PATIENT LIST
// ==========================================================

function PatientList({
    refreshPatients,
    searchTerm,
    sortBy,
    sortOrder
}) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Initialize state lazily directly from localStorage (no effect required)
    const [userRole] = useState(() => {
        const storedRole = localStorage.getItem("role") || "";
        return storedRole.toLowerCase().trim();
    });

    const navigate = useNavigate();

    // ==========================================================
    // VIEW PATIENT
    // ==========================================================
    const handleViewPatient = (patientId) => {
        navigate(`/patients/${patientId}`);
    };

    // ==========================================================
    // FETCH PATIENTS
    // ==========================================================
    useEffect(() => {
        let isMounted = true;

        const fetchPatients = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/");
                    return;
                }

                const response = await api.get("/patients");

                if (isMounted) {
                    setPatients(response.data.patients || []);
                }
            } catch (error) {
                console.error("Error fetching patients:", error);

                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/");
                    return;
                }

                if (error.response?.status === 403) {
                    if (isMounted) {
                        setError("You do not have permission to view patients.");
                    }
                    return;
                }

                if (isMounted) {
                    setError(
                        error.response?.data?.error || "Failed to load patients."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPatients();

        return () => {
            isMounted = false;
        };
    }, [refreshPatients, navigate]);

    // ==========================================================
    // SEARCH & SORT
    // ==========================================================
    const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

    const filteredPatients = patients.filter((patient) => {
        if (!normalizedSearch) return true;

        const patientName = String(patient.patient_name || "").trim().toLowerCase();
        const patientPhone = String(patient.phone || "").trim().toLowerCase();
        const patientId = String(patient.patient_id || patient.id || "").trim().toLowerCase();

        return (
            patientName.includes(normalizedSearch) ||
            patientPhone.includes(normalizedSearch) ||
            patientId.includes(normalizedSearch)
        );
    });

    const sortedPatients = [...filteredPatients].sort((a, b) => {
        let valueA;
        let valueB;

        if (sortBy === "patient_name") {
            valueA = String(a.patient_name || "").trim().toLowerCase();
            valueB = String(b.patient_name || "").trim().toLowerCase();
            const result = valueA.localeCompare(valueB);
            return sortOrder === "asc" ? result : -result;
        }

        if (sortBy === "age") {
            valueA = Number(a.age) || 0;
            valueB = Number(b.age) || 0;
        } else if (sortBy === "id") {
            const numericA = Number(a.patient_id || a.id);
            const numericB = Number(b.patient_id || b.id);

            if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) {
                valueA = numericA;
                valueB = numericB;
            } else {
                valueA = String(a.patient_id || a.id || "").toLowerCase();
                valueB = String(b.patient_id || b.id || "").toLowerCase();
                const result = valueA.localeCompare(valueB, undefined, { numeric: true });
                return sortOrder === "asc" ? result : -result;
            }
        } else {
            valueA = new Date(a.created_at || 0).getTime();
            valueB = new Date(b.created_at || 0).getTime();
        }

        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });

    // ==========================================================
    // HELPER: ROLE BADGE RENDERING
    // ==========================================================
    const renderRoleScopeBadge = () => {
        if (userRole === "doctor") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    🩺 Assigned Patients Only
                </span>
            );
        }
        if (userRole === "staff" || userRole === "nurse") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    🏥 Admitted / Ward Patients
                </span>
            );
        }
        if (userRole === "admin") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    🛡️ All Patients (Admin View)
                </span>
            );
        }
        return null;
    };

    // ==========================================================
    // LOADING
    // ==========================================================
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-6 mt-6">
                <h2 className="text-2xl font-bold mb-6">Patient List</h2>
                <div className="space-y-3">
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    // ==========================================================
    // UI
    // ==========================================================
    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Patient List
                        </h2>
                        {renderRoleScopeBadge()}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {userRole === "doctor" && "Viewing clinical roster assigned to you"}
                        {userRole === "staff" && "Viewing patients currently assigned to ward beds"}
                        {userRole === "admin" && "Full administrative patient directory access"}
                        {!userRole && "View and manage registered patients"}
                    </p>
                </div>

                {/* PATIENT COUNT */}
                <div className="text-sm text-gray-500">
                    Showing:{" "}
                    <span className="font-semibold text-gray-900">
                        {filteredPatients.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                        {patients.length}
                    </span>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* NO PATIENTS */}
            {patients.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">👤</div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        No patients found
                    </h3>
                    <p className="text-gray-500 mt-1">
                        {userRole === "doctor"
                            ? "No patients are currently assigned to you."
                            : userRole === "staff"
                            ? "No patients are currently assigned to ward beds."
                            : "Add a patient to see them listed here."}
                    </p>
                </div>
            ) : filteredPatients.length === 0 ? (
                /* NO SEARCH RESULTS */
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        No matching patients
                    </h3>
                    <p className="text-gray-500 mt-1">
                        No patient matches "{searchTerm}".
                    </p>
                </div>
            ) : (
                /* PATIENT TABLE */
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Patient ID
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Name
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Age
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Gender
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Ward
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Bed
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="p-3">
                                        <div className="font-medium text-blue-600">
                                            {patient.patient_id || patient.id || "—"}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-900">
                                            {patient.patient_name || "—"}
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-700">
                                        {patient.age ?? "—"}
                                    </td>
                                    <td className="p-3 text-gray-700">
                                        {patient.gender || "—"}
                                    </td>
                                    <td className="p-3 text-gray-700">
                                        {patient.ward || "—"}
                                    </td>
                                    <td className="p-3 text-gray-700">
                                        {patient.bed_number || "—"}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            onClick={() => handleViewPatient(patient.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PatientList;