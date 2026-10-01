// ==========================================================
// REACT
// ==========================================================

import { useState, useEffect } from "react";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

// ==========================================================
// ADD PATIENT FORM
// ==========================================================

function AddPatientForm({ onPatientAdded }) {
  // ======================================================
  // STATE MANAGEMENT
  // ======================================================

  const [doctors, setDoctors] = useState([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const [patientData, setPatientData] = useState({
    patientName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    address: "",
    emergencyContact: "",
    doctor: "",
    ward: "",
    bedNumber: "",
    diagnosis: "",
    admissionDate: ""
  });

  // ======================================================
  // FETCH DOCTORS & AUTO-SELECT LOGGED IN DOCTOR
  // ======================================================

  useEffect(() => {
    const fetchDoctorsAndSetDefault = async () => {
      setIsLoadingDoctors(true);
      try {
        // 1. Fetch combined doctor list
        const response = await api.get("/doctors");
        const doctorList = response.data?.doctors || response.data || [];
        setDoctors(doctorList);

        // 2. Retrieve logged-in user from localStorage
        const userString = localStorage.getItem("user");
        if (userString) {
          const currentUser = JSON.parse(userString);
          const normalizedRole = String(currentUser.role || "").toLowerCase().trim();

          if (normalizedRole === "doctor") {
            const loggedInName = (currentUser.full_name || currentUser.name || "").toLowerCase().trim();
            const loggedInEmail = (currentUser.email || "").toLowerCase().trim();

            // Find matching doctor in the returned list
            const matchedDoc = doctorList.find((doc) => {
              const dName = (doc.doctor_name || doc.full_name || doc.name || "").toLowerCase().trim();
              const dEmail = (doc.email || "").toLowerCase().trim();
              return (loggedInEmail && dEmail === loggedInEmail) || (loggedInName && dName === loggedInName);
            });

            // Set default selected doctor
            if (matchedDoc) {
              setPatientData((prev) => ({
                ...prev,
                doctor: matchedDoc.doctor_name || matchedDoc.full_name || matchedDoc.name
              }));
            } else if (currentUser.full_name || currentUser.name) {
              setPatientData((prev) => ({
                ...prev,
                doctor: currentUser.full_name || currentUser.name
              }));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch doctors list:", error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctorsAndSetDefault();
  }, []);

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPatientData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // ======================================================
  // HANDLE FORM SUBMIT
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in. Please login again.");
      return;
    }

    try {
      const response = await api.post("/patients", patientData);

      console.log("Patient added successfully:", response.data);
      alert("Patient added successfully!");

      // Clear Form Reset
      setPatientData({
        patientName: "",
        age: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        address: "",
        emergencyContact: "",
        doctor: "",
        ward: "",
        bedNumber: "",
        diagnosis: "",
        admissionDate: ""
      });

      if (onPatientAdded) {
        onPatientAdded();
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      console.error("Backend response:", error.response?.data);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Your session has expired. Please login again.");
        return;
      }

      if (error.response?.status === 403) {
        alert("You do not have permission to add patients.");
        return;
      }

      alert(error.response?.data?.error || "Failed to add patient.");
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: PERSONAL DETAILS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PATIENT NAME */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="patientName"
              placeholder="Enter patient's full name"
              value={patientData.patientName}
              onChange={handleInputChange}
              required
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* AGE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              placeholder="e.g. 34"
              value={patientData.age}
              onChange={handleInputChange}
              required
              min="0"
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="gender"
                value={patientData.gender}
                onChange={handleInputChange}
                required
                className="
                  w-full h-10 rounded-xl border border-slate-300 bg-white
                  py-2 pl-3.5 pr-10 text-xs sm:text-sm text-slate-800 outline-none
                  transition-all duration-150 appearance-none cursor-pointer
                  focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                "
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* BLOOD GROUP */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="bloodGroup"
                value={patientData.bloodGroup}
                onChange={handleInputChange}
                required
                className="
                  w-full h-10 rounded-xl border border-slate-300 bg-white
                  py-2 pl-3.5 pr-10 text-xs sm:text-sm text-slate-800 outline-none
                  transition-all duration-150 appearance-none cursor-pointer
                  focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                "
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CONTACT DETAILS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.47-5.112-3.756-6.58-6.58l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Contact & Address
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PHONE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter primary phone number"
              value={patientData.phone}
              onChange={handleInputChange}
              required
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* EMERGENCY CONTACT */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Emergency Contact
            </label>
            <input
              type="tel"
              name="emergencyContact"
              placeholder="Enter emergency contact number"
              value={patientData.emergencyContact}
              onChange={handleInputChange}
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              name="address"
              placeholder="Enter full address details"
              value={patientData.address}
              onChange={handleInputChange}
              required
              className="
                w-full rounded-xl border border-slate-300 bg-white
                p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: CLINICAL & ASSIGNMENT DETAILS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <svg className="h-4 w-4 text-[#08679F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Clinical & Admission Setup
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DYNAMIC DOCTOR DROPDOWN */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Assigned Doctor
            </label>
            <div className="relative">
              <select
                name="doctor"
                value={patientData.doctor}
                onChange={handleInputChange}
                disabled={isLoadingDoctors}
                className="
                  w-full h-10 rounded-xl border border-slate-300 bg-white
                  py-2 pl-3.5 pr-10 text-xs sm:text-sm text-slate-800 outline-none
                  transition-all duration-150 appearance-none cursor-pointer
                  focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                  disabled:bg-slate-100 disabled:text-slate-400
                "
              >
                <option value="">
                  {isLoadingDoctors ? "Loading Doctors..." : "Select Assigned Doctor"}
                </option>
                {doctors.map((doc) => {
                  const docName = doc.doctor_name || doc.full_name || doc.name || doc;
                  return (
                    <option key={doc.id || docName} value={docName}>
                      {docName} {doc.specialization ? `(${doc.specialization})` : ""}
                    </option>
                  );
                })}
              </select>
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* ADMISSION DATE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Admission Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="admissionDate"
              value={patientData.admissionDate}
              onChange={handleInputChange}
              required
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* WARD */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Ward
            </label>
            <input
              type="text"
              name="ward"
              placeholder="e.g. ICU, General Ward A"
              value={patientData.ward}
              onChange={handleInputChange}
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* BED NUMBER */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Bed Number
            </label>
            <input
              type="text"
              name="bedNumber"
              placeholder="e.g. B-102"
              value={patientData.bedNumber}
              onChange={handleInputChange}
              className="
                w-full h-10 rounded-xl border border-slate-300 bg-white
                px-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>

          {/* DIAGNOSIS */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Diagnosis / Clinical Notes
            </label>
            <textarea
              rows="3"
              name="diagnosis"
              placeholder="Enter initial diagnosis or admission notes..."
              value={patientData.diagnosis}
              onChange={handleInputChange}
              className="
                w-full rounded-xl border border-slate-300 bg-white
                p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none
                transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
              "
            />
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="pt-4 flex justify-end border-t border-slate-100">
        <button
          type="submit"
          className="
            inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl
            bg-[#08679F] hover:bg-[#07557F] text-white text-xs sm:text-sm font-semibold
            shadow-md shadow-[#08679F]/20 transition-all duration-150
            hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#08679F]/25
            active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
          "
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Save Patient
        </button>
      </div>
    </form>
  );
}

export default AddPatientForm;