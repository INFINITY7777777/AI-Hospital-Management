import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground.jsx";

function PageBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-4 sm:p-6 lg:p-8">
      <MedicalPlusBackground />

      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function EditBed() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bedData, setBedData] = useState({
    bedNumber: "",
    ward: "",
    bedType: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // 3D Tilt & Spotlight State
  const formCardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchBed = async () => {
      try {
        const response = await api.get(`/beds/${id}`);
        const bed = response.data.bed;

        setBedData({
          bedNumber: bed.bed_number || "",
          ward: bed.ward || "",
          bedType: bed.bed_type || "",
          status: bed.status || "",
        });
      } catch (error) {
        console.error("Error fetching bed:", error);
        setError(error.response?.data?.error || "Failed to fetch bed");
      } finally {
        setLoading(false);
      }
    };

    fetchBed();
  }, [id]);

  const handleCardMouseMove = (event) => {
    const card = formCardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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

    try {
      setUpdating(true);
      setError("");

      await api.put(`/beds/${id}`, {
        bedNumber: bedData.bedNumber,
        ward: bedData.ward,
        bedType: bedData.bedType,
        status: bedData.status,
      });

      alert("Bed updated successfully");
      navigate("/beds");
    } catch (error) {
      console.error("Error updating bed:", error);
      setError(error.response?.data?.error || "Failed to update bed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-9 w-36 bg-slate-200/80 rounded-xl animate-pulse" />
          <div className="border-b border-slate-200/80 pb-5">
            <div className="h-8 w-48 bg-slate-200/80 rounded-lg animate-pulse" />
          </div>
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-6 h-96 animate-pulse" />
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link
            to="/beds"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/80 border border-slate-200 text-[#08679F] hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.99]"
          >
            <svg
              className="h-3.5 w-3.5 text-[#08679F]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Beds
          </Link>
        </div>

        {/* PAGE HEADER */}
        <div className="border-b border-slate-200/80 pb-5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Edit Bed
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Update bed details, ward assignment, or maintenance status.
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-xs font-medium text-rose-700">
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 3D FORM CARD */}
        <div className="perspective-[1000px]">
          <form
            ref={formCardRef}
            onSubmit={handleSubmit}
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => {
              setIsCardHovered(false);
              setCardRotate({ x: 0, y: 0 });
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-5"
            style={{
              transform: isCardHovered
                ? `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) translateZ(8px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isCardHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
          >
            {/* Dynamic Spotlight Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isCardHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300 z-20"
              style={{
                opacity: isCardHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10 space-y-5">
              {/* BED NUMBER */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bed Number
                </label>
                <input
                  type="text"
                  name="bedNumber"
                  value={bedData.bedNumber}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 placeholder:text-slate-400"
                />
              </div>

              {/* WARD */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ward
                </label>
                <input
                  type="text"
                  name="ward"
                  value={bedData.ward}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 placeholder:text-slate-400"
                />
              </div>

              {/* BED TYPE */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bed Type
                </label>
                <select
                  name="bedType"
                  value={bedData.bedType}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10"
                >
                  <option value="">Select Bed Type</option>
                  <option value="General">General</option>
                  <option value="ICU">ICU</option>
                  <option value="Private">Private</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={bedData.status}
                  onChange={handleChange}
                  disabled={bedData.status === "Occupied"}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 transition-all duration-150 shadow-xs focus:border-[#08679F] focus:outline-none focus:ring-4 focus:ring-[#08679F]/10 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  {bedData.status === "Occupied" && (
                    <option value="Occupied">Occupied</option>
                  )}
                </select>

                {bedData.status === "Occupied" && (
                  <p className="text-[11px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                    <span>⚠️</span>
                    Occupied beds cannot be status-edited directly. Use "Release Bed" from Bed Management.
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={updating}
                  className="group relative overflow-hidden inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md shadow-[#08679F]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:opacity-50"
                >
                  <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <span className="relative z-10">{updating ? "Updating..." : "Update Bed"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/beds")}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all duration-150 active:scale-[0.99]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageBackground>
  );
}

export default EditBed;