import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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
    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      setSuccess("Account created successfully! Redirecting to login...");

      setFormData({
        full_name: "",
        email: "",
        password: "",
        mpin: "",
        role: "doctor",
        phone: "",
        specialization: "",
        department: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
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
    <div className="min-h-screen relative overflow-hidden bg-[#F6F8FC] text-slate-900 font-sans">
      {/* Background decoration matching Login visual family */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#08679F]/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-br from-[#FFFFFF] via-[#F6F8FC]/80 to-[#F8FAFC]/90" />
      </div>

      {/* Main Container */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl mx-auto">
          
          {/* Card Container */}
          <div
            className="
              rounded-[22px]
              border border-slate-200/80
              bg-white/80
              p-7 sm:p-9
              shadow-[0_8px_30px_rgba(15,23,42,0.04)]
              backdrop-blur-xl
              animate-register-card
            "
          >
            {/* Header / Brand Mark */}
            <div className="text-center mb-7">
              <div className="flex justify-center mb-4">
                <div
                  className="
                    relative
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl
                    border border-slate-100
                    bg-linear-to-br from-blue-50 to-slate-50
                    shadow-sm
                  "
                >
                  <div className="relative">
                    {/* Medical Cross Icon */}
                    <span className="absolute left-1/2 top-0 h-6 w-2 -translate-x-1/2 rounded-full bg-[#08679F]" />
                    <span className="absolute left-0 top-1/2 h-2 w-6 -translate-y-1/2 rounded-full bg-[#08679F]" />
                  </div>
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Create Staff Account
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500">
                Enter details to register for the Hospital Management System
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 px-4 py-3.5 text-xs sm:text-sm font-medium text-rose-700 shadow-sm animate-fade-in">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3.5 text-xs sm:text-sm font-medium text-emerald-700 shadow-sm animate-fade-in">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 12 2.5 2.5L16 9"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Full Name
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Dr. Sarah Connor"
                    className="
                      w-full h-11 rounded-xl border border-slate-300 bg-white
                      py-2.5 pl-11 pr-4 text-sm text-slate-800
                      placeholder:text-slate-400 outline-none
                      transition-all duration-150
                      focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                    "
                  />
                </div>
              </div>

              {/* Email Address */}
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="sarah@hospital.com"
                    className="
                      w-full h-11 rounded-xl border border-slate-300 bg-white
                      py-2.5 pl-11 pr-4 text-sm text-slate-800
                      placeholder:text-slate-400 outline-none
                      transition-all duration-150
                      focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                    "
                  />
                </div>
              </div>

              {/* Password & Security MPIN Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter password"
                      className="
                        w-full h-11 rounded-xl border border-slate-300 bg-white
                        py-2.5 pl-11 pr-4 text-sm text-slate-800
                        placeholder:text-slate-400 outline-none
                        transition-all duration-150
                        focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>
                </div>

                {/* MPIN */}
                <div>
                  <label
                    htmlFor="mpin"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Security MPIN
                  </label>
                  <div className="relative">
                    <svg
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                    </svg>
                    <input
                      id="mpin"
                      type="password"
                      name="mpin"
                      maxLength="6"
                      value={formData.mpin}
                      onChange={handleChange}
                      required
                      placeholder="4–6 digits"
                      inputMode="numeric"
                      className="
                        w-full h-11 rounded-xl border border-slate-300 bg-white
                        py-2.5 pl-11 pr-4 text-sm font-mono tracking-widest text-slate-800
                        placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 outline-none
                        transition-all duration-150
                        focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                      "
                    />
                  </div>
                </div>
              </div>

              {/* Staff Role Select */}
              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Staff Role
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="
                      w-full h-11 rounded-xl border border-slate-300 bg-white
                      py-2.5 pl-11 pr-10 text-sm text-slate-800
                      outline-none transition-all duration-150
                      focus:border-[#08679F] focus:ring-4 focus:ring-[#08679F]/10
                      appearance-none
                    "
                  >
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group relative w-full h-11 mt-2 rounded-xl
                  bg-[#08679F] hover:bg-[#07557F] px-5
                  text-sm font-semibold text-white shadow-md shadow-[#08679F]/20
                  transition-all duration-150
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#08679F]/25
                  active:translate-y-0 active:scale-[0.99]
                  disabled:cursor-not-allowed disabled:bg-[#08679F]/60 disabled:hover:translate-y-0
                  focus:outline-none focus:ring-4 focus:ring-[#08679F]/20
                "
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-30"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg
                        className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

            </form>

            {/* Back to Login Link */}
            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs sm:text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-[#08679F] transition-colors hover:text-[#07557F]"
              >
                Sign in
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* Embedded Style Animations */}
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

        @media (prefers-reduced-motion: reduce) {
          .animate-register-card,
          .animate-fade-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;