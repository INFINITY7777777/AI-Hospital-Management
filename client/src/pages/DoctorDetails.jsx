// ==========================================================
// REACT HOOKS & ROUTER
// ==========================================================

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// ==========================================================
// API CLIENT
// ==========================================================

import api from "../services/api";

function DoctorDetails() {
  // ==========================================================
  // ROUTING & STATE
  // ==========================================================

  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ==========================================================
  // FETCH DOCTOR DETAILS
  // ==========================================================

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("[DoctorDetails] Fetching doctor:", id);

        const response = await api.get(`/doctors/${id}`);
        console.log("[DoctorDetails] Response:", response.data);

        setDoctor(response.data.doctor);
      } catch (err) {
        console.error("[DoctorDetails] Error fetching doctor:", err);

        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this doctor.");
        } else if (err.response?.status === 404) {
          setError("Doctor profile not found.");
        } else {
          setError(
            err.response?.data?.error || "Failed to load doctor information."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  // ==========================================================
  // DELETE DOCTOR
  // ==========================================================

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      console.log("[DoctorDetails] Deleting doctor:", id);

      await api.delete(`/doctors/${id}`);

      alert("Doctor record deleted successfully.");
      navigate("/doctors");
    } catch (err) {
      console.error("[DoctorDetails] Error deleting doctor:", err);

      if (err.response?.status === 401) {
        alert("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        alert("You do not have permission to delete doctors.");
      } else if (err.response?.status === 404) {
        alert("Doctor profile not found.");
      } else {
        alert(err.response?.data?.error || "Failed to delete doctor.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* BACK BUTTON SKELETON */}
          <div className="h-11 w-40 bg-slate-200/70 rounded-xl animate-pulse"></div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 animate-pulse"></div>

              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-20 bg-slate-100/80 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          <Link
            to="/doctors"
            className="
              inline-flex items-center gap-2
              h-11 px-4
              rounded-xl
              bg-white
              border border-slate-200
              text-slate-600
              hover:bg-slate-50
              hover:text-slate-900
              hover:border-slate-300
              text-sm font-semibold
              shadow-sm
              transition-all duration-150
              active:scale-[0.99]
              focus:outline-none
              focus:ring-4
              focus:ring-slate-200
            "
          >
            <svg
              className="h-4 w-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>

            Back to Doctors
          </Link>

          <div className="rounded-[22px] border border-rose-200 bg-rose-50/50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              {error || "Doctor Profile Not Found"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              The requested physician record could not be loaded or may have been removed.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* PAGE NAVIGATION HEADER */}
        <div className="flex items-center justify-between">
          <Link
            to="/doctors"
            className="
              inline-flex items-center gap-2
              h-11 px-4
              rounded-xl
              bg-white
              border border-slate-200
              text-slate-600
              hover:bg-slate-50
              hover:text-slate-900
              hover:border-slate-300
              text-sm font-semibold
              shadow-sm
              transition-all duration-150
              active:scale-[0.99]
              focus:outline-none
              focus:ring-4
              focus:ring-slate-200
            "
          >
            <svg
              className="h-4 w-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>

            Back to Doctor List
          </Link>
        </div>

        {/* DOCTOR PROFILE CARD CONTAINER */}
        <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-6">

          {/* DOCTOR HEADER HERO SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#08679F] border border-sky-100 font-bold text-xl shadow-xs">
                {doctor.doctor_name
                  ? doctor.doctor_name.replace("Dr. ", "").charAt(0)
                  : "D"}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {doctor.doctor_name}
                  </h1>

                  <span className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-[#08679F] border border-sky-200/60">
                    {doctor.specialization || "General Medicine"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium mt-1">
                  Department of {doctor.department || "Clinical Care"}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                className="
                  inline-flex items-center gap-2 h-10 px-4 rounded-xl
                  bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold
                  shadow-md shadow-[#08679F]/20 transition-all duration-150
                  hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
                  focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>

                <span>Edit Doctor</span>
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="
                  inline-flex items-center gap-2 h-10 px-4 rounded-xl
                  bg-white border border-rose-200 text-rose-600
                  hover:bg-rose-50 hover:border-rose-300
                  text-xs font-semibold transition-all duration-150
                  active:scale-[0.99]
                  focus:outline-none focus:ring-4 focus:ring-rose-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {deleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 text-rose-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>

                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CLINICAL DATA GRID */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Doctor Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* SPECIALIZATION */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Specialization
                </span>

                <span className="text-sm font-semibold text-slate-900 block">
                  {doctor.specialization || "Not specified"}
                </span>
              </div>

              {/* DEPARTMENT */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Department
                </span>

                <span className="text-sm font-semibold text-slate-900 block">
                  {doctor.department || "Not specified"}
                </span>
              </div>

              {/* EXPERIENCE */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Clinical Experience
                </span>

                <span className="text-sm font-semibold text-slate-900 block">
                  {doctor.experience !== null &&
                  doctor.experience !== undefined
                    ? `${doctor.experience} Years`
                    : "Not specified"}
                </span>
              </div>

              {/* PHONE */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Phone Number
                </span>

                <span className="text-sm font-semibold text-slate-900 block">
                  {doctor.phone || "Not specified"}
                </span>
              </div>

              {/* EMAIL */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40 lg:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Email Address
                </span>

                <span className="text-sm font-semibold text-slate-900 block">
                  {doctor.email || "Not specified"}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DoctorDetails;