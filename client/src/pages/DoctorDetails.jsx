import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  
  // Initialize state directly from localStorage to prevent set-state-in-effect warning
  const [currentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.error("Failed to parse stored user", e);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Hero Card 3D Tilt & Spotlight state
  const heroCardRef = useRef(null);
  const [heroMousePos, setHeroMousePos] = useState({ x: 0, y: 0 });
  const [heroCardRotate, setHeroCardRotate] = useState({ x: 0, y: 0 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const handleMouseMoveHeroCard = (e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHeroMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setHeroCardRotate({ x: rotateX, y: rotateY });
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/doctors/${id}`);
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

  // Determine if the logged-in user is an admin or viewing their OWN doctor profile
  const userRole = String(currentUser?.role || "").toLowerCase();
  const isAdmin = userRole === "admin";
  const isDoctor = userRole === "doctor";

  const isSelf =
    isDoctor &&
    doctor &&
    currentUser &&
    (currentUser.email?.toLowerCase().trim() === doctor.email?.toLowerCase().trim() ||
      currentUser.full_name?.toLowerCase().trim() === doctor.doctor_name?.toLowerCase().trim());

  const canEdit = isAdmin || isSelf;
  const canDelete = isAdmin;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/doctors/${id}`);
      alert("Doctor record deleted successfully.");
      navigate("/doctors");
    } catch (err) {
      console.error("[DoctorDetails] Error deleting doctor:", err);
      alert(err.response?.data?.error || "Failed to delete doctor.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-6">
        <MedicalPlusBackground />

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <div className="h-11 w-40 bg-slate-200/70 rounded-xl animate-pulse"></div>
          <div className="rounded-[22px] border border-slate-200 bg-white/80 backdrop-blur-xl p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans antialiased text-slate-900 p-6">
        <MedicalPlusBackground />

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
          <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-600 text-sm font-semibold backdrop-blur-md"
          >
            Back to Doctors
          </Link>
          <div className="rounded-[22px] border border-rose-200 bg-rose-50/80 backdrop-blur-xl p-8 text-center">
            <h2 className="text-base font-bold text-slate-900">{error || "Doctor Profile Not Found"}</h2>
          </div>
        </div>
      </div>
    );
  }

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
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold shadow-xs backdrop-blur-md transition-all duration-150"
          >
            ← Back to Doctor List
          </Link>
        </div>

        {/* HERO CARD CONTAINER WITH 3D PERSPECTIVE */}
        <div className="perspective-[1000px]">
          <div
            ref={heroCardRef}
            onMouseMove={handleMouseMoveHeroCard}
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => {
              setIsHeroHovered(false);
              setHeroCardRotate({ x: 0, y: 0 });
            }}
            style={{
              transform: isHeroHovered
                ? `rotateX(${heroCardRotate.x}deg) rotateY(${heroCardRotate.y}deg) translateZ(10px)`
                : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
              transition: isHeroHovered
                ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
            }}
            className="relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl transition-colors duration-200 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)] space-y-6"
          >
            {/* Dynamic Spotlight Glow effect inside Hero Card */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHeroHovered ? 1 : 0,
                background: `radial-gradient(600px circle at ${heroMousePos.x}px ${heroMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
              }}
            />

            {/* Border Light Highlight */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
              style={{
                opacity: isHeroHovered ? 1 : 0,
                background: `radial-gradient(400px circle at ${heroMousePos.x}px ${heroMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                maskImage:
                  "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-[#08679F] border border-sky-100 font-bold text-xl">
                    {doctor.doctor_name ? doctor.doctor_name.replace("Dr. ", "").charAt(0) : "D"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
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
                  {canEdit && (
                    <button
                      onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#08679F] hover:bg-[#07557F] text-white text-xs font-semibold shadow-md transition-all"
                    >
                      Edit Doctor
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              {/* PROFILE DETAILS GRID */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Doctor Profile Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Specialization
                    </span>
                    <span className="text-sm font-semibold text-slate-900 block">
                      {doctor.specialization || "Not specified"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Department
                    </span>
                    <span className="text-sm font-semibold text-slate-900 block">
                      {doctor.department || "Not specified"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Clinical Experience
                    </span>
                    <span className="text-sm font-semibold text-slate-900 block">
                      {doctor.experience !== null && doctor.experience !== undefined
                        ? `${doctor.experience} Years`
                        : "Not specified"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Phone Number
                    </span>
                    <span className="text-sm font-semibold text-slate-900 block">
                      {doctor.phone || "Not specified"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40 lg:col-span-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
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
      </div>
    </div>
  );
}

export default DoctorDetails;