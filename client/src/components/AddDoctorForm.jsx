// ==========================================================
// ADD DOCTOR FORM
// Used to register a new doctor
// ==========================================================

import { useState } from "react";
import axios from "axios";

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
      const response = await axios.post(
        "http://localhost:5000/api/doctors",
        doctorData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

      if (refreshDoctors) {
        refreshDoctors();
      }
    } catch (err) {
      console.error("Error adding doctor:", err);

      if (err.response?.status === 401) {
        setError("Your login session is invalid or expired. Please login again.");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to add a doctor. Only administrators can add doctors."
        );
        return;
      }

      setError(err.response?.data?.error || "Failed to add doctor.");
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
          Enter complete profile and clinical qualifications for the new medical staff member.
        </p>
      </div>

      {/* ERROR MESSAGE ALERT */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-700">
          <svg className="h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS MESSAGE ALERT */}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs font-medium text-emerald-700">
          <svg className="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* FORM GRID */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* DOCTOR NAME */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Doctor Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="doctorName"
            placeholder="Dr. Makwana Shashank"
            value={doctorData.doctorName}
            onChange={handleInputChange}
            required
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
          />
        </div>

        {/* SPECIALIZATION */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Specialization <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="specialization"
            placeholder="e.g. Cardiology"
            value={doctorData.specialization}
            onChange={handleInputChange}
            required
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
          />
        </div>

        {/* DEPARTMENT */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Department <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="department"
            placeholder="e.g. Internal Medicine"
            value={doctorData.department}
            onChange={handleInputChange}
            required
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
          />
        </div>

        {/* PHONE NUMBER */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+91 1234567890"
            value={doctorData.phone}
            onChange={handleInputChange}
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
          />
        </div>

        {/* EMAIL ADDRESS */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="doctor@hospital.org"
            value={doctorData.email}
            onChange={handleInputChange}
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
          />
        </div>

        {/* EXPERIENCE */}
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            Experience (Years) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            name="experience"
            placeholder="e.g. 8"
            value={doctorData.experience}
            onChange={handleInputChange}
            min="0"
            required
            className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
          />
        </div>
      </div>

      {/* FORM ACTION FOOTER */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="
            inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl
            bg-[#08679F] hover:bg-[#07557F] text-white text-xs sm:text-sm font-semibold
            shadow-md shadow-[#08679F]/20 transition-all duration-150
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#08679F]/25
            active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
          "
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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