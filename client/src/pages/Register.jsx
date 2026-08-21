import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    // Standardized default role value to lowercase "doctor"
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        mpin: "",
        role: "doctor",
        phone: "",
        specialization: "",
        department: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
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
                department: ""
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🏥 HMS Portal
                    </h1>
                    <p className="text-sm text-gray-500">
                        Create a staff account to access the system
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            placeholder="Dr. Sarah Connor"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="sarah@hospital.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Security MPIN (4-6 Digits)
                        </label>
                        <input
                            type="password"
                            name="mpin"
                            maxLength="6"
                            value={formData.mpin}
                            onChange={handleChange}
                            required
                            placeholder="1234"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        />
                    </div>

                    {/* ROLE SELECTOR UPDATED: Form values map to 'admin', 'doctor', 'staff' */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition bg-white"
                        >
                            <option value="doctor">Doctor</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition shadow-sm"
                    >
                        {loading ? "Creating Account..." : "Register Account"}
                    </button>

                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to="/"
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        Sign In
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Register;