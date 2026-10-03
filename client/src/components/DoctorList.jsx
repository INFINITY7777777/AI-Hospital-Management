// ==========================================================
// REACT HOOKS & ROUTER
// ==========================================================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ==========================================================
// API CLIENT
// ==========================================================

import api from "../services/api";

// ==========================================================
// DOCTOR LIST COMPONENT
// ==========================================================

function DoctorList({ refreshDoctors }) {
  // ==========================================================
  // COMPONENT STATE
  // ==========================================================

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ==========================================================
  // FETCH DOCTORS
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }

        const response = await api.get("/doctors");

        if (isMounted) {
          setDoctors(response.data.doctors || []);
        }
      } catch (err) {
        console.error("[DoctorList] Error fetching doctors:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          if (isMounted) {
            setError("Your session has expired. Please login again.");
          }
          navigate("/");
          return;
        }

        if (err.response?.status === 403) {
          if (isMounted) {
            setError("You do not have permission to view doctors.");
          }
          return;
        }

        if (isMounted) {
          setError(err.response?.data?.error || "Failed to load doctors.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, [refreshDoctors, navigate]);

  // ==========================================================
  // LOADING STATE SKELETON
  // ==========================================================

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-100 rounded-md animate-pulse"></div>
          <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-100/80 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI RENDER
  // ==========================================================

  return (
    <div className="space-y-5">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Registered Physicians
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            View and manage active medical specialists in the system.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
          Total Doctors:
          <span className="text-[#08679F] font-bold">{doctors.length}</span>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-700">
          <svg
            className="h-4 w-4 shrink-0 text-rose-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No Doctors Found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            There are currently no registered doctors in the system. Use the registration form above to add a new physician.
          </p>
        </div>
      ) : (
        /* TABLE CONTAINER */
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
          <table className="w-full text-left text-xs text-slate-600">
            {/* TABLE HEADER */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-4 py-3">
                  Doctor Name
                </th>
                <th scope="col" className="px-4 py-3">
                  Specialization
                </th>
                <th scope="col" className="px-4 py-3">
                  Department
                </th>
                <th scope="col" className="px-4 py-3">
                  Phone
                </th>
                <th scope="col" className="px-4 py-3">
                  Experience
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doctor) => (
                <tr
                  key={doctor.id}
                  className="hover:bg-slate-50/60 transition-colors duration-150"
                >
                  {/* DOCTOR NAME */}
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="hover:text-[#08679F] transition-colors"
                    >
                      {doctor.doctor_name || "—"}
                    </Link>
                  </td>

                  {/* SPECIALIZATION */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-[#08679F] border border-sky-200/60">
                      {doctor.specialization || "General"}
                    </span>
                  </td>

                  {/* DEPARTMENT */}
                  <td className="px-4 py-3.5 text-slate-700 font-medium">
                    {doctor.department || "—"}
                  </td>

                  {/* PHONE */}
                  <td className="px-4 py-3.5 text-slate-600">
                    {doctor.phone || "—"}
                  </td>

                  {/* EXPERIENCE */}
                  <td className="px-4 py-3.5 text-slate-600">
                    {doctor.experience !== null && doctor.experience !== undefined ? (
                      <span className="font-semibold text-slate-800">
                        {doctor.experience} yrs
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="
                        inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg
                        bg-slate-100 hover:bg-[#08679F] text-slate-700 hover:text-white
                        text-xs font-semibold transition-all duration-150 active:scale-[0.98]
                      "
                    >
                      <span>View</span>
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </Link>
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

export default DoctorList;