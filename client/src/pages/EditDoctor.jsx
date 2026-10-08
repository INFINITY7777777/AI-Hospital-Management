// ==========================================================
// REACT HOOKS & ROUTER
// ==========================================================

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// ==========================================================
// API CLIENT & COMPONENTS
// ==========================================================

import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground.jsx";

function EditDoctor() {
  // ==========================================================
  // ROUTING & STATE
  // ==========================================================

  const { id } = useParams();
  const navigate = useNavigate();

  const [doctorData, setDoctorData] = useState({
    doctorName: "",
    specialization: "",
    phone: "",
    email: "",
    department: "",
    experience: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // 3D TILT & SPOTLIGHT HOVER ANIMATION STATE
  // ==========================================================

  const formCardRef = useRef(null);
  const [formMousePos, setFormMousePos] = useState({ x: 0, y: 0 });
  const [formCardRotate, setFormCardRotate] = useState({ x: 0, y: 0 });
  const [isFormHovered, setIsFormHovered] = useState(false);

  const handleMouseMoveFormCard = (e) => {
    if (!formCardRef.current) return;
    const rect = formCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFormMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setFormCardRotate({ x: rotateX, y: rotateY });
  };

  // ==========================================================
  // FETCH DOCTOR DETAILS
  // ==========================================================

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setError("");

        console.log("[EditDoctor] Fetching doctor:", id);

        const response = await api.get(`/doctors/${id}`);
        console.log("[EditDoctor] Doctor response:", response.data);

        const doctor = response.data.doctor;

        if (!doctor) {
          setError("Doctor information was not found.");
          return;
        }

        setDoctorData({
          doctorName: doctor.doctor_name || "",
          specialization: doctor.specialization || "",
          phone: doctor.phone || "",
          email: doctor.email || "",
          department: doctor.department || "",
          experience: doctor.experience ?? "",
        });
      } catch (err) {
        console.error("[EditDoctor] Error fetching doctor:", err);

        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to edit doctors.");
        } else if (err.response?.status === 404) {
          setError("Doctor record not found.");
        } else {
          setError(
            err.response?.data?.error || "Failed to load doctor information."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [id]);

  // ==========================================================
  // INPUT CHANGE HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDoctorData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ==========================================================
  // FORM SUBMIT HANDLER
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      console.log("[EditDoctor] Updating doctor:", id, doctorData);

      await api.put(`/doctors/${id}`, doctorData);

      alert("Doctor details updated successfully.");
      navigate(`/doctors/${id}`);
    } catch (err) {
      console.error("[EditDoctor] Error updating doctor:", err);

      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to update doctors.");
      } else if (err.response?.status === 404) {
        setError("Doctor record not found.");
      } else {
        setError(
          err.response?.data?.error || "Failed to update doctor."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING STATE SKELETON
  // ==========================================================

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
        <MedicalPlusBackground />

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">

          {/* BACK BUTTON SKELETON */}
          <div className="h-11 w-44 bg-slate-200/70 rounded-xl animate-pulse"></div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-sm space-y-6">
            <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI RENDER
  // ==========================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Interactive Medical + Canvas Hover Effect */}
      <MedicalPlusBackground />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">

        {/* PAGE NAVIGATION HEADER */}
        <div className="flex items-center justify-between">
          <Link
            to={`/doctors/${id}`}
            className="
              inline-flex items-center gap-2
              h-11 px-4
              rounded-xl
              bg-white/80
              border border-slate-200
              text-slate-600
              hover:bg-slate-50
              hover:text-slate-900
              hover:border-slate-300
              text-sm font-semibold
              shadow-sm
              backdrop-blur-md
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

            Cancel & Back to Doctor
          </Link>
        </div>

        {/* FORM CONTAINER CARD WITH 3D PERSPECTIVE */}
        <div className="perspective-[1000px]">
          <div
            ref={formCardRef}
            onMouseMove={handleMouseMoveFormCard}
            onMouseEnter={() => setIsFormHovered(true)}
            onMouseLeave={() => {
              setIsFormHovered(false);
              setFormCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isFormHovered
                ? `rotateX(${formCardRotate.x}deg) rotateY(${formCardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isFormHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-6"
          >
            {/* Dynamic Spotlight Glow effect inside Form Card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isFormHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${formMousePos.x}px ${formMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isFormHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${formMousePos.x}px ${formMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage:
                  "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10 space-y-6">
              {/* FORM TITLE */}
              <div className="border-b border-slate-100 pb-4">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Edit Doctor Profile
                </h1>

                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Update physician credentials, department assignments, and contact details.
                </p>
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

              {/* EDIT FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* DOCTOR NAME */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Doctor Full Name <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="doctorName"
                      value={doctorData.doctorName}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Sarah Jenkins"
                      required
                      className="
                        w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                        text-xs font-medium text-slate-900 placeholder:text-slate-400
                        transition-all duration-150
                        focus:bg-white focus:border-[#08679F]
                        focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>

                  {/* SPECIALIZATION */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Specialization <span className="text-rose-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="specialization"
                      value={doctorData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiology, Pediatrics"
                      required
                      className="
                        w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                        text-xs font-medium text-slate-900 placeholder:text-slate-400
                        transition-all duration-150
                        focus:bg-white focus:border-[#08679F]
                        focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>

                  {/* DEPARTMENT */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Department
                    </label>

                    <select
                      name="department"
                      value={doctorData.department}
                      onChange={handleChange}
                      className="
                        w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                        text-xs font-medium text-slate-900 transition-all duration-150
                        focus:bg-white focus:border-[#08679F]
                        focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                      "
                    >
                      <option value="">Select Department...</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Oncology">Oncology</option>
                    </select>
                  </div>

                  {/* EXPERIENCE */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Experience (Years)
                    </label>

                    <input
                      type="number"
                      name="experience"
                      value={doctorData.experience}
                      onChange={handleChange}
                      min="0"
                      max="60"
                      placeholder="e.g. 8"
                      className="
                        w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                        text-xs font-medium text-slate-900 placeholder:text-slate-400
                        transition-all duration-150
                        focus:bg-white focus:border-[#08679F]
                        focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>

                  {/* PHONE */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={doctorData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="
                        w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                        text-xs font-medium text-slate-900 placeholder:text-slate-400
                        transition-all duration-150
                        focus:bg-white focus:border-[#08679F]
                        focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={doctorData.email}
                      onChange={handleChange}
                      placeholder="doctor@hospital.org"
                      className="
                        w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50
                        text-xs font-medium text-slate-900 placeholder:text-slate-400
                        transition-all duration-150
                        focus:bg-white focus:border-[#08679F]
                        focus:outline-none focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>

                </div>

                {/* FORM ACTIONS */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">

                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl
                      bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold
                      shadow-md shadow-[#08679F]/20 transition-all duration-150
                      hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
                      focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    "
                  >
                    {saving ? (
                      <>
                        <svg
                          className="animate-spin h-3.5 w-3.5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>

                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>

                        <span>Updating Profile...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/doctors/${id}`)}
                    className="
                      inline-flex items-center justify-center h-10 px-5 rounded-xl
                      bg-white border border-slate-200 text-slate-700
                      hover:bg-slate-50 hover:border-slate-300
                      text-xs font-semibold transition-all duration-150
                      active:scale-[0.99]
                      focus:outline-none focus:ring-4 focus:ring-slate-100
                    "
                  >
                    Cancel
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EditDoctor;