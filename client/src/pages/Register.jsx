import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    mpin: "",
    role: "doctor",
    phone: "",
    specialization: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 3D Tilt & Spotlight state for Left Card
  const leftCardRef = useRef(null);
  const [leftMousePos, setLeftMousePos] = useState({ x: 0, y: 0 });
  const [leftCardRotate, setLeftCardRotate] = useState({ x: 0, y: 0 });
  const [isLeftHovered, setIsLeftHovered] = useState(false);

  const handleMouseMoveLeftCard = (e) => {
    if (!leftCardRef.current) return;
    const rect = leftCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setLeftMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setLeftCardRotate({ x: rotateX, y: rotateY });
  };

  // 3D Tilt & Spotlight state for Right Panel
  const rightCardRef = useRef(null);
  const [rightMousePos, setRightMousePos] = useState({ x: 0, y: 0 });
  const [rightCardRotate, setRightCardRotate] = useState({ x: 0, y: 0 });
  const [isRightHovered, setIsRightHovered] = useState(false);

  const handleMouseMoveRightCard = (e) => {
    if (!rightCardRef.current) return;
    const rect = rightCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRightMousePos({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setRightCardRotate({ x: rotateX, y: rotateY });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Minimum 8 characters password validation
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      const { token, user } = response.data;

      // Store credentials if provided by backend, then navigate to dashboard
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      setSuccess("Account created successfully! Redirecting to Dashboard...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err.response?.data);

      const serverError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to register account.";

      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FC] font-sans text-slate-900">
      {/* Interactive Canvas Background Effect */}
      <MedicalPlusBackground />

      {/* Background decoration matching Login visual family */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-white/70 via-[#F6F8FC]/60 to-[#F8FAFC]/80" />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 lg:px-10">
        <div className="w-full max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            
            {/* Left Register card container with 3D perspective */}
            <section className="mx-auto w-full max-w-md lg:mx-0 perspective-[1000px]">
              <div
                ref={leftCardRef}
                onMouseMove={handleMouseMoveLeftCard}
                onMouseEnter={() => setIsLeftHovered(true)}
                onMouseLeave={() => {
                  setIsLeftHovered(false);
                  setLeftCardRotate({ x: 0, y: 0 });
                }}
                style={{
                  transform: isLeftHovered
                    ? `rotateX(${leftCardRotate.x}deg) rotateY(${leftCardRotate.y}deg) translateZ(10px)`
                    : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                  transition: isLeftHovered
                    ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                    : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                }}
                className="animate-register-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
              >
                {/* Dynamic Spotlight Glow effect inside card */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                  style={{
                    opacity: isLeftHovered ? 1 : 0,
                    background: `radial-gradient(500px circle at ${leftMousePos.x}px ${leftMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                  }}
                />

                {/* Card Border Light Highlight */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-300"
                  style={{
                    opacity: isLeftHovered ? 1 : 0,
                    background: `radial-gradient(350px circle at ${leftMousePos.x}px ${leftMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                    maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                />

                {/* Medical logo */}
                <div className="relative z-10 mb-5 flex justify-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-linear-to-br from-blue-50 to-slate-50 shadow-sm">
                    <div className="relative">
                      <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-[#08679F]" />
                      <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-[#08679F]" />
                    </div>
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                </div>

                {/* Heading */}
                <div className="relative z-10 mb-6 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Create Staff Account
                  </h1>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                    Hospital Management System
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="relative z-10 mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700 animate-fade-in">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Alert */}
                {success && (
                  <div className="relative z-10 mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs font-medium text-emerald-700 animate-fade-in">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="m8 12 2.5 2.5L16 9" />
                    </svg>
                    <span>{success}</span>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="relative z-10 space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="full_name" className="mb-1 block text-xs font-semibold text-slate-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="full_name"
                        type="text"
                        name="full_name"
                        required
                        placeholder="Dr. Sarah Connor"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="sarah@hospital.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Password & MPIN grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">
                        Password (Min 8 chars)
                      </label>
                      <div className="relative">
                        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="10" width="18" height="11" rx="2" />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>
                        <input
                          id="password"
                          type="password"
                          name="password"
                          required
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mpin" className="mb-1 block text-xs font-semibold text-slate-700">
                        Security MPIN
                      </label>
                      <div className="relative">
                        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="5" y="3" width="14" height="18" rx="2" />
                          <circle cx="9" cy="8" r="1" />
                          <circle cx="15" cy="8" r="1" />
                          <circle cx="9" cy="13" r="1" />
                          <circle cx="15" cy="13" r="1" />
                        </svg>
                        <input
                          id="mpin"
                          type="password"
                          name="mpin"
                          maxLength="6"
                          required
                          inputMode="numeric"
                          placeholder="4-6 digits"
                          value={formData.mpin}
                          onChange={(e) => setFormData({ ...formData, mpin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                          className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 font-mono text-xs tracking-widest text-slate-800 outline-none transition-all duration-150 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Staff Role */}
                  <div>
                    <label htmlFor="role" className="mb-1 block text-xs font-semibold text-slate-700">
                      Staff Role
                    </label>
                    <div className="relative">
                      <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-10 text-xs text-slate-800 outline-none transition-all duration-150 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10 sm:text-sm"
                      >
                        <option value="doctor">Doctor</option>
                        <option value="staff">Staff</option>
                        <option value="nurse">Nurse</option>
                        <option value="admin">Admin</option>
                      </select>
                      <svg className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative overflow-hidden mt-3 h-11 w-full rounded-xl bg-[#08679F] px-5 text-sm font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      {loading ? "Creating Account..." : "Create Account"}

                      {!loading && (
                        <svg className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      )}
                    </span>
                  </button>
                </form>

                {/* Back to Login Link */}
                <div className="relative z-10 mt-5 border-t border-slate-100 pt-4 text-center text-xs font-medium text-slate-500">
                  Already have an account?{" "}
                  <Link to="/" className="font-semibold text-[#08679F] transition-colors hover:text-[#07557F]">
                    Sign in
                  </Link>
                </div>
              </div>
            </section>

            {/* Right Visual panel */}
            <section className="hidden items-center justify-center lg:flex perspective-[1000px]">
              <div className="relative w-full max-w-xl">
                <div
                  ref={rightCardRef}
                  onMouseMove={handleMouseMoveRightCard}
                  onMouseEnter={() => setIsRightHovered(true)}
                  onMouseLeave={() => {
                    setIsRightHovered(false);
                    setRightCardRotate({ x: 0, y: 0 });
                  }}
                  style={{
                    transform: isRightHovered
                      ? `rotateX(${rightCardRotate.x}deg) rotateY(${rightCardRotate.y}deg) translateZ(10px)`
                      : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isRightHovered
                      ? "transform 0.1s ease-out, box-shadow 0.3s ease-out"
                      : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
                  }}
                  className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/60 p-9 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
                >
                  <div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isRightHovered ? 1 : 0,
                      background: `radial-gradient(600px circle at ${rightMousePos.x}px ${rightMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#08679F] text-white shadow-md shadow-[#08679F]/20">
                      <div className="relative h-6 w-6">
                        <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-white" />
                        <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-white" />
                      </div>
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#08679F]">
                      Staff Onboarding &amp; Registration
                    </p>

                    <h2 className="max-w-lg text-2xl font-bold leading-tight tracking-tight text-slate-900 xl:text-3xl">
                      Join the connected,
                      <span className="text-[#08679F]"> digital hospital system.</span>
                    </h2>

                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
                      Instantly grant staff authorization to manage medical records, patient admissions, pharmacy inventory, and real-time clinical workflows.
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes registerCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-register-card {
          animation: registerCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-fade-in {
          animation: fadeIn 200ms ease-out both;
        }
      `}</style>
    </div>
  );
}

export default Register;