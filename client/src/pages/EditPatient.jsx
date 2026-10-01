// ==========================================================
// REACT
// ==========================================================

import { useEffect, useState } from "react";

// ==========================================================
// REACT ROUTER
// ==========================================================

import { useNavigate, useParams } from "react-router-dom";

// ==========================================================
// API
// ==========================================================

import api from "../services/api";

// ==========================================================
// EDIT PATIENT COMPONENT
// ==========================================================

function EditPatient() {
  // ======================================================
  // GET PATIENT ID
  // ======================================================

  const { id } = useParams();

  // ======================================================
  // NAVIGATION
  // ======================================================

  const navigate = useNavigate();

  // ======================================================
  // PATIENT STATE
  // ======================================================

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
  // STATES
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // FETCH PATIENT
  // ======================================================

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await api.get(`/patients/${id}`);
        const patient = response.data.patient;

        setPatientData({
          patientName: patient.patient_name || "",
          age: patient.age ?? "",
          gender: patient.gender || "",
          bloodGroup: patient.blood_group || "",
          phone: patient.phone || "",
          address: patient.address || "",
          emergencyContact: patient.emergency_contact || "",
          doctor: patient.doctor || "",
          ward: patient.ward || "",
          bedNumber: patient.bed_number || "",
          diagnosis: patient.diagnosis || "",
          admissionDate: patient.admission_date
            ? String(patient.admission_date).split("T")[0]
            : ""
        });
      } catch (error) {
        console.error("Error fetching patient:", error);
        console.error("Backend response:", error.response?.data);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (error.response?.status === 403) {
          setErrorMessage("You do not have permission to edit this patient.");
          return;
        }

        if (error.response?.status === 404) {
          setErrorMessage("Patient not found.");
          return;
        }

        setErrorMessage(
          error.response?.data?.error || "Failed to load patient details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatient();
    }
  }, [id, navigate]);

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPatientData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  // ======================================================
  // UPDATE PATIENT
  // ======================================================

  const handleUpdatePatient = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setUpdating(true);

    try {
      const response = await api.put(`/patients/${id}`, patientData);

      console.log("Patient updated successfully:", response.data);
      setMessage("Patient updated successfully.");

      setTimeout(() => {
        navigate(`/patients/${id}`);
      }, 1000);
    } catch (error) {
      console.error("Error updating patient:", error);
      console.error("Backend response:", error.response?.data);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      if (error.response?.status === 403) {
        setErrorMessage("You do not have permission to update this patient.");
        return;
      }

      if (error.response?.status === 404) {
        setErrorMessage("Patient not found.");
        return;
      }

      setErrorMessage(
        error.response?.data?.error || "Failed to update patient."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-[22px] border border-slate-200/80 p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-12 bg-slate-100 rounded-xl"></div>
              <div className="h-12 bg-slate-100 rounded-xl"></div>
              <div className="h-12 bg-slate-100 rounded-xl"></div>
              <div className="h-12 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* BACK BUTTON & HEADER */}
        <div>
          <button
            type="button"
            onClick={() => navigate(`/patients/${id}`)}
            disabled={updating}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm disabled:opacity-50 mb-3"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Back to Patient Details</span>
          </button>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#08679F] block">
            RECORD MANAGEMENT
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Edit Patient Record
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update demographics, clinical assignment, and contact info
          </p>
        </div>

        {/* ERROR BANNERS */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-200/80 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* SUCCESS BANNERS */}
        {message && (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-2xl border border-emerald-200/80 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleUpdatePatient} className="space-y-6">
          {/* SECTION 1: PERSONAL DETAILS */}
          <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              1. Personal Demographics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Patient Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={patientData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={patientData.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={patientData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Blood Group <span className="text-rose-500">*</span>
                </label>
                <select
                  name="bloodGroup"
                  value={patientData.bloodGroup}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
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
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT INFORMATION */}
          <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              2. Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={patientData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={patientData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  name="address"
                  value={patientData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: HOSPITAL & ASSIGNMENT */}
          <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
              3. Hospital & Ward Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Attending Doctor
                </label>
                <input
                  type="text"
                  name="doctor"
                  value={patientData.doctor}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ward Unit
                </label>
                <input
                  type="text"
                  name="ward"
                  value={patientData.ward}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bed Number
                </label>
                <input
                  type="text"
                  name="bedNumber"
                  value={patientData.bedNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admission Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={patientData.admissionDate}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Diagnosis / Primary Condition
                </label>
                <textarea
                  rows="3"
                  name="diagnosis"
                  value={patientData.diagnosis}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08679F]/20 focus:border-[#08679F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              disabled={updating}
              className="px-6 py-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating}
              className="bg-[#08679F] hover:bg-[#065381] disabled:opacity-50 text-white px-7 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
            >
              {updating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Patient Record</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPatient;