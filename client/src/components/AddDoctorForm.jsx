
// ==========================================================
// ADD DOCTOR FORM
// Used to register a new doctor
// ==========================================================

import { useState } from "react";
import api from "../services/api";

function AddDoctorForm({ refreshDoctors }) {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [doctorData, setDoctorData] = useState({
    doctorName: "",
    specialization: "",
    phone: "",
    email: "",
    department: "",
    experience: "",
  });

  // ==========================================================
  // FEEDBACK STATES
  // ==========================================================

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // HANDLE INPUT CHANGES
  // ==========================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setDoctorData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================================
  // HANDLE FORM SUBMISSION
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...doctorData,
        experience: Number(doctorData.experience),
      };

      // Shared API service handles the base URL and auth header.
      const response = await api.post("/doctors", payload);

      console.log("Doctor added successfully:", response.data);

      setSuccess("Doctor registered successfully!");

      setDoctorData({
        doctorName: "",
        specialization: "",
        phone: "",
        email: "",
        department: "",
        experience: "",
      });

      if (typeof refreshDoctors === "function") {
        await refreshDoctors();
      }
    } catch (err) {
      console.error("Error adding doctor:", err);

      if (err.response?.status === 401) {
        setError(
          "Your login session is invalid or expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to add a doctor. Only administrators can add doctors."
        );
      } else {
        setError(err.response?.data?.error || "Failed to add doctor.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // UI RENDER
  // ==========================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION HEADER */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Register New Doctor
        </h2>

        <p className="mt-0.5 text-xs text-slate-500 font-medium">
          Enter complete profile and clinical qualifications for the new
          medical staff member.
        </p>
      </div>

      {/* ERROR MESSAGE ALERT */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-700"
        >
          <svg
            className="h-4 w-4 shrink-0 text-rose-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS MESSAGE ALERT */}
      {success && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-medium text-emerald-700"
        >
          <svg
            className="h-4 w-4 shrink-0 text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>

          <span>{success}</span>
        </div>
      )}

      {/* FORM GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* DOCTOR NAME */}
        <div>
          <label
            htmlFor="doctorName"
            className="mb-1.5 block text-[12px] font-semibold text-slate-700"
          >
            Doctor Name <span className="text-rose-500">*</span>
          </label>

          <input
            id="doctorName"
            type="text"
            name="doctorName"
            placeholder="Dr. Makwana Shashank"
            value={doctorData.doctorName}
            onChange={handleInputChange}
            required
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
          />
        </div>

        {/* SPECIALIZATION */}
        <div>
          <label
            htmlFor="specialization"
            className="mb-1.5 block text-[12px] font-semibold text-slate-700"
          >
            Specialization <span className="text-rose-500">*</span>
          </label>

          <input
            id="specialization"
            type="text"
            name="specialization"
            placeholder="e.g. Cardiology"
            value={doctorData.specialization}
            onChange={handleInputChange}
            required
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
          />
        </div>

        {/* DEPARTMENT */}
        <div>
          <label
            htmlFor="department"
            className="mb-1.5 block text-[12px] font-semibold text-slate-700"
          >
            Department <span className="text-rose-500">*</span>
          </label>

          <input
            id="department"
            type="text"
            name="department"
            placeholder="e.g. Internal Medicine"
            value={doctorData.department}
            onChange={handleInputChange}
            required
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
          />
        </div>

        {/* PHONE NUMBER */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-[12px] font-semibold text-slate-700"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="+91 1234567890"
            value={doctorData.phone}
            onChange={handleInputChange}
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
          />
        </div>

        {/* EMAIL ADDRESS */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[12px] font-semibold text-slate-700"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="doctor@hospital.org"
            value={doctorData.email}
            onChange={handleInputChange}
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
          />
        </div>

        {/* EXPERIENCE */}
        <div>
          <label
            htmlFor="experience"
            className="mb-1.5 block text-[12px] font-semibold text-slate-700"
          >
            Experience (Years) <span className="text-rose-500">*</span>
          </label>

          <input
            id="experience"
            type="number"
            name="experience"
            placeholder="e.g. 8"
            value={doctorData.experience}
            onChange={handleInputChange}
            min="0"
            step="1"
            required
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
          />
        </div>
      </div>

      {/* FORM ACTION FOOTER */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#08679F] px-6 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-lg hover:shadow-[#08679F]/25 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:text-sm"
        >
          {saving ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>

              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>

              <span>Save Doctor</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default AddDoctorForm;

