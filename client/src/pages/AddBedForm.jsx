import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function AddBedForm() {
  const navigate = useNavigate();

  const [bedData, setBedData] = useState({
    bedNumber: "",
    ward: "",
    bedType: "General",
    status: "Available",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Card 3D Tilt & Spotlight state
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
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setCardRotate({ x: rotateX, y: rotateY });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setBedData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      // Map camelCase form state to snake_case backend expectations
      const payload = {
        bed_number: bedData.bedNumber,
        ward: bedData.ward,
        bed_type: bedData.bedType,
        status: bedData.status,
      };

      const response = await api.post("/beds", payload);

      if (response.data?.success) {
        alert("Bed added successfully");
        navigate("/beds");
      }
    } catch (err) {
      console.error("Error adding bed:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to add bed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans text-slate-900">
      {/* Interactive Medical + Canvas Hover Effect */}
      <MedicalPlusBackground />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 lg:px-10">
        <div className="w-full max-w-xl perspective-[1000px]">
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
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="animate-form-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-9 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-6"
          >
            {/* Dynamic Spotlight Glow effect */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Card Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage:
                  "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            {/* Top Bar: Back Link */}
            <div className="relative z-10 flex items-center justify-between">
              <Link
                to="/beds"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200 text-[#08679F] hover:bg-white hover:border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <svg
                  className="h-3.5 w-3.5 text-[#08679F]"
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
                Back to Bed Management
              </Link>
            </div>

            {/* Medical Icon & Header */}
            <div className="relative z-10 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-linear-to-br from-blue-50 to-slate-50 shadow-sm">
                  <div className="relative">
                    <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-[#08679F]" />
                    <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-[#08679F]" />
                  </div>
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Add New Bed
              </h1>
              <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                Register a new hospital bed to expand ward capacity.
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div
                role="alert"
                className="relative z-10 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700"
              >
                <div className="flex items-center gap-2.5">
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
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              {/* BED NUMBER */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Bed Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bedNumber"
                  value={bedData.bedNumber}
                  onChange={handleChange}
                  placeholder="e.g. B-101"
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>

              {/* WARD */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Ward <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ward"
                  value={bedData.ward}
                  onChange={handleChange}
                  placeholder="e.g. General Ward"
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                />
              </div>

              {/* BED TYPE */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Bed Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="bedType"
                  value={bedData.bedType}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                >
                  <option value="General">General</option>
                  <option value="ICU">ICU</option>
                  <option value="Private">Private</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Status
                </label>
                <select
                  name="status"
                  value={bedData.status}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-800 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative overflow-hidden h-11 flex-1 rounded-xl bg-[#08679F] px-5 text-sm font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <span className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {loading ? "Adding..." : "Add Bed"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/beds")}
                  className="h-11 px-5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-sm font-semibold transition-all duration-150 active:scale-[0.99]"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Status footer */}
            <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Clinical workspace ready
            </div>
          </div>
        </div>
      </main>

      {/* Animation styles */}
      <style>{`
        @keyframes formCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-form-card {
          animation: formCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-form-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default AddBedForm;