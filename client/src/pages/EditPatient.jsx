// ==========================================================
// REACT & ROUTER
// ==========================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ==========================================================
// API SERVICE
// ==========================================================

import api from "../services/api";

// ==========================================================
// EDIT PATIENT COMPONENT
// ==========================================================

function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    admissionDate: "",
  });

  // Dynamic Options State
  const [doctorsList, setDoctorsList] = useState([]);
  const [bedsList, setBedsList] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // FETCH PATIENT, DOCTORS, AND BEDS
  // ======================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        // Fetch patient, doctors, and beds concurrently
        const [patientRes, doctorsRes, bedsRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get("/doctors"),
          api.get("/beds"),
        ]);

        const patient = patientRes.data.patient;
        const doctors = doctorsRes.data.doctors || [];
        const beds = bedsRes.data.beds || [];

        setDoctorsList(doctors);
        setBedsList(beds);

        // Extract distinct wards from beds list
        const distinctWards = Array.from(
          new Set(beds.map((bed) => bed.ward).filter(Boolean))
        ).sort();

        setAvailableWards(distinctWards);

        let formattedAdmissionDate = "";
        if (patient.admission_date) {
          formattedAdmissionDate = String(patient.admission_date).split("T")[0];
        }

        setPatientData({
          patientName: patient.patient_name || "",
          age: patient.age ?? "",
          gender: patient.gender || "",
          bloodGroup: patient.blood_group || "",
          phone: patient.phone || "",
          address: patient.address || "",
          emergencyContact: patient.emergency_contact || "",
          doctor: patient.doctor || "",
          ward: patient.ward || patient.current_ward || "",
          bedNumber: String(patient.bed_number || patient.current_bed_number || ""),
          diagnosis: patient.diagnosis || "",
          admissionDate: formattedAdmissionDate,
        });
      } catch (error) {
        console.error("Error loading edit page data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        setErrorMessage("Failed to load patient or system records.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // ======================================================
  // DERIVED STATE: FILTERED BEDS FOR SELECTED WARD
  // ======================================================

  const filteredBeds = patientData.ward
    ? bedsList.filter((bed) => {
        const isSameWard = String(bed.ward).trim() === String(patientData.ward).trim();
        const isAvailable = String(bed.status).toLowerCase() === "available";
        const isCurrentBed = String(bed.bed_number).trim() === String(patientData.bedNumber).trim();

        return isSameWard && (isAvailable || isCurrentBed);
      })
    : [];

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "ward") {
      // Clear bed selection when changing ward
      setPatientData((previous) => ({
        ...previous,
        ward: value,
        bedNumber: "",
      }));
    } else {
      setPatientData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }
  };

  // ======================================================
  // SUBMIT UPDATE
  // ======================================================

  const handleUpdatePatient = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setUpdating(true);

    try {
      const payload = {
        patient_name: patientData.patientName,
        patientName: patientData.patientName,
        age: Number(patientData.age),
        gender: patientData.gender,
        blood_group: patientData.bloodGroup,
        bloodGroup: patientData.bloodGroup,
        phone: patientData.phone,
        address: patientData.address,
        emergency_contact: patientData.emergencyContact,
        emergencyContact: patientData.emergencyContact,
        doctor: patientData.doctor || null,
        ward: patientData.ward || null,
        bed_number: patientData.bedNumber || null,
        bedNumber: patientData.bedNumber || null,
        diagnosis: patientData.diagnosis,
        admission_date: patientData.admissionDate || null,
        admissionDate: patientData.admissionDate || null,
      };

      await api.put(`/patients/${id}`, payload);

      setMessage("Patient record updated and synchronized successfully.");

      setTimeout(() => {
        navigate(`/patients/${id}`);
      }, 800);
    } catch (error) {
      console.error("Error updating patient:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update patient."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-9 w-44 animate-pulse rounded-xl bg-slate-200/80" />
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div className="space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200/80" />
              <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200/80" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans antialiased text-slate-900">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/patients/${id}`)}
            disabled={updating}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Patient Details
          </button>
        </div>

        <div className="border-b border-slate-200/80 pb-5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#08679F]">
            Record Management
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Patient Record
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Update demographics and manage dynamic hospital/ward bed assignment.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 text-xs font-medium text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdatePatient} className="space-y-6">
          {/* SECTION 1: DEMOGRAPHICS */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Personal Demographics
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Patient Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={patientData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={patientData.age}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={patientData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Blood Group <span className="text-rose-500">*</span>
                </label>
                <select
                  name="bloodGroup"
                  value={patientData.bloodGroup}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
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

          {/* SECTION 2: CONTACT DETAILS */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={patientData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={patientData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  name="address"
                  value={patientData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SYNCHRONIZED HOSPITAL & WARD ASSIGNMENT */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Hospital & Ward Assignment
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* ATTENDING DOCTOR DROPDOWN */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Attending Doctor
                </label>
                <select
                  name="doctor"
                  value={patientData.doctor}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                >
                  <option value="">Unassigned / Select Doctor</option>
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.doctor_name}>
                      Dr. {doc.doctor_name} ({doc.specialization || "General"})
                    </option>
                  ))}
                </select>
              </div>

              {/* WARD UNIT DROPDOWN */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Ward Unit
                </label>
                <select
                  name="ward"
                  value={patientData.ward}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                >
                  <option value="">Unassigned / Select Ward</option>
                  {availableWards.map((wrd) => (
                    <option key={wrd} value={wrd}>
                      {wrd}
                    </option>
                  ))}
                </select>
              </div>

              {/* BED NUMBER DEPENDENT DROPDOWN */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Bed Number
                </label>
                <select
                  name="bedNumber"
                  value={patientData.bedNumber}
                  onChange={handleInputChange}
                  disabled={!patientData.ward}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {!patientData.ward
                      ? "Select Ward First"
                      : filteredBeds.length === 0
                      ? "No Available Beds in Ward"
                      : "Unassigned / Select Bed"}
                  </option>
                  {filteredBeds.map((bd) => (
                    <option key={bd.id} value={bd.bed_number}>
                      Bed {bd.bed_number} ({bd.bed_type || "Standard"})
                    </option>
                  ))}
                </select>
              </div>

              {/* ADMISSION DATE */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Admission Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={patientData.admissionDate}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>

              {/* DIAGNOSIS */}
              <div className="md:col-span-2 lg:col-span-4">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Diagnosis / Primary Condition
                </label>
                <textarea
                  rows="3"
                  name="diagnosis"
                  value={patientData.diagnosis}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 sm:text-sm outline-none focus:border-[#08679F]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              disabled={updating}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#08679F] px-6 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#07557F]"
            >
              {updating ? "Updating..." : "Update Patient Record"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditPatient;