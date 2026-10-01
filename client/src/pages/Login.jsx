import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [usePassword, setUsePassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const payload = { email };

      if (usePassword) {
        payload.password = password;
      } else {
        payload.mpin = mpin;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        payload
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login Failed!");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="absolute -bottom-45 left-1/3 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="absolute inset-0 bg-linear-to-br from-white via-slate-50/80 to-blue-50/70" />
      </div>

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-5 py-10 lg:px-10">
        <div className="w-full max-w-6xl">

          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">

            {/* =========================================================
                LEFT - LOGIN CARD
            ========================================================== */}
            <section className="w-full max-w-md mx-auto lg:mx-0">

              <div
                className="
                  rounded-[28px]
                  border border-white/70
                  bg-white/75
                  p-7 sm:p-9
                  shadow-[0_25px_70px_rgba(15,23,42,0.12)]
                  backdrop-blur-2xl
                  animate-login-card
                "
              >

                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div
                    className="
                      relative
                      flex h-14 w-14 items-center justify-center
                      rounded-2xl
                      border border-blue-100
                      bg-gradient-to-rbg-gradient-to-br from-blue-50 to-cyan-50
                      shadow-sm
                    "
                  >
                    <div className="relative">
                      {/* Medical cross */}
                      <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-blue-600" />
                      <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-blue-600" />
                    </div>

                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                </div>

                {/* Heading */}
                <div className="text-center mb-7">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    Welcome Back!
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    Hospital Management System
                  </p>
                </div>

                {/* Authentication method switch */}
                <div className="mb-6 rounded-xl bg-slate-100/80 p-1 border border-slate-200/70">
                  <div className="grid grid-cols-2 gap-1">

                    <button
                      type="button"
                      onClick={() => setUsePassword(false)}
                      className={`
                        rounded-lg px-3 py-2.5
                        text-xs sm:text-sm font-medium
                        transition-all duration-200
                        ${
                          !usePassword
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }
                      `}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            x="5"
                            y="3"
                            width="14"
                            height="18"
                            rx="2"
                          />
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
                      onClick={() => setUsePassword(true)}
                      className={`
                        rounded-lg px-3 py-2.5
                        text-xs sm:text-sm font-medium
                        transition-all duration-200
                        ${
                          usePassword
                            ? "bg-white text-blue-700 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }
                      `}
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            x="3"
                            y="10"
                            width="18"
                            height="11"
                            rx="2"
                          />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>

                        Password
                      </span>
                    </button>

                  </div>
                </div>

                {/* Login form */}
                <form onSubmit={handleLogin} className="space-y-5">

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700"
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
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                        <path d="m3 7 9 6 9-6" />
                      </svg>

                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                          w-full
                          rounded-xl
                          border border-slate-200
                          bg-white/80
                          py-3.5 pl-11 pr-4
                          text-sm text-slate-800
                          placeholder:text-slate-400
                          outline-none
                          transition-all duration-200
                          focus:border-blue-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-blue-500/10
                        "
                      />
                    </div>
                  </div>

                  {/* MPIN */}
                  {!usePassword ? (
                    <div>

                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="mpin"
                          className="text-sm font-medium text-slate-700"
                        >
                          4-Digit Security MPIN
                        </label>

                        <button
                          type="button"
                          onClick={() => setUsePassword(true)}
                          className="
                            text-xs font-medium
                            text-blue-600
                            transition-colors
                            hover:text-blue-700
                          "
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
                          <rect
                            x="3"
                            y="10"
                            width="18"
                            height="11"
                            rx="2"
                          />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>

                        <input
                          id="mpin"
                          type="password"
                          maxLength={6}
                          required
                          inputMode="numeric"
                          placeholder="Enter your MPIN"
                          value={mpin}
                          onChange={(e) => setMpin(e.target.value)}
                          className="
                            w-full
                            rounded-xl
                            border border-slate-200
                            bg-white/80
                            py-3.5 pl-11 pr-4
                            text-sm
                            tracking-[0.35em]
                            font-mono
                            text-slate-800
                            placeholder:text-slate-400
                            placeholder:tracking-normal
                            placeholder:font-sans
                            outline-none
                            transition-all duration-200
                            focus:border-blue-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-blue-500/10
                          "
                        />
                      </div>

                      <p className="mt-2 text-[11px] text-slate-400">
                        Enter your security PIN to continue.
                      </p>

                    </div>
                  ) : (

                    /* PASSWORD */
                    <div>

                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-slate-700"
                        >
                          Account Password
                        </label>

                        <button
                          type="button"
                          onClick={() => setUsePassword(false)}
                          className="
                            text-xs font-medium
                            text-blue-600
                            transition-colors
                            hover:text-blue-700
                          "
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
                          <rect
                            x="3"
                            y="10"
                            width="18"
                            height="11"
                            rx="2"
                          />
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        </svg>

                        <input
                          id="password"
                          type="password"
                          required
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="
                            w-full
                            rounded-xl
                            border border-slate-200
                            bg-white/80
                            py-3.5 pl-11 pr-4
                            text-sm
                            text-slate-800
                            placeholder:text-slate-400
                            outline-none
                            transition-all duration-200
                            focus:border-blue-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-blue-500/10
                          "
                        />
                      </div>

                    </div>
                  )}

                  {/* Authenticate */}
                  <button
                    type="submit"
                    className="
                      group
                      relative
                      w-full
                      overflow-hidden
                      rounded-xl
                      bg-linear-to-r
                      from-blue-700
                      to-blue-600
                      px-5
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-blue-600/20
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-xl
                      hover:shadow-blue-600/25
                      active:translate-y-0
                      active:scale-[0.99]
                      focus:outline-none
                      focus:ring-4
                      focus:ring-blue-500/20
                    "
                  >
                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      Authenticate

                      <svg
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  </button>

                </form>

                {/* Small footer */}
                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Hospital staff access
                </div>

              </div>
            </section>

            {/* =========================================================
                RIGHT - VISUAL PANEL
            ========================================================== */}
            <section className="hidden lg:flex items-center justify-center">

              <div className="relative w-full max-w-xl">

                {/* Decorative glass panel */}
                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[36px]
                    border border-white/70
                    bg-white/45
                    p-10
                    shadow-[0_30px_80px_rgba(15,23,42,0.08)]
                    backdrop-blur-2xl
                  "
                >

                  {/* Background circles */}
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-200/40 blur-2xl" />
                  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-200/30 blur-2xl" />

                  <div className="relative">

                    {/* Medical icon */}
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">

                      <div className="relative h-7 w-7">
                        <span className="absolute left-1/2 top-0 h-7 w-2 -translate-x-1/2 rounded-full bg-white" />
                        <span className="absolute left-0 top-1/2 h-2 w-7 -translate-y-1/2 rounded-full bg-white" />
                      </div>

                    </div>

                    <p className="mb-3 text-sm font-medium text-blue-600">
                      Hospital Management System
                    </p>

                    <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-slate-900 xl:text-4xl">
                      Everything your clinical team needs,
                      <span className="text-blue-600">
                        {" "}in one workspace.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">
                      Manage patients, appointments, clinical information,
                      admissions and hospital workflows through one
                      centralized system.
                    </p>

                    {/* Feature cards */}
                    <div className="mt-8 grid grid-cols-3 gap-3">

                      <div className="rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur-xl">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

                        <p className="mt-1 text-[11px] text-slate-400">
                          Records
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur-xl">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
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

                        <p className="mt-1 text-[11px] text-slate-400">
                          Scheduling
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur-xl">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
                          Clinical Notes
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Collaboration
                        </p>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Decorative floating element */}
                <div
                  className="
                    absolute
                    -bottom-5
                    right-8
                    hidden
                    rounded-2xl
                    border
                    border-white/80
                    bg-white/75
                    px-4
                    py-3
                    shadow-lg
                    backdrop-blur-xl
                    xl:flex
                    items-center
                    gap-3
                    animate-float
                  "
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Clinical workspace
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Ready for staff access
                    </p>
                  </div>
                </div>

              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Custom animations */}
      <style>{`
        @keyframes loginCardIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
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
            transform: translateY(-5px);
          }
        }

        .animate-login-card {
          animation: loginCardIn 550ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .animate-float {
          animation: floatElement 4s ease-in-out infinite;
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