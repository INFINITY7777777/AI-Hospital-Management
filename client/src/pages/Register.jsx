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

            setSuccess(
                "Account created successfully! Redirecting to login..."
            );

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
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">

            {/* Main container */}
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">

                <div className="w-full">

                    {/* Brand */}
                    <div className="mb-6 text-center">

                        {/* Simple medical mark */}
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/20">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-5 w-5 text-white"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    d="M12 5v14M5 12h14"
                                />
                            </svg>
                        </div>

                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                            Hospital Management System
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Create your staff account
                        </p>
                    </div>

                    {/* Registration card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        {/* Card heading */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Create staff account
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Enter your details to access the hospital system.
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="mt-0.5 h-5 w-5 shrink-0"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path
                                        strokeLinecap="round"
                                        d="M12 8v4M12 16h.01"
                                    />
                                </svg>

                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success message */}
                        {success && (
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="mt-0.5 h-5 w-5 shrink-0"
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

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="full_name"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Dr. Sarah Connor"
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="sarah@hospital.com"
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            {/* Password + MPIN */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter password"
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="mpin"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Security MPIN
                                    </label>

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
                                        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm tracking-widest text-slate-900 outline-none transition duration-200 placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Staff Role
                                </label>

                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                >
                                    <option value="doctor">Doctor</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
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
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 12h14M13 6l6 6-6 6"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>

                        </form>

                        {/* Login */}
                        <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                            Already have an account?{" "}

                            <Link
                                to="/"
                                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                            >
                                Sign in
                            </Link>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Register;