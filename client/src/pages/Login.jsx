import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import MedicalPlusBackground from "../components/MedicalPlusBackground";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Left Card 3D Tilt & Spotlight state
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

  // Right Card 3D Tilt & Spotlight state
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = { email: email.trim() };

      if (usePassword) {
        payload.password = password;
      } else {
        payload.mpin = mpin;
      }

      const response = await api.post("/auth/login", payload);

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("The server returned an invalid login response.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Login failed. Please try again."
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
        <div className="w-full max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left Login card container with 3D perspective */}
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
                className="animate-login-card relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/80 p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-9 hover:border-[#08679F]/40 hover:shadow-[0_20px_50px_rgba(8,103,159,0.12)]"
              >
                {/* Dynamic Spotlight Glow effect inside left card */}
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
                <div className="relative z-10 mb-6 flex justify-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-linear-to-br from-blue-50 to-slate-50 shadow-sm">
                    <div className="relative">
                      <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-[#08679F]" />
                      <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-[#08679F]" />
                    </div>
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                </div>

                {/* Heading */}
                <div className="relative z-10 mb-7 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Welcome Back
                  </h1>
                  <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                    Hospital Management System
                  </p>
                </div>

                {/* Authentication method switcher */}
                <div className="relative z-10 mb-6 rounded-xl border border-slate-200/60 bg-slate-100/90 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUsePassword(false);
                        setErrorMessage("");
                      }}
                      className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                        !usePassword
                          ? "bg-white text-[#08679F] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="5" y="3" width="14" height="18" rx="2" />
                          <circle cx="9" cy="8" r="1" />
                          <circle cx="15" cy="8" r="1" />
                          <circle cx="9" cy="13" r="1" />
                          <circle cx="15" cy="13" r="1" />
                          <circle cx="9" cy="18" r="1" />
                          <circle cx="15" cy="18" r="1" />
                        </svg>
                        4-Digit MPIN
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUsePassword(true);
                        setErrorMessage("");
                      }}
                      className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                        usePassword
                          ? "bg-white text-[#08679F] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="3" y="10" width="18" height="11" rx="2" />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>
                        Password
                      </span>
                    </button>
                  </div>
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin} className="relative z-10 space-y-4">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <svg
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                      </svg>

                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                      />
                    </div>
                  </div>

                  {/* MPIN field */}
                  {!usePassword ? (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label
                          htmlFor="mpin"
                          className="text-xs font-semibold text-slate-700"
                        >
                          4-6 Digit Security MPIN
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setUsePassword(true);
                            setErrorMessage("");
                          }}
                          className="text-xs font-semibold text-[#08679F] transition-colors hover:text-[#07557F]"
                        >
                          Forgot MPIN?
                        </button>
                      </div>

                      <div className="relative">
                        <svg
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="3" y="10" width="18" height="11" rx="2" />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>

                        <input
                          id="mpin"
                          type="password"
                          maxLength={6}
                          autoComplete="current-password"
                          required
                          inputMode="numeric"
                          pattern="[0-9]{4,6}"
                          placeholder="Enter your MPIN"
                          value={mpin}
                          onChange={(e) =>
                            setMpin(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 font-mono text-sm tracking-[0.35em] text-slate-800 outline-none transition-all duration-150 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                        />
                      </div>

                      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                        Enter your security PIN to continue.
                      </p>
                    </div>
                  ) : (
                    /* Password field */
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-xs font-semibold text-slate-700"
                        >
                          Account Password
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setUsePassword(false);
                            setErrorMessage("");
                          }}
                          className="text-xs font-semibold text-[#08679F] transition-colors hover:text-[#07557F]"
                        >
                          Use MPIN instead
                        </button>
                      </div>

                      <div className="relative">
                        <svg
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect x="3" y="10" width="18" height="11" rx="2" />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>

                        <input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {errorMessage && (
                    <div
                      role="alert"
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700"
                    >
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative overflow-hidden mt-2 h-11 w-full rounded-xl bg-[#08679F] px-5 text-sm font-semibold text-white shadow-md shadow-[#08679F]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#07557F] hover:shadow-[0_10px_25px_-5px_rgba(8,103,159,0.4)] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-[#08679F]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 rounded-xl border border-white/20 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <span className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      {loading ? "Authenticating..." : "Authenticate"}

                      {!loading && (
                        <svg
                          className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:scale-110"
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
                </form>

                {/* Register New User Link */}
                <div className="relative z-10 mt-5 border-t border-slate-100 pt-4 text-center text-xs font-medium text-slate-500">
                  Need a staff account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#08679F] transition-colors hover:text-[#07557F]"
                  >
                    Register New User
                  </Link>
                </div>

                {/* Status footer */}
                <div className="relative z-10 mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Clinical workspace ready
                </div>
              </div>
            </section>

            {/* Right visual panel with 3D perspective & Cursor Spotlight */}
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
                  {/* Dynamic Spotlight Glow Effect */}
                  <div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isRightHovered ? 1 : 0,
                      background: `radial-gradient(600px circle at ${rightMousePos.x}px ${rightMousePos.y}px, rgba(8, 103, 159, 0.08), transparent 80%)`,
                    }}
                  />

                  {/* Border Light Highlight */}
                  <div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
                    style={{
                      opacity: isRightHovered ? 1 : 0,
                      background: `radial-gradient(400px circle at ${rightMousePos.x}px ${rightMousePos.y}px, rgba(8, 103, 159, 0.25), transparent 100%)`,
                      maskImage: "linear-gradient(#black, #black) content-box, linear-gradient(#black, #black)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                  />

                  {/* Decorative accents */}
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#08679F]/10 blur-2xl" />
                  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-2xl" />

                  <div className="relative z-10">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#08679F] text-white shadow-md shadow-[#08679F]/20">
                      <div className="relative h-6 w-6">
                        <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-white" />
                        <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-white" />
                      </div>
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#08679F]">
                      Modern Clinical Workspace
                    </p>

                    <h2 className="max-w-lg text-2xl font-bold leading-tight tracking-tight text-slate-900 xl:text-3xl">
                      Everything your clinical team needs,
                      <span className="text-[#08679F]">
                        {" "}in one workspace.
                      </span>
                    </h2>

                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
                      Manage patients, appointments, clinical notes, admissions,
                      and hospital workflows through one unified, centralized
                      system.
                    </p>

                    {/* Feature cards with subtle hover lift */}
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      <div className="group/card rounded-xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-[#08679F]/30 hover:shadow-md">
                        <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#08679F] transition-transform duration-200 group-hover/card:scale-110">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Patients
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Records &amp; History
                        </p>
                      </div>

                      <div className="group/card rounded-xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-md">
                        <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 transition-transform duration-200 group-hover/card:scale-110">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect x="3" y="4" width="18" height="17" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Appointments
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Scheduling
                        </p>
                      </div>

                      <div className="group/card rounded-xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-md">
                        <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-[#6366F1] transition-transform duration-200 group-hover/card:scale-110">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Clinical AI
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Summaries &amp; Chat
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating status badge */}
                <div className="animate-float absolute -bottom-4 right-6 hidden items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-md backdrop-blur-md xl:flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      System Active
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      Secure login connection
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Animation styles */}
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

        @keyframes floatElement {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-login-card {
          animation: loginCardIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-float {
          animation: floatElement 3.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-login-card,
          .animate-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;