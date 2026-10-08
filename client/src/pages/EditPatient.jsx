// ==========================================================
// REACT & ROUTER
// ==========================================================

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ==========================================================
// API SERVICE & COMPONENTS
// ==========================================================

import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

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

  // Card 3D Tilt & Spotlight states
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveCard = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setCardRotate({ x: rotateX, y: rotateY });
  };

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
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">
        <MedicalPlusBackground />
        <main className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
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
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900">
      {/* Interactive Medical + Canvas Background */}
      <MedicalPlusBackground />

      {/* Background Glow Decorations */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              disabled={updating}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Patient Details
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Clinical workspace active
          </div>
        </div>

        <div className="mb-8 border-b border-slate-200/80 pb-5">
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
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-700 backdrop-blur-md">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-medium text-emerald-700 backdrop-blur-md">
            {message}
          </div>
        )}

        {/* Outer Form Wrapper with 3D Tilt & Spotlight Container */}
        <div className="perspective-[1000px]">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMoveCard}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isHovered
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(6px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="animate-login-card relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
          >
            {/* Dynamic Spotlight Glow effect inside card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[26px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Card Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[26px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <form onSubmit={handleUpdatePatient} className="relative z-10 space-y-6">
              {/* SECTION 1: DEMOGRAPHICS */}
              <div className="rounded-[20px] border border-slate-200/70 bg-white/70 p-5 backdrop-blur-md shadow-xs transition-all hover:bg-white/90 sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#08679F]">
                    1. Personal Demographics
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Patient Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={patientData.patientName}
                      onChange={handleInputChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={patientData.age}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={patientData.gender}
                      onChange={handleInputChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Blood Group <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={patientData.bloodGroup}
                      onChange={handleInputChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
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
              <div className="rounded-[20px] border border-slate-200/70 bg-white/70 p-5 backdrop-blur-md shadow-xs transition-all hover:bg-white/90 sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#08679F]">
                    2. Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={patientData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={patientData.emergencyContact}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows="2"
                      name="address"
                      value={patientData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SYNCHRONIZED HOSPITAL & WARD ASSIGNMENT */}
              <div className="rounded-[20px] border border-slate-200/70 bg-white/70 p-5 backdrop-blur-md shadow-xs transition-all hover:bg-white/90 sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#08679F]">
                    3. Hospital & Ward Assignment
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {/* ATTENDING DOCTOR DROPDOWN */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Attending Doctor
                    </label>
                    <select
                      name="doctor"
                      value={patientData.doctor}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    >
                      <option value="">Unassigned / Select Doctor</option>
                      {doctorsList.map((doc) => {
                        const displayName = /^dr\./i.test(doc.doctor_name?.trim() || "")
                          ? doc.doctor_name
                          : `Dr. ${doc.doctor_name}`;

                        return (
                          <option key={doc.id} value={doc.doctor_name}>
                            {displayName} ({doc.specialization || "General"})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* WARD UNIT DROPDOWN */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ward Unit
                    </label>
                    <select
                      name="ward"
                      value={patientData.ward}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
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
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Bed Number
                    </label>
                    <select
                      name="bedNumber"
                      value={patientData.bedNumber}
                      onChange={handleInputChange}
                      disabled={!patientData.ward}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Admission Date <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={patientData.admissionDate}
                      onChange={handleInputChange}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>

                  {/* DIAGNOSIS */}
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Diagnosis / Primary Condition
                    </label>
                    <textarea
                      rows="3"
                      name="diagnosis"
                      value={patientData.diagnosis}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs text-slate-800 outline-none transition-all duration-150 sm:text-sm focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/patients/${id}`)}
                  disabled={updating}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="group relative overflow-hidden h-11 min-w-50 rounded-xl bg-[#08679F] px-6 text-xs font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <span className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <span className="relative z-10 inline-flex items-center justify-center gap-2 sm:text-sm">
                    {updating ? "Updating..." : "Update Patient Record"}

                    {!updating && (
                      <svg
                        className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Animation styles matching Login page */}
      <style>{`
        @keyframes loginCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-login-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default EditPatient;